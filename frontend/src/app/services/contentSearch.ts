// Full-text search across topic bodies.
//
// The existing search only matched course, module and topic NAMES, so looking for
// "hashmap collision" or "IllegalMonitorStateException" found nothing unless the phrase
// happened to be in a title - even though it is in the content of several topics.
//
// The index is built once, lazily, from the course content (every course is fetched the first time
// the reader searches). Building it walks many MB of HTML, which is why it
// happens off the first keystroke rather than at module load.

import type { Course } from '../data/types';

export interface SearchHit {
  courseId: string;
  courseName: string;
  moduleId: string;
  moduleName: string;
  topicId: string;
  topicName: string;
  /** Text around the first match, for display. */
  snippet: string;
  /** Higher is better. Title matches outrank body matches. */
  score: number;
}

interface IndexEntry {
  courseId: string;
  courseName: string;
  moduleId: string;
  moduleName: string;
  topicId: string;
  topicName: string;
  /** Original-case text, used to cut a readable snippet. */
  text: string;
  /** Lowercased copy of `text`, so searching does not re-lowercase 3 MB per keystroke. */
  haystack: string;
  haystackTitle: string;
}

let index: IndexEntry[] | null = null;
let building: Promise<IndexEntry[]> | null = null;

/** Strip tags and entities so a search for "for loop" is not defeated by "<b>for</b> loop". */
function toPlainText(html: string): string {
  return html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function buildIndex(courses: Course[]): IndexEntry[] {
  const entries: IndexEntry[] = [];
  for (const course of courses) {
    for (const module of course.subTopics) {
      for (const topic of module.topics) {
        const blocks = [
          ...(topic.beginner || []),
          ...(topic.intermediate || []),
          ...(topic.expert || []),
        ];
        const parts: string[] = [];
        for (const b of blocks) {
          if (b.content) parts.push(toPlainText(b.content));
          // Code is worth searching: people look for a method name they half-remember.
          if (b.codeExamples) for (const c of b.codeExamples) parts.push(c);
        }
        const text = parts.join(' ');
        entries.push({
          courseId: course.id,
          courseName: course.name,
          moduleId: module.id,
          moduleName: module.name,
          topicId: topic.id,
          topicName: topic.name,
          text,
          haystack: text.toLowerCase(),
          haystackTitle: (topic.name + ' ' + module.name + ' ' + course.name).toLowerCase(),
        });
      }
    }
  }
  return entries;
}

/**
 * Build the index without blocking the first paint or the keystroke that triggered it.
 * Yielding between courses keeps the main thread responsive on low-end devices.
 */
export function ensureIndex(courses: Course[]): Promise<IndexEntry[]> {
  if (index) return Promise.resolve(index);
  if (building) return building;
  building = new Promise<IndexEntry[]>(resolve => {
    const run = () => {
      index = buildIndex(courses);
      resolve(index);
    };
    if (typeof requestIdleCallback === 'function') requestIdleCallback(run, { timeout: 1200 });
    else setTimeout(run, 0);
  });
  return building;
}

/** True once searching is instant; callers use it to show a "preparing search" hint. */
export function isIndexReady(): boolean {
  return index !== null;
}

function snippetAround(text: string, at: number, term: string): string {
  const start = Math.max(0, at - 60);
  const end = Math.min(text.length, at + term.length + 90);
  return (start > 0 ? '…' : '') + text.slice(start, end).trim() + (end < text.length ? '…' : '');
}

/** Occurrences of `term` in `haystack`, stopped at `cap` since exact counts add nothing. */
function countUpTo(haystack: string, term: string, cap: number): number {
  let n = 0;
  let at = haystack.indexOf(term);
  while (at >= 0 && n < cap) {
    n++;
    at = haystack.indexOf(term, at + term.length);
  }
  return n;
}

/**
 * Matches on ALL terms rather than the exact phrase, so "hashmap collision" finds the
 * topic that explains both even though those two words are never adjacent. An exact
 * phrase still scores far higher, and a title hit still outranks any number of body hits.
 */
export function searchContent(entries: IndexEntry[], rawQuery: string, limit = 30): SearchHit[] {
  const phrase = rawQuery.trim().toLowerCase();
  if (phrase.length < 2) return [];
  const terms = Array.from(new Set(phrase.split(/\s+/).filter(t => t.length >= 2)));
  if (terms.length === 0) return [];

  const hits: SearchHit[] = [];
  for (const e of entries) {
    // Every term has to appear somewhere, otherwise a two-word query degenerates into
    // an OR and returns most of the library.
    let missing = false;
    let score = 0;
    let firstBodyAt = -1;
    let firstBodyTerm = terms[0];

    for (const term of terms) {
      const inTitle = e.haystackTitle.indexOf(term);
      const inBody = e.haystack.indexOf(term);
      if (inTitle < 0 && inBody < 0) { missing = true; break; }
      if (inTitle >= 0) score += 300;
      if (inBody >= 0) {
        score += countUpTo(e.haystack, term, 10) * 10;
        if (firstBodyAt < 0 || inBody < firstBodyAt) { firstBodyAt = inBody; firstBodyTerm = term; }
      }
    }
    if (missing) continue;

    // Adjacency is a strong signal that this is what the reader meant.
    if (terms.length > 1) {
      if (e.haystackTitle.includes(phrase)) score += 2000;
      else if (e.haystack.includes(phrase)) score += 200;
    }
    // A topic literally titled the query should always come first.
    if (e.topicName.toLowerCase() === phrase) score += 5000;

    hits.push({
      courseId: e.courseId,
      courseName: e.courseName,
      moduleId: e.moduleId,
      moduleName: e.moduleName,
      topicId: e.topicId,
      topicName: e.topicName,
      snippet: firstBodyAt >= 0 ? snippetAround(e.text, firstBodyAt, firstBodyTerm) : e.text.slice(0, 150),
      score,
    });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}
