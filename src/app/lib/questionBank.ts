// One question source shared by flashcards and mock interviews: the authored study packs
// (keypoints and interview Q&A) plus each topic's own interviewQA once its course is loaded.

import { allStudyPacks } from '../data/studyPacks';
import { courseIndex } from '../data/courseIndex';
import type { Course } from '../data/types';

export type CardKind = 'term' | 'interview';

export interface QCard {
  /** Stable id used as the persistence key. */
  id: string;
  courseId: string;
  topicId: string;
  topicName: string;
  kind: CardKind;
  front: string;
  back: string;
}

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();

let nameMaps: { courses: Map<string, string>; topics: Map<string, string> } | null = null;
function names() {
  if (!nameMaps) {
    const courses = new Map<string, string>();
    const topics = new Map<string, string>();
    for (const c of courseIndex) {
      courses.set(c.id, c.name);
      for (const m of c.subTopics) for (const t of m.topics) topics.set(`${c.id}/${t.id}`, t.name);
    }
    nameMaps = { courses, topics };
  }
  return nameMaps;
}

export function courseName(courseId: string): string {
  return names().courses.get(courseId) ?? courseId;
}

export function topicNameOf(courseId: string, topicId: string): string {
  return names().topics.get(`${courseId}/${topicId}`) ?? topicId;
}

/** Cards from the hand-written study packs. */
export function packCards(): QCard[] {
  const out: QCard[] = [];
  for (const [key, pack] of Object.entries(allStudyPacks)) {
    const slash = key.indexOf('/');
    const courseId = key.slice(0, slash);
    const topicId = key.slice(slash + 1);
    const topicName = topicNameOf(courseId, topicId);
    pack.keypoints.forEach(([term, detail], i) => out.push({
      id: `${key}#k${i}`, courseId, topicId, topicName, kind: 'term',
      front: `What should you know about: ${term}?`, back: detail,
    }));
    pack.interview.forEach(([q, a], i) => out.push({
      id: `${key}#q${i}`, courseId, topicId, topicName, kind: 'interview', front: q, back: a,
    }));
  }
  return out;
}

/** Cards from the interviewQA of every topic in a loaded course. */
export function courseCards(course: Course): QCard[] {
  const out: QCard[] = [];
  for (const m of course.subTopics) {
    for (const t of m.topics) {
      (t.interviewQA ?? []).forEach(([q, a], i) => {
        if (!q || !a) return;
        out.push({
          id: `${course.id}/${t.id}#a${i}`, courseId: course.id, topicId: t.id, topicName: t.name,
          kind: 'interview', front: q, back: a,
        });
      });
    }
  }
  return out;
}

/** Merges card lists, dropping a question that already appears (same course, same text). */
export function mergeCards(...lists: QCard[][]): QCard[] {
  const seen = new Set<string>();
  const out: QCard[] = [];
  for (const list of lists) {
    for (const c of list) {
      const key = `${c.courseId}|${norm(c.front)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(c);
    }
  }
  return out;
}

export function interviewOnly(cards: QCard[]): QCard[] {
  return cards.filter(c => c.kind === 'interview');
}
