import { describe, it, expect } from 'vitest';
import { courseStats, TOTAL_TOPICS } from './courseStats';
import { coursesData } from './coursesData';

// courseStats.ts is generated (npm run gen:course-stats) so the dashboard can draw
// completion rings without importing coursesData, which would undo the code split.
// If it drifts, every progress bar on the dashboard is quietly wrong. There is a dev-only
// console warning for this; this test is what actually fails the build.
describe('generated courseStats', () => {
  it('covers every course', () => {
    for (const c of coursesData) {
      expect(courseStats[c.id], `missing course ${c.id} - run npm run gen:course-stats`).toBeDefined();
    }
  });

  it('has no entries for courses that no longer exist', () => {
    const live = new Set(coursesData.map(c => c.id));
    for (const id of Object.keys(courseStats)) {
      expect(live.has(id), `stale course ${id} - run npm run gen:course-stats`).toBe(true);
    }
  });

  it('matches the real topic and module counts', () => {
    for (const c of coursesData) {
      const topics = c.subTopics.reduce((a, m) => a + m.topics.length, 0);
      expect(courseStats[c.id].topics, `topic count for ${c.id}`).toBe(topics);
      expect(courseStats[c.id].modules, `module count for ${c.id}`).toBe(c.subTopics.length);
    }
  });

  it('has a TOTAL_TOPICS that agrees with the tree', () => {
    const total = coursesData.reduce(
      (a, c) => a + c.subTopics.reduce((b, m) => b + m.topics.length, 0), 0);
    expect(TOTAL_TOPICS).toBe(total);
  });
});
