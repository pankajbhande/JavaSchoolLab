import { describe, it, expect } from 'vitest';
import { sanitizePrefs, DEFAULT_PREFS } from './readingPrefs';

describe('sanitizePrefs', () => {
  it('falls back to defaults for junk', () => {
    expect(sanitizePrefs(null)).toEqual(DEFAULT_PREFS);
    expect(sanitizePrefs({ fontStep: 9, width: 'x', theme: 'neon' })).toEqual(DEFAULT_PREFS);
  });
  it('keeps valid values', () => {
    expect(sanitizePrefs({ fontStep: 3, width: 'comfortable', theme: 'sepia' }))
      .toEqual({ fontStep: 3, width: 'comfortable', theme: 'sepia' });
  });
});
