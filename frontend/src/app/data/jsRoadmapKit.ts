// Small constructors shared by the roadmap files (JavaScriptRoadmap1..4.ts, ReactRoadmap1..3.ts) so each lesson reads as content, not boilerplate.
import type { ContentBlock, SubTopic, Topic } from './types';

/** One block of a lesson: an HTML body plus the code samples shown under it. */
export const blk = (content: string, ...codeExamples: string[]): ContentBlock =>
  codeExamples.length ? { content, codeExamples } : { content };

/** A lesson with its three tiers and its interview questions (question, answer). */
export const topic = (
  id: string,
  name: string,
  beginner: ContentBlock[],
  intermediate: ContentBlock[],
  expert: ContentBlock[],
  interviewQA: [string, string][],
): Topic => ({ id, name, beginner, intermediate, expert, interviewQA });

/** One roadmap phase, shown as a module of the JavaScript course. */
export const phase = (n: number, title: string, priority: string, topics: Topic[]): SubTopic => ({
  id: `jsr-phase-${n}`,
  name: `Phase ${n} · ${title} (${priority})`,
  topics,
});

/** A roadmap phase of another course: ids and names carry that course's own prefix (e.g. "rr" for React). */
export const phaseOf = (prefix: string, n: number, title: string, priority: string, topics: Topic[]): SubTopic => ({
  id: `${prefix}-phase-${n}`,
  name: `Phase ${n} · ${title} (${priority})`,
  topics,
});

