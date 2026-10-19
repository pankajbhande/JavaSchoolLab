import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The visitor counter adds one per page load. Each test imports a fresh copy of api.ts, because "once per page load" is module state.
const json = (body: unknown) => Promise.resolve(new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } }));

function fakeSessionStorage(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    getItem: (k: string) => (k in data ? data[k] : null),
    setItem: (k: string, v: string) => { data[k] = v; },
    removeItem: (k: string) => { delete data[k]; },
    data,
  };
}

describe('registerVisit', () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => vi.unstubAllGlobals());

  it('adds one visit per page load, however many components ask', async () => {
    const fetchMock = vi.fn((url: RequestInfo | URL, init?: RequestInit) => json({ count: init?.method === 'POST' ? 11 : 10 }));
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('sessionStorage', fakeSessionStorage());
    const { registerVisit } = await import('./api');
    const results = await Promise.all([registerVisit(), registerVisit(), registerVisit()]);
    expect(results.every(r => r.count === 11)).toBe(true);
    expect(fetchMock.mock.calls.filter(([, init]) => init?.method === 'POST')).toHaveLength(1);
  });

  it('does not count the reload the app makes itself when it installs an update', async () => {
    const fetchMock = vi.fn((url: RequestInfo | URL, init?: RequestInit) => json({ count: 10 }));
    vi.stubGlobal('fetch', fetchMock);
    const store = fakeSessionStorage({ jsl_no_count: '1' });
    vi.stubGlobal('sessionStorage', store);
    const { registerVisit } = await import('./api');
    expect((await registerVisit()).count).toBe(10);
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'POST')).toBe(false);
    expect(store.getItem('jsl_no_count')).toBeNull();   // used up: the next real visit counts again
  });
});
