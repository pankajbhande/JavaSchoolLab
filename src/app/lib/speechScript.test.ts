import { describe, it, expect } from 'vitest';
import { buildSpeechScript, splitSentences } from './speechScript';

describe('splitSentences', () => {
  it('splits on sentence ends but not abbreviations', () => {
    expect(splitSentences('Use build tools, e.g. Maven or Gradle. Done now!')).toEqual(['Use build tools, e.g. Maven or Gradle.', 'Done now!']);
    expect(splitSentences('Compare Java vs. Python today. It helps.')).toEqual(['Compare Java vs. Python today.', 'It helps.']);
    expect(splitSentences('Java is a portable language. It runs on a JVM.')).toEqual(['Java is a portable language.', 'It runs on a JVM.']);
  });
  it('breaks very long sentences at commas', () => {
    const long = ('word '.repeat(30) + ', ').repeat(3) + 'end.';
    const parts = splitSentences(long);
    expect(parts.length).toBeGreaterThan(1);
    expect(parts.every(p => p.length <= 210)).toBe(true);
  });
});

describe('buildSpeechScript', () => {
  const html = `<h3>1. Definition</h3><p>An operator performs an action on operands. It returns a value.</p>
    <ul><li>Arithmetic</li><li>Logical</li><li>Relational</li></ul>
    <pre>int a = 1;</pre><h4>Next part</h4><p>Done here.</p>`;
  const script = buildSpeechScript('Operators in Java', [html]);

  it('greets and signs off', () => {
    expect(script[0].text).toContain('Operators in Java');
    expect(script[script.length - 1].text).toContain('Happy learning');
  });
  it('speaks headings without the number and with a longer pause', () => {
    const h = script.find(s => s.kind === 'heading')!;
    expect(h.text).toBe('Definition.');
    expect(h.pause).toBeGreaterThan(500);
  });
  it('reads one sentence per piece', () => {
    const texts = script.map(s => s.text);
    expect(texts).toContain('An operator performs an action on operands.');
    expect(texts).toContain('It returns a value.');
  });
  it('numbers short lists aloud', () => {
    const texts = script.map(s => s.text);
    expect(texts).toContain('First, Arithmetic');
    expect(texts).toContain('Second, Logical');
    expect(texts).toContain('Third, Relational');
  });
  it('never reads code blocks', () => {
    expect(script.map(s => s.text).join(' ')).not.toContain('int a');
  });
  it('turns symbols into words', () => {
    const s = buildSpeechScript('x', ['<p>Use a &amp;&amp; b || c to combine conditions.</p>']);
    expect(s[1].text).toBe('Use a and b or c to combine conditions.');
  });
  it('pauses longer between blocks than between sentences', () => {
    const s = buildSpeechScript('x', ['<p>One sentence here.</p>', '<p>Another block.</p>']);
    const first = s.find(p => p.text === 'One sentence here.')!;
    expect(first.pause).toBeGreaterThanOrEqual(900);
  });
});
