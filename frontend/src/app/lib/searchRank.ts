// Pure ranking for the command palette's name search (courses, modules, topics).

export type NameKind = 'course' | 'module' | 'topic';

export interface NameEntry {
  kind: NameKind;
  id: string;
  name: string;
  courseId: string;
  courseName: string;
  moduleId?: string;
  moduleName?: string;
}

export interface NameHit extends NameEntry {
  score: number;
}

interface IndexLike {
  id: string;
  name: string;
  subTopics: { id: string; name: string; topics: { id: string; name: string }[] }[];
}

/** Flatten the names-only course index into searchable entries. */
export function flattenIndex(courses: IndexLike[]): NameEntry[] {
  const out: NameEntry[] = [];
  for (const c of courses) {
    out.push({ kind: 'course', id: c.id, name: c.name, courseId: c.id, courseName: c.name });
    for (const m of c.subTopics) {
      out.push({ kind: 'module', id: m.id, name: m.name, courseId: c.id, courseName: c.name, moduleId: m.id, moduleName: m.name });
      for (const t of m.topics) {
        out.push({ kind: 'topic', id: t.id, name: t.name, courseId: c.id, courseName: c.name, moduleId: m.id, moduleName: m.name });
      }
    }
  }
  return out;
}

export function queryTerms(query: string): string[] {
  return Array.from(new Set(query.trim().toLowerCase().split(/\s+/).filter(Boolean)));
}

/** Score one name against all terms; 0 means no match (every term must match). */
export function scoreName(name: string, terms: string[]): number {
  if (terms.length === 0) return 0;
  const n = name.toLowerCase();
  const words = n.split(/[^a-z0-9+#.]+/).filter(Boolean);
  let score = 0;
  for (const t of terms) {
    const at = n.indexOf(t);
    if (at < 0) return 0;
    if (n === t) score += 1000;
    else if (at === 0) score += 600;
    else if (words.some(w => w.startsWith(t))) score += 400;
    else score += 150;
  }
  if (terms.length > 1 && n.includes(terms.join(' '))) score += 500;
  // Shorter names are closer to the query.
  return score + Math.max(0, 40 - n.length / 2);
}

const KIND_BONUS: Record<NameKind, number> = { course: 30, module: 15, topic: 0 };

export function searchNames(entries: NameEntry[], query: string, limits = { course: 4, module: 5, topic: 10 }): NameHit[] {
  const terms = queryTerms(query);
  if (terms.length === 0) return [];
  const hits: NameHit[] = [];
  for (const e of entries) {
    const s = scoreName(e.name, terms);
    if (s > 0) hits.push({ ...e, score: s + KIND_BONUS[e.kind] });
  }
  hits.sort((a, b) => b.score - a.score);
  const counts: Record<NameKind, number> = { course: 0, module: 0, topic: 0 };
  return hits.filter(h => (counts[h.kind]++ < limits[h.kind]));
}

export interface TextPart { text: string; match: boolean }

/** Split text into matched / unmatched parts for highlighting. */
export function highlightParts(text: string, terms: string[]): TextPart[] {
  const useful = terms.filter(Boolean);
  if (!text || useful.length === 0) return [{ text, match: false }];
  const lower = text.toLowerCase();
  const marks = new Array<boolean>(text.length).fill(false);
  for (const t of useful) {
    let at = lower.indexOf(t);
    while (at >= 0) {
      for (let i = at; i < at + t.length; i++) marks[i] = true;
      at = lower.indexOf(t, at + t.length);
    }
  }
  const parts: TextPart[] = [];
  let start = 0;
  for (let i = 1; i <= text.length; i++) {
    if (i === text.length || marks[i] !== marks[start]) {
      parts.push({ text: text.slice(start, i), match: marks[start] });
      start = i;
    }
  }
  return parts;
}
