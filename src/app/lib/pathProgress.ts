import type { LearningPath } from '../data/learningPaths';

export interface StepProgress { courseId: string; seen: number; total: number; done: boolean }
export interface PathProgress {
  steps: StepProgress[];
  seen: number;
  total: number;
  percent: number;
  /** Index of the first step that is not finished, or -1 when the path is complete. */
  nextIndex: number;
  started: boolean;
}

/** `seenByCourse` maps courseId to topics opened; `totals` maps courseId to topic count. */
export function pathProgress(path: LearningPath, seenByCourse: Record<string, number>, totals: Record<string, number>): PathProgress {
  const steps = path.steps.map(s => {
    const total = totals[s.courseId] ?? 0;
    const seen = Math.min(total, seenByCourse[s.courseId] ?? 0);
    return { courseId: s.courseId, seen, total, done: total > 0 && seen >= total };
  });
  const seen = steps.reduce((n, s) => n + s.seen, 0);
  const total = steps.reduce((n, s) => n + s.total, 0);
  return {
    steps, seen, total,
    percent: total > 0 ? Math.floor((seen / total) * 100) : 0,
    nextIndex: steps.findIndex(s => !s.done),
    started: seen > 0,
  };
}

/** Rough reading effort: about 6 minutes per topic, shown in hours. */
export function effortLabel(topics: number): string {
  const hours = Math.max(1, Math.round((topics * 6) / 60));
  return `~${hours} h`;
}
