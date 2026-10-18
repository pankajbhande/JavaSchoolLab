import { describe, it, expect } from 'vitest';
import { formatNotes, leadIns } from './notes';

describe('formatNotes', () => {
  it('turns a run of bullet lines into a list', () => {
    const out = formatNotes('<h3>Intro</h3>\n• First point<br>\n• Second point<br>\nClosing text');
    expect(out).toContain('<ul><li>First point</li><li>Second point</li></ul>');
    expect(out).toContain('Closing text');
    expect(out).toContain('<h3>Intro</h3>');
  });

  it('bolds a short lead label in list items', () => {
    expect(formatNotes('<ul><li>Secure: no pointers</li></ul>')).toContain('<li><strong>Secure:</strong> no pointers</li>');
  });

  it('merges a bold term, its bracketed expansion and the colon into one label', () => {
    expect(formatNotes('<ul><li><strong>JVM</strong> (Java Virtual Machine): runs bytecode</li></ul>'))
      .toBe('<ul><li><strong>JVM (Java Virtual Machine):</strong> runs bytecode</li></ul>');
    expect(formatNotes('<ul><li><strong>Done</strong>: ok</li></ul>')).toBe('<ul><li><strong>Done:</strong> ok</li></ul>');
  });

  it('leaves long text before a colon and existing markup alone', () => {
    const long = '<li>This sentence is much longer than any label could reasonably be: so it stays</li>';
    expect(formatNotes(long)).toBe(long);
    const bold = '<li><strong>Done:</strong> ok</li>';
    expect(formatNotes(bold)).toBe(bold);
  });

  it('does not touch bullets inside <pre> or tables', () => {
    const pre = '<pre>• not a list<br>• still code</pre>';
    expect(formatNotes(pre)).toBe(pre);
  });

  it('returns content without bullets unchanged', () => {
    const plain = '<p>Hello world</p>';
    expect(formatNotes(plain)).toBe(plain);
  });

  it('highlights a colon sentence that introduces a list', () => {
    const out = leadIns('<p>Java is secure because of these points:</p>\n<ul><li>a</li></ul>');
    expect(out).toContain('<p class="jsl-lead">Java is secure because of these points:</p>');
  });

  it('leaves ordinary paragraphs and colon paragraphs without a list alone', () => {
    const plain = '<p>Java is secure.</p><ul><li>a</li></ul>';
    expect(leadIns(plain)).toBe(plain);
    const noList = '<p>Note:</p><p>text</p>';
    expect(leadIns(noList)).toBe(noList);
  });

  it('bolds the lead label of a paragraph too', () => {
    expect(formatNotes('<p>Real-world: scanning logs for the first error line.</p>'))
      .toBe('<p><strong>Real-world:</strong> scanning logs for the first error line.</p>');
  });

  it('does not bold a long sentence that merely contains a colon', () => {
    const p = '<p>This sentence is far too long to be a label, and it has: a colon.</p>';
    expect(formatNotes(p)).toBe(p);
  });
});
