import { describe, expect, it } from 'vitest';
import { findMatches, searchTerms } from './findInPage';

const text = 'A HashMap stores pairs. Elsewhere a collision is just a clash. When a HashMap collision happens, the bucket becomes a list.';

describe('searchTerms', () => {
  it('keeps words of two letters or more, lowercase, once each', () => {
    expect(searchTerms('HashMap  hashmap a Collision')).toEqual(['hashmap', 'collision']);
    expect(searchTerms('   ')).toEqual([]);
  });
});

describe('findMatches', () => {
  it('finds a single word wherever it occurs, in reading order, ignoring case', () => {
    const m = findMatches(text, 'HASHMAP');
    expect(m).toHaveLength(2);
    expect(text.slice(m[0].start, m[0].end)).toBe('HashMap');
    expect(m[0].start).toBeLessThan(m[1].start);
  });

  it('lands on the sentence that has the whole phrase, not on an earlier stray word', () => {
    const m = findMatches(text, 'hashmap collision');
    expect(m).toHaveLength(1);
    expect(text.slice(m[0].start, m[0].end)).toBe('HashMap collision');
  });

  it('falls back to the separate words when the phrase never appears together', () => {
    const m = findMatches('collision here. later, hashmap there.', 'hashmap collision');
    expect(m.map(x => 'collision here. later, hashmap there.'.slice(x.start, x.end))).toEqual(['collision', 'hashmap']);
  });

  it('returns nothing for a word that is not there or a query too short to search', () => {
    expect(findMatches(text, 'zzzz')).toEqual([]);
    expect(findMatches(text, 'a')).toEqual([]);
    expect(findMatches(text, '')).toEqual([]);
  });

  it('is safe with characters that mean something in a regular expression', () => {
    expect(findMatches('call foo(bar) now', 'foo(bar)')).toHaveLength(1);
    expect(findMatches('a.b and a*b', 'a*b')).toHaveLength(1);
  });

  it('never returns more than the cap', () => {
    expect(findMatches('ab '.repeat(500), 'ab', 20)).toHaveLength(20);
  });
});
