import { describe, it, expect } from 'vitest';
import { formatHtml, highlightHtml, looksLikeHtml } from './htmlCode';

const ragged = [
  '<!DOCTYPE html>', '                  <html>', '                  <head>', '                  <style>',
  '                  a:link { color: blue; }', '                  .button {', '                  display:inline-block;',
  '                  }', '                  </style>', '                  </head>', '                  <body>',
  '                  <h2>Styled Link</h2>', '                  <a href="x" class="button">Go</a>', '                  </body>', '                  </html>',
].join('\n');

describe('html sample helpers', () => {
  it('recognises web pages', () => {
    expect(looksLikeHtml(ragged)).toBe(true);
    expect(looksLikeHtml('public class A {}')).toBe(false);
  });

  it('re-indents by nesting, including CSS braces', () => {
    expect(formatHtml(ragged).split('\n')).toEqual([
      '<!DOCTYPE html>', '<html>', '  <head>', '    <style>', '      a:link { color: blue; }', '      .button {',
      '        display:inline-block;', '      }', '    </style>', '  </head>', '  <body>', '    <h2>Styled Link</h2>',
      '    <a href="x" class="button">Go</a>', '  </body>', '</html>',
    ]);
  });

  it('colours tags, attributes and css, and escapes the text', () => {
    const out = highlightHtml('<style>a { color: blue; padding: 10px; }</style><p class="x">1 < 2</p>');
    expect(out).toContain('color:#e5c07b');   // tag / selector
    expect(out).toContain('color:#e06c75');   // css property
    expect(out).toContain('color:#c678dd');   // number + unit
    expect(out).toContain('color:#98c379');   // attribute value
    expect(out).toContain('1 &lt; 2');
  });
});
