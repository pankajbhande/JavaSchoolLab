import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function fakeStorage() {
  const d: Record<string, string> = {};
  return { getItem: (k: string) => (k in d ? d[k] : null), setItem: (k: string, v: string) => { d[k] = v; }, removeItem: (k: string) => { delete d[k]; } };
}

describe('analytics', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    fetchMock = vi.fn((_u: RequestInfo | URL, _i?: RequestInit) => Promise.resolve(new Response(null, { status: 204 })));
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('sessionStorage', fakeStorage());
    vi.stubGlobal('localStorage', fakeStorage());
    vi.stubGlobal('navigator', { doNotTrack: null });
    vi.stubGlobal('window', {});
  });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

  const bodies = () => fetchMock.mock.calls.map(c => JSON.parse(String((c[1] as RequestInit).body)));

  it('sends a page view with a stable anonymous session id', async () => {
    const { trackPageView } = await import('./analytics');
    trackPageView('/course/java');
    trackPageView('/dashboard');
    const [a, b] = bodies();
    expect(a).toMatchObject({ type: 'page_view', path: '/course/java' });
    expect(a.sessionId).toBeTruthy();
    expect(b.sessionId).toBe(a.sessionId);
    expect(String(fetchMock.mock.calls[0][0])).toContain('/analytics/event');
  });

  it('never sends anything when the browser says Do Not Track', async () => {
    vi.stubGlobal('navigator', { doNotTrack: '1' });
    const { trackPageView, trackSearch } = await import('./analytics');
    trackPageView('/x');
    trackSearch('constructor', 3);
    await vi.advanceTimersByTimeAsync(5000);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends the signed-in token so the event belongs to the learner, and none when signed out', async () => {
    const { trackPageView } = await import('./analytics');
    trackPageView('/a');
    expect((fetchMock.mock.calls[0][1] as RequestInit).headers).not.toHaveProperty('Authorization');
    localStorage.setItem('jsl_token', 'abc');
    trackPageView('/b');
    expect((fetchMock.mock.calls[1][1] as RequestInit).headers).toHaveProperty('Authorization', 'Bearer abc');
  });

  it('records a search only once the query stops changing, lowercased, with the result count', async () => {
    const { trackSearch } = await import('./analytics');
    for (const q of ['h', 'ha', 'has', 'hash', 'HashMap']) trackSearch(q, 4);
    expect(fetchMock).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1600);
    expect(bodies()).toHaveLength(1);
    expect(bodies()[0]).toMatchObject({ type: 'search', detail: 'hashmap', value: 4 });
  });

  it('ignores one-letter queries and does not repeat the same search back to back', async () => {
    const { trackSearch } = await import('./analytics');
    trackSearch('a', 9);
    await vi.advanceTimersByTimeAsync(2000);
    expect(fetchMock).not.toHaveBeenCalled();
    trackSearch('java', 5); await vi.advanceTimersByTimeAsync(2000);
    trackSearch('java', 5); await vi.advanceTimersByTimeAsync(2000);
    expect(bodies()).toHaveLength(1);
  });

  it('survives a failing network', async () => {
    fetchMock.mockImplementation(() => Promise.reject(new TypeError('offline')));
    const { trackPageView } = await import('./analytics');
    expect(() => trackPageView('/x')).not.toThrow();
  });
});
