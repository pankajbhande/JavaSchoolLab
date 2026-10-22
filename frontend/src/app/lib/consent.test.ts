import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getConsent, setConsent } from './consent';

// The unit tests run in plain Node, so the two browser objects the module touches are replaced by tiny fakes.
function fakeBrowser() {
  const store = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  });
  vi.stubGlobal('window', { dispatchEvent: () => true, addEventListener: () => {}, removeEventListener: () => {} });
  return store;
}

describe('advertising consent', () => {
  let store: Map<string, string>;
  beforeEach(() => { store = fakeBrowser(); });

  it('is "not chosen" until the visitor decides, so no ad script may load', () => {
    expect(getConsent()).toBeNull();
  });

  it('remembers yes and no, and can be reset', () => {
    setConsent('granted');
    expect(getConsent()).toBe('granted');
    setConsent('denied');
    expect(getConsent()).toBe('denied');
    setConsent('reset');
    expect(getConsent()).toBeNull();
  });

  it('treats a garbage stored value as "not chosen"', () => {
    store.set('jsl_ad_consent', 'maybe');
    expect(getConsent()).toBeNull();
  });

  it('treats blocked storage as "not chosen"', () => {
    vi.stubGlobal('localStorage', { getItem: () => { throw new Error('blocked'); } });
    expect(getConsent()).toBeNull();
  });
});
