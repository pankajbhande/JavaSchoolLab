// Pure helpers for mock interview rounds: picking questions, scoring, finding weak topics.

import type { QCard } from './questionBank';

export type Rating = 'missed' | 'partly' | 'nailed';
export const RATING_POINTS: Record<Rating, number> = { missed: 0, partly: 0.5, nailed: 1 };

export interface AnswerResult {
  cardId: string;
  courseId: string;
  topicId: string;
  topicName: string;
  rating: Rating;
}

export interface WeakTopic {
  courseId: string;
  topicId: string;
  topicName: string;
  asked: number;
  /** 0-100 */
  percent: number;
}

/** Fisher-Yates shuffle returning a new array. `rng` returns [0,1) and is injectable for tests. */
export function shuffle<T>(items: T[], rng: () => number = Math.random): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Up to `n` distinct random questions from the pool. */
export function pickQuestions(pool: QCard[], n: number, rng: () => number = Math.random): QCard[] {
  return shuffle(pool, rng).slice(0, Math.max(0, n));
}

/** Score as a whole percentage; an empty round scores 0. */
export function scorePercent(results: Pick<AnswerResult, 'rating'>[]): number {
  if (!results.length) return 0;
  const pts = results.reduce((s, r) => s + RATING_POINTS[r.rating], 0);
  return Math.round((pts / results.length) * 100);
}

export function tally(results: Pick<AnswerResult, 'rating'>[]): Record<Rating, number> {
  const t: Record<Rating, number> = { missed: 0, partly: 0, nailed: 0 };
  for (const r of results) t[r.rating]++;
  return t;
}

/**
 * Topics where the student scored below `threshold` percent (default: anything short of a
 * perfect round), worst first. Topics tie-break by how many questions were asked.
 */
export function weakTopics(results: AnswerResult[], limit = 5, threshold = 100): WeakTopic[] {
  const by = new Map<string, { r: AnswerResult; asked: number; pts: number }>();
  for (const r of results) {
    const key = `${r.courseId}/${r.topicId}`;
    const e = by.get(key) ?? { r, asked: 0, pts: 0 };
    e.asked++;
    e.pts += RATING_POINTS[r.rating];
    by.set(key, e);
  }
  return [...by.values()]
    .map(e => ({
      courseId: e.r.courseId, topicId: e.r.topicId, topicName: e.r.topicName,
      asked: e.asked, percent: Math.round((e.pts / e.asked) * 100),
    }))
    .filter(t => t.percent < threshold)
    .sort((a, b) => a.percent - b.percent || b.asked - a.asked)
    .slice(0, limit);
}

/** The questions from a pool that belong to the given weak topics. */
export function questionsForTopics(pool: QCard[], topics: Pick<WeakTopic, 'courseId' | 'topicId'>[]): QCard[] {
  const keys = new Set(topics.map(t => `${t.courseId}/${t.topicId}`));
  return pool.filter(c => keys.has(`${c.courseId}/${c.topicId}`));
}

/** "Strong", "Good", ... verdict for the end screen. */
export function verdict(percent: number): string {
  if (percent >= 85) return 'Interview ready';
  if (percent >= 65) return 'Getting there';
  if (percent >= 40) return 'Keep practising';
  return 'Time to revise the basics';
}
