import { describe, it, expect } from 'vitest';
import { coursesData } from './coursesData';
import { courseIndex } from './courseIndex';
import { courseLoadMap } from './courseLoadMap';
import { loadCourse } from './courseLoader';

describe('lazy course loading', () => {
  it('has an index entry and a load-map entry for every course, with the same ids, modules and topics', () => {
    expect(courseIndex.map(c => c.id)).toEqual(coursesData.map(c => c.id));
    expect(Object.keys(courseLoadMap).sort()).toEqual(coursesData.map(c => c.id).sort());
    for (const eager of coursesData) {
      const idx = courseIndex.find(c => c.id === eager.id)!;
      expect(idx.name, eager.id).toBe(eager.name);
      expect(idx.icon, eager.id).toBe(eager.icon);
      expect(idx.subTopics.map(m => [m.id, m.name, m.topics.map(t => [t.id, t.name])]), `${eager.id} (run npm run gen:course-stats)`)
        .toEqual(eager.subTopics.map(m => [m.id, m.name, m.topics.map(t => [t.id, t.name])]));
    }
  });

  it('loads every course exactly as the eager list builds it', async () => {
    for (const eager of coursesData) {
      const lazy = await loadCourse(eager.id);
      // string compare: a mismatch in one of 18 MB of HTML is unreadable as an object diff
      expect(JSON.stringify(lazy) === JSON.stringify(eager), `${eager.id} differs (run npm run gen:course-stats if extras moved)`).toBe(true);
    }
  }, 120000);

  it('rejects an unknown course and lets the caller retry', async () => {
    await expect(loadCourse('no-such-course')).rejects.toThrow(/Unknown course/);
    await expect(loadCourse('no-such-course')).rejects.toThrow(/Unknown course/);
  });
});
