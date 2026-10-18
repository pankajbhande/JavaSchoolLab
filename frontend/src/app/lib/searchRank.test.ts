import { describe, it, expect } from 'vitest';
import { flattenIndex, searchNames, scoreName, highlightParts, queryTerms } from './searchRank';

const idx = flattenIndex([
  {
    id: 'java', name: 'Core Java',
    subTopics: [
      { id: 'coll', name: 'Collections', topics: [{ id: 'hm', name: 'HashMap' }, { id: 'internal-hm', name: 'Internal Working of HashMap' }] },
    ],
  },
  { id: 'react', name: 'React', subTopics: [{ id: 'hooks', name: 'Hooks', topics: [{ id: 'us', name: 'useState' }] }] },
]);

describe('searchRank', () => {
  it('flattens course, module and topic entries', () => {
    expect(idx.map(e => e.kind)).toEqual(['course', 'module', 'topic', 'topic', 'course', 'module', 'topic']);
  });

  it('ranks exact above prefix above substring', () => {
    expect(scoreName('HashMap', ['hashmap'])).toBeGreaterThan(scoreName('Internal Working of HashMap', ['hashmap']));
    expect(scoreName('Hooks', ['ho'])).toBeGreaterThan(scoreName('Core Java', ['or']));
  });

  it('requires every term to match', () => {
    expect(scoreName('Internal Working of HashMap', ['hashmap', 'react'])).toBe(0);
    expect(scoreName('Internal Working of HashMap', ['internal', 'hashmap'])).toBeGreaterThan(0);
  });

  it('puts the exact topic first', () => {
    const hits = searchNames(idx, 'hashmap');
    expect(hits[0].id).toBe('hm');
    expect(hits.map(h => h.id)).toContain('internal-hm');
  });

  it('returns nothing for a blank query', () => {
    expect(searchNames(idx, '   ')).toEqual([]);
  });

  it('highlights matches case-insensitively', () => {
    const parts = highlightParts('HashMap basics', queryTerms('map'));
    expect(parts).toEqual([
      { text: 'Hash', match: false },
      { text: 'Map', match: true },
      { text: ' basics', match: false },
    ]);
  });
});
