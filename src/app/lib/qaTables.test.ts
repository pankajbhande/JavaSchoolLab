import { describe, it, expect } from 'vitest';
import { transformContentTables } from './qaTables';

const qa = `<table class="w-full border">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is Java platform independent?</td><td>Bytecode runs on any JVM</td></tr>
<tr class='text-center'><td>Is the JVM platform independent?</td><td>No - one build per OS</td></tr>
</table>`;

const comparison = `<table>
<tr><th>Feature</th><th>ArrayList</th><th>LinkedList</th></tr>
<tr><td>Access</td><td>O(1)</td><td>O(n)</td></tr>
</table>`;

describe('transformContentTables', () => {
  it('rewrites a Question/Answer table as a stacked list', () => {
    const out = transformContentTables(qa);
    expect(out).not.toContain('<table');
    expect(out).toContain('jsl-qa-item');
    expect((out.match(/jsl-qa-item/g) || []).length).toBe(2);
  });

  it('keeps the question and answer text', () => {
    const out = transformContentTables(qa);
    expect(out).toContain('Why is Java platform independent?');
    expect(out).toContain('Bytecode runs on any JVM');
    expect(out).toContain('No - one build per OS');
  });

  it('leaves a genuine comparison table alone', () => {
    // Three columns and no Question/Answer header: this one needs its grid.
    expect(transformContentTables(comparison)).toBe(comparison);
  });

  it('drops the header row rather than rendering it as a pair', () => {
    expect(transformContentTables(qa)).not.toContain('>Question</p>');
  });

  it('preserves inline markup inside cells', () => {
    const withCode = `<table><tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is <code>var</code>?</td><td>Local <b>type inference</b></td></tr></table>`;
    const out = transformContentTables(withCode);
    expect(out).toContain('<code>var</code>');
    expect(out).toContain('<b>type inference</b>');
  });

  it('is a no-op on content with no tables', () => {
    expect(transformContentTables('<p>Nothing here.</p>')).toBe('<p>Nothing here.</p>');
    expect(transformContentTables('')).toBe('');
  });

  it('leaves an unreadable Q/A table as a table rather than dropping it', () => {
    const empty = '<table><tr><th>Question</th><th>Answer</th></tr></table>';
    expect(transformContentTables(empty)).toBe(empty);
  });

  it('handles several tables in one document', () => {
    const out = transformContentTables(qa + comparison + qa);
    expect((out.match(/class="jsl-qa"/g) || []).length).toBe(2);
    expect(out).toContain('<table>');   // the comparison survives
  });
});

describe('three-column variant', () => {
  // Several Design Patterns topics number their questions and title the column
  // "Short Answer", so the columns cannot be assumed by position.
  const numbered = `<table><tr><th>#</th><th>Question</th><th>Short Answer</th></tr>
<tr><td>1</td><td>What is Chain of Responsibility?</td><td>A behavioral pattern</td></tr>
<tr><td>2</td><td>When is it used?</td><td>When several handlers may apply</td></tr></table>`;

  it('finds the question and answer columns by header', () => {
    const out = transformContentTables(numbered);
    expect(out).not.toContain('<table');
    expect((out.match(/jsl-qa-item/g) || []).length).toBe(2);
    expect(out).toContain('What is Chain of Responsibility?');
    expect(out).toContain('A behavioral pattern');
  });

  it('drops the index column rather than showing it as the question', () => {
    expect(transformContentTables(numbered)).not.toContain('>1</p>');
  });

  it('ignores a four-column table, which is a comparison grid', () => {
    const wide = `<table><tr><th>#</th><th>Question</th><th>Answer</th><th>Notes</th></tr>
<tr><td>1</td><td>Q</td><td>A</td><td>N</td></tr></table>`;
    expect(transformContentTables(wide)).toBe(wide);
  });
});

describe('label/meaning summaries', () => {

  const summary = `<table class="w-full">
<tr><th>Feature</th><th>Meaning</th></tr>
<tr><td><strong>Portable</strong></td><td>Consistent behaviour across platforms</td></tr>
<tr><td>Robust</td><td>Strong typing, exceptions, GC</td></tr>
</table>`;

  const peers = `<table>
<tr><th>HTTP</th><th>HTTPS</th></tr>
<tr><td>Port 80</td><td>Port 443</td></tr>
</table>`;

  it('rewrites a label/meaning summary as a stacked list', () => {
    const out = transformContentTables(summary);
    expect(out).not.toContain('<table');
    expect((out.match(/jsl-def-item/g) || []).length).toBe(2);
    expect(out).toContain('Consistent behaviour across platforms');
  });

  it('keeps the term cell markup rather than flattening it', () => {
    expect(transformContentTables(summary)).toContain('<strong>Portable</strong>');
  });

  it('leaves a two-column comparison of peers as a table', () => {
    const out = transformContentTables(peers);
    expect(out).toContain('<table');
    expect(out).not.toContain('jsl-def');
  });

  it('treats a question-mark heading as descriptive', () => {
    const t = `<table><tr><th>Combination</th><th>Allowed?</th></tr>
<tr><td>public static</td><td>Yes</td></tr></table>`;
    expect(transformContentTables(t)).toContain('jsl-def-item');
  });

  it('treats an interrogative heading as descriptive', () => {
    const t = `<table><tr><th>Step</th><th>What happens</th></tr>
<tr><td>Compile</td><td>javac writes bytecode</td></tr></table>`;
    expect(transformContentTables(t)).toContain('jsl-def-item');
  });

  it('reads a Q/A table whose first column is not titled Question', () => {
    const t = `<table><tr><th>Trap</th><th>Answer</th></tr>
<tr><td>== on Strings</td><td>Compares references</td></tr></table>`;
    const out = transformContentTables(t);
    expect(out).toContain('jsl-qa-item');
    expect(out).not.toContain('jsl-def');
  });

  it('leaves a summary table alone when a row is missing its detail', () => {
    const t = `<table><tr><th>Feature</th><th>Meaning</th></tr>
<tr><td>Portable</td><td></td></tr></table>`;
    expect(transformContentTables(t)).toContain('<table');
  });
});
