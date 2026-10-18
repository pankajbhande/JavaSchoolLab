import { describe, it, expect } from 'vitest';
import { learningPaths } from './learningPaths';
import { courseIndex } from './courseIndex';
import { courseStats } from './courseStats';
import { pathProgress } from '../lib/pathProgress';

describe('learning paths', () => {
  it('only reference courses that exist', () => {
    const ids = new Set(courseIndex.map(c => c.id));
    for (const p of learningPaths) {
      expect(p.steps.length, p.id).toBeGreaterThan(0);
      for (const s of p.steps) {
        expect(ids.has(s.courseId), `${p.id} -> missing course ${s.courseId}`).toBe(true);
        expect(courseStats[s.courseId], `${s.courseId} has no courseStats`).toBeDefined();
      }
    }
  });
  it('have unique ids and no repeated course inside a path', () => {
    expect(new Set(learningPaths.map(p => p.id)).size).toBe(learningPaths.length);
    for (const p of learningPaths) expect(new Set(p.steps.map(s => s.courseId)).size).toBe(p.steps.length);
  });
  it('computes progress and the next unfinished step', () => {
    const p = learningPaths[0];
    const totals = Object.fromEntries(p.steps.map(s => [s.courseId, courseStats[s.courseId].topics]));
    const first = p.steps[0].courseId;
    const r = pathProgress(p, { [first]: totals[first] }, totals);
    expect(r.steps[0].done).toBe(true);
    expect(r.nextIndex).toBe(1);
    expect(pathProgress(p, {}, totals).started).toBe(false);
    const all = pathProgress(p, totals, totals);
    expect(all.percent).toBe(100);
    expect(all.nextIndex).toBe(-1);
  });
});
