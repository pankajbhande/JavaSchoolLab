import { describe, it, expect } from 'vitest';
import { buildKeypoints, matchCheatNotes, genericTokens, extractKeyTerms } from './keypoints';
import type { Topic } from '../data/types';

const topic = (name: string, html: string): Topic => ({
  id: name.toLowerCase().replace(/\s+/g, '-'),
  name,
  beginner: [{ content: html }],
});

const JAVA_NOTES = [
  'JVM - Java Virtual Machine, runs bytecode',
  'JRE - JVM + libraries needed to run Java apps',
  'ArrayList - Resizable array, O(1) random access',
  'HashMap - Key-value store using buckets',
];

describe('matchCheatNotes', () => {
  it('matches on the leading term only', () => {
    const hits = matchCheatNotes(JAVA_NOTES, 'ArrayList');
    expect(hits.map(h => h.term)).toEqual(['ArrayList']);
  });

  it('splits a note into term and detail', () => {
    const [hit] = matchCheatNotes(JAVA_NOTES, 'HashMap');
    expect(hit.term).toBe('HashMap');
    expect(hit.detail).toBe('Key-value store using buckets');
  });

  it('ignores stopwords so every topic does not match everything', () => {
    // "of" and "in" carry no meaning; without filtering they would match constantly.
    expect(matchCheatNotes(JAVA_NOTES, 'Features of Java')).toEqual([]);
  });

  it('honours the generic-token set', () => {
    const notes = ['Design Pattern - A reusable solution', 'Singleton - One instance only'];
    // Coverage alone already rejects it: only 1 of the 2 words in 'Design Pattern'
    // matches the topic, which is under the 0.6 threshold.
    expect(matchCheatNotes(notes, 'Singleton Pattern').map(h => h.term)).toEqual(['Singleton']);
    expect(matchCheatNotes(notes, 'Singleton Pattern', new Set(['pattern'])).map(h => h.term))
      .toEqual(['Singleton']);
  });
});

describe('genericTokens', () => {
  it('flags a token shared by most topic names in the course', () => {
    const names = ['Singleton Pattern', 'Factory Pattern', 'Adapter Pattern', 'Proxy Pattern', 'Bridge Pattern'];
    expect(genericTokens(names).has('pattern')).toBe(true);
    expect(genericTokens(names).has('singleton')).toBe(false);
  });

  it('does nothing for a course too small to judge', () => {
    expect(genericTokens(['A Pattern', 'B Pattern']).size).toBe(0);
  });
});

describe('extractKeyTerms', () => {
  it('lifts bolded terms from the topic body with their sentence', () => {
    const t = topic('Features of Java', '<p>Java is <b>portable</b>. It runs anywhere.</p>');
    const [hit] = extractKeyTerms(t);
    expect(hit.term).toBe('portable');
    expect(hit.detail).toContain('portable');
  });

  it('skips headings, dates and numbered fragments', () => {
    const t = topic('History', '<p><b>1991 - The Green Project:</b> start. <b>Today:</b> now. <b>Oak</b> was the name.</p>');
    expect(extractKeyTerms(t).map(k => k.term)).toEqual(['Oak']);
  });

  it('drops the course name itself as a keypoint', () => {
    const t = topic('Features', '<p><b>Java</b> is <b>portable</b>.</p>');
    expect(extractKeyTerms(t, 'Java').map(k => k.term)).toEqual(['portable']);
  });

  it('deduplicates ignoring punctuation', () => {
    const t = topic('WORA', '<p><b>Write Once, Run Anywhere</b> and <b>Write Once Run Anywhere</b>.</p>');
    expect(extractKeyTerms(t)).toHaveLength(1);
  });
});

describe('buildKeypoints', () => {
  it('returns nothing without a topic', () => {
    expect(buildKeypoints(null, JAVA_NOTES, 'Java')).toEqual([]);
  });

  it('NEVER falls back to the whole course list', () => {
    // The original bug: an unmatched topic returned every cheat note in the course, so
    // "Features of Java" displayed sealed class, permits, record and HttpClient.
    const t = topic('Totally Unrelated Topic', '<p>Nothing emphasised here.</p>');
    expect(buildKeypoints(t, JAVA_NOTES, 'Java')).toEqual([]);
  });

  it('puts authored cheat notes ahead of terms lifted from the body', () => {
    const t = topic('HashMap', '<p>A <b>bucket</b> holds entries.</p>');
    const out = buildKeypoints(t, JAVA_NOTES, 'Java');
    expect(out[0].term).toBe('HashMap');
    expect(out.map(k => k.term)).toContain('bucket');
  });

  it('tops up from inline code when the topic emphasises little', () => {
    const t = topic('HTML Lists', '<p>Use <code>list-style-type</code> and <code>&lt;ul&gt;</code>.</p>');
    const out = buildKeypoints(t, [], 'HTML & CSS');
    expect(out.map(k => k.term)).toContain('list-style-type');
  });

  it('respects the limit', () => {
    const many = Array.from({ length: 40 }, (_, i) => `<b>term${i}</b>`).join(' ');
    expect(buildKeypoints(topic('Many', `<p>${many}</p>`), [], 'Java').length).toBeLessThanOrEqual(24);
  });
});

describe('the sentence a keypoint quotes', () => {
  const detailFor = (html: string, term: string) => {
    const hit = extractKeyTerms(topic('Sample Topic', html)).find(k => k.term === term);
    return hit ? hit.detail : undefined;
  };

  it('does not split a sentence at the dot inside a version number', () => {
    const d = detailFor(
      '<p>Sun released Java 1.0 with the slogan <strong>Write Once, Run Anywhere</strong>.</p>',
      'Write Once, Run Anywhere',
    );
    expect(d).toBe('Sun released Java 1.0 with the slogan Write Once, Run Anywhere');
  });

  it('drops the title when the sentence merely repeats it', () => {
    const d = detailFor(
      '<p><strong>for vs while</strong> All three loops repeat a block.</p>',
      'for vs while',
    );
    expect(d).toBe('All three loops repeat a block');
  });

  it('keeps the words when a lowercase one carries the phrase on', () => {
    const d = detailFor(
      '<p><strong>Divide</strong> and Conquer is a strategy for solving problems.</p>',
      'Divide',
    );
    expect(d).toBe('Divide and Conquer is a strategy for solving problems');
  });

  it('skips a mention buried in code and quotes the next one', () => {
    const d = detailFor(
      '<p>Use if (x) { counter++; } to count. Then <strong>counter</strong> holds the total.</p>',
      'counter',
    );
    expect(d).toBe('Then counter holds the total');
  });

  it('skips a mention buried in a diagram', () => {
    const d = detailFor(
      '<p>Shape: +----+ | flow | +----+ here. The <strong>flow</strong> moves left to right.</p>',
      'flow',
    );
    expect(d).toBe('The flow moves left to right');
  });

  it('drops a label and the dash that introduces it', () => {
    const d = detailFor(
      '<p><strong>Detect</strong> - a monitoring alert fires, or a user reports it.</p>',
      'Detect',
    );
    expect(d).toBe('a monitoring alert fires, or a user reports it');
  });

  it('gives no detail when the sentence is only the title', () => {
    const d = detailFor(
      '<p><strong>Sample Use Case (e-commerce checkout)</strong>. Steps follow below.</p>',
      'Sample Use Case (e-commerce checkout)',
    );
    expect(d).toBe('');
  });

  it('rejects a detail that is mostly figures', () => {
    const d = detailFor(
      '<p><strong>SessionCache</strong> 48 612,458,320 68.2% java.</p>',
      'SessionCache',
    );
    expect(d).toBe('');
  });

  it('drops a numbered list marker left behind by the strip to plain text', () => {
    const d = detailFor(
      '<p>1) <strong>break</strong> Statement The break statement exits a loop.</p>',
      'break',
    );
    expect(d).toBe('Statement The break statement exits a loop');
  });
});

describe('a keypoint whose explanation contains code', () => {
  const detailFor = (html: string, term: string) => {
    const hit = extractKeyTerms(topic('Sample Topic', html)).find(k => k.term === term);
    return hit ? hit.detail : undefined;
  };

  it('keeps method calls whole instead of stopping at the dot after the object', () => {
    const d = detailFor(
      '<ul><li><b>Compose behavior</b>: <code>f.andThen(g)</code>, <code>f.compose(g)</code>, <code>p.and(q)</code>, <code>p.negate()</code>.</li></ul>',
      'Compose behavior',
    );
    expect(d).toBe('f.andThen(g), f.compose(g), p.and(q), p.negate()');
  });

  it('keeps a package name whole', () => {
    const d = detailFor('<p><b>Built-ins</b> in <code>java.util.function</code>: <code>Function</code> and <code>Predicate</code>.</p>', 'Built-ins');
    expect(d).toContain('java.util.function');
    expect(d).not.toBe('in java');
  });

  it('still ends a sentence at a real full stop, even straight before a tag', () => {
    const d = detailFor('<p><b>Stack</b> is last-in first-out.<br>Queue is first-in first-out. It differs.</p>', 'Stack');
    expect(d).toBe('Stack is last-in first-out');
  });

  it('closes the gap a tag leaves before a comma', () => {
    const d = detailFor('<p><b>Specializations</b> avoid boxing: <code>IntPredicate</code>, <code>ToIntFunction</code>, <code>IntBinaryOperator</code>.</p>', 'Specializations');
    expect(d).toBe('Specializations avoid boxing: IntPredicate, ToIntFunction, IntBinaryOperator');
  });

  it('still ends at a full stop that follows a code span', () => {
    const d = detailFor('<p>Use <b>Stream</b> with <code>map()</code>. Then call <code>collect()</code>.</p>', 'Stream');
    expect(d).toBe('Use Stream with map()');
  });
});
