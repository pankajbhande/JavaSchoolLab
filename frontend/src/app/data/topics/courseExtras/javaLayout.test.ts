import { describe, it, expect } from 'vitest';
import { highlight } from './javaLayout';

const marked = (html: string) => [...html.matchAll(/<mark[^>]*>([^<]*)<\/mark>/g)].map(m => m[1]);

describe('highlight', () => {
  it('marks a dotted name whole, however many segments it has', () => {
    expect(marked(highlight('an object of java.lang.String that'))).toEqual(['java.lang.String']);
    expect(marked(highlight('call System.out.println() here'))).toContain('System.out.println()');
  });

  it('keeps digits inside an ALL-CAPS term', () => {
    expect(marked(highlight('a coder flag, LATIN1 or UTF16, so'))).toEqual(['LATIN1', 'UTF16']);
  });

  it('still marks plain camelCase and ALL-CAPS terms', () => {
    expect(marked(highlight('use HashMap and the JVM'))).toEqual(['HashMap', 'JVM']);
  });
});
