import { describe, it, expect } from 'vitest';
import { slugify } from './slug';
import { coursesData } from '../data/coursesData';

describe('slugify', () => {
  it('turns spaces into underscores', () => {
    expect(slugify('Control Statements in Java')).toBe('Control_Statements_in_Java');
  });

  it('collapses runs of whitespace and trims', () => {
    expect(slugify('  HTML   and  CSS  ')).toBe('HTML_and_CSS');
  });

  it('leaves an already-clean id alone', () => {
    expect(slugify('internal-hashmap')).toBe('internal-hashmap');
  });

  it('is idempotent', () => {
    const once = slugify('Java Memory & JVM');
    expect(slugify(once)).toBe(once);
  });
});

// The router matches a URL segment with `id === seg || slugify(id) === seg`. These tests
// hold that contract against the real tree, because a slug that cannot round-trip is a
// dead link and a slug that collides silently sends two topics to one URL.
describe('real course tree', () => {
  const courses = coursesData;
  const allTopics = courses.flatMap(c =>
    c.subTopics.flatMap(m => m.topics.map(t => ({ course: c.id, module: m.id, topic: t.id }))));

  it('has the expected shape', () => {
    expect(courses.length).toBeGreaterThan(20);
    expect(allTopics.length).toBeGreaterThan(400);
  });

  it('produces URL-safe segments for every id', () => {
    const unsafe = /[\s/?#\[\]@!$&'()*+,;=%]/;
    for (const c of courses) {
      expect(slugify(c.id), `course ${c.id}`).not.toMatch(unsafe);
      for (const m of c.subTopics) {
        expect(slugify(m.id), `module ${m.id}`).not.toMatch(unsafe);
        for (const t of m.topics) {
          expect(slugify(t.id), `topic ${t.id}`).not.toMatch(unsafe);
        }
      }
    }
  });

  it('never slugifies two different course ids to the same segment', () => {
    const seen = new Map<string, string>();
    for (const c of courses) {
      const s = slugify(c.id);
      expect(seen.has(s), `course slug collision: ${c.id} vs ${seen.get(s)}`).toBe(false);
      seen.set(s, c.id);
    }
  });

  it('never slugifies two modules in one course to the same segment', () => {
    for (const c of courses) {
      const seen = new Map<string, string>();
      for (const m of c.subTopics) {
        const s = slugify(m.id);
        expect(seen.has(s), `module slug collision in ${c.id}: ${m.id} vs ${seen.get(s)}`).toBe(false);
        seen.set(s, m.id);
      }
    }
  });

  it('never sends two topics to the same URL', () => {
    const seen = new Map<string, string>();
    for (const { course, module, topic } of allTopics) {
      const url = `/course/${slugify(course)}/${slugify(module)}/${slugify(topic)}`;
      expect(seen.has(url), `URL collision: ${topic} vs ${seen.get(url)} at ${url}`).toBe(false);
      seen.set(url, topic);
    }
  });

  it('round-trips every topic URL back to exactly one topic', () => {
    // Mirrors the resolution CourseWorkspace performs on a deep link or refresh.
    const resolve = (courseSeg: string, moduleSeg: string, topicSeg: string) => {
      const c = courses.find(x => x.id === courseSeg || slugify(x.id) === courseSeg);
      const m = c?.subTopics.find(x => x.id === moduleSeg || slugify(x.id) === moduleSeg);
      return m?.topics.find(x => x.id === topicSeg || slugify(x.id) === topicSeg);
    };
    let resolved = 0;
    for (const { course, module, topic } of allTopics) {
      const found = resolve(slugify(course), slugify(module), slugify(topic));
      expect(found?.id, `${course}/${module}/${topic} did not round-trip`).toBe(topic);
      resolved++;
    }
    expect(resolved).toBe(allTopics.length);
  });

  it('gives every topic a non-empty id and name', () => {
    for (const { topic } of allTopics) expect(topic.trim().length).toBeGreaterThan(0);
    for (const c of courses)
      for (const m of c.subTopics)
        for (const t of m.topics) expect(t.name.trim().length).toBeGreaterThan(0);
  });
});
