import { describe, it, expect } from 'vitest';
import { ensureIndex, searchContent } from './contentSearch';
import type { Course } from '../data/types';

const block = (content: string, codeExamples?: string[]) => ({ content, codeExamples });

const courses: Course[] = [
  {
    id: 'collection', name: 'Collection Framework', icon: 'BookOpen', cheatNotes: [], interviewQuestions: [],
    subTopics: [{
      id: 'internal-working', name: 'Internal Working',
      topics: [
        {
          id: 'internal-hashmap', name: 'Internal Working of HashMap',
          beginner: [block('<p>A HashMap stores key-value pairs in buckets. A <b>collision</b> happens when two keys hash to the same bucket.</p>')],
        },
        {
          id: 'internal-hashset', name: 'Internal Working of HashSet',
          beginner: [block('<p>HashSet is backed by a HashMap and shares its collision behaviour.</p>')],
        },
      ],
    }],
  },
  {
    id: 'java', name: 'Java', icon: 'Code', cheatNotes: [], interviewQuestions: [],
    subTopics: [{
      id: 'oop', name: 'OOPS Concept',
      topics: [
        { id: 'polymorphism', name: 'Polymorphism in Java', beginner: [block('<p>Method overriding is resolved at runtime.</p>')] },
        { id: 'features', name: 'Features of Java', beginner: [block('<p>Java supports polymorphism, inheritance and encapsulation.</p>')] },
        { id: 'threads', name: 'Threads', beginner: [block('<p>Use an executor.</p>', ['ExecutorService pool = Executors.newFixedThreadPool(4);'])] },
      ],
    }],
  },
];

const index = await ensureIndex(courses);
const find = (q: string) => searchContent(index, q);

describe('matching', () => {
  it('strips HTML so markup cannot hide a match', () => {
    // "collision" sits inside <b> tags in the source.
    expect(find('collision').length).toBeGreaterThan(0);
  });

  it('requires ALL terms, not any', () => {
    // The original implementation did exact-phrase only, so this returned nothing even
    // though one topic explains both words.
    const hits = find('hashmap collision');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].topicId).toBe('internal-hashmap');
  });

  it('does not degenerate into OR for multi-term queries', () => {
    // "polymorphism" appears in two Java topics; "runtime" in only one.
    const hits = find('polymorphism runtime');
    expect(hits).toHaveLength(1);
    expect(hits[0].topicId).toBe('polymorphism');
  });

  it('searches code examples too', () => {
    expect(find('ExecutorService')[0].topicId).toBe('threads');
  });

  it('returns nothing for a query under two characters', () => {
    expect(find('a')).toEqual([]);
    expect(find(' ')).toEqual([]);
  });

  it('returns nothing when no topic matches', () => {
    expect(find('zzzznotathing')).toEqual([]);
  });
});

describe('ranking', () => {
  it('puts a title match above body mentions', () => {
    const hits = find('polymorphism');
    expect(hits[0].topicId).toBe('polymorphism');
    expect(hits[0].score).toBeGreaterThan(hits[1].score);
  });

  it('ranks an exact title match first', () => {
    expect(find('Internal Working of HashMap')[0].topicId).toBe('internal-hashmap');
  });
});

describe('robustness', () => {
  it('does not throw on regex metacharacters', () => {
    for (const q of ['a(b[c', 'x**', '.*', '\\', '[', '(?:']) {
      expect(() => find(q)).not.toThrow();
    }
  });

  it('is case insensitive', () => {
    expect(find('HASHMAP').length).toBe(find('hashmap').length);
  });
});

describe('hit shape', () => {
  it('carries the ids needed to navigate to the topic', () => {
    const hit = find('collision')[0];
    expect(hit.courseId).toBe('collection');
    expect(hit.moduleId).toBe('internal-working');
    expect(hit.topicId).toBeTruthy();
    expect(hit.courseName).toBe('Collection Framework');
    expect(hit.snippet.length).toBeGreaterThan(0);
  });
});
