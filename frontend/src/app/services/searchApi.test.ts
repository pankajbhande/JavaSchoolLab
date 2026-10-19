import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetServerSearch, searchServer } from './searchApi';

const reply = (status: number, body: unknown) => Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));

describe('searchServer', () => {
  beforeEach(() => resetServerSearch());
  afterEach(() => vi.unstubAllGlobals());

  it('returns the hits the server sends', async () => {
    const hit = { courseId: 'java', courseName: 'Java', moduleId: 'basics', moduleName: 'Basics', topicId: 't', topicName: 'Constructor', snippet: 's', score: 1 };
    const f = vi.fn((_u: RequestInfo | URL) => reply(200, { hits: [hit] }));
    vi.stubGlobal('fetch', f);
    expect(await searchServer('constructor')).toEqual([hit]);
    expect(String(f.mock.calls[0][0])).toContain('/search?q=constructor');
  });

  it('encodes the query', async () => {
    const f = vi.fn((_u: RequestInfo | URL) => reply(200, { hits: [] }));
    vi.stubGlobal('fetch', f);
    await searchServer('a&b c');
    expect(String(f.mock.calls[0][0])).toContain('q=a%26b%20c');
  });

  it('returns null so the caller can fall back, and stops asking once the server says it is not enabled', async () => {
    const f = vi.fn(() => reply(503, { error: 'Server-side search is not enabled.' }));
    vi.stubGlobal('fetch', f);
    expect(await searchServer('java')).toBeNull();
    expect(await searchServer('java again')).toBeNull();
    expect(f).toHaveBeenCalledTimes(1);
  });

  it('retries later after "still preparing" or a network error', async () => {
    vi.stubGlobal('fetch', vi.fn(() => reply(503, { error: 'Search is still being prepared.' })));
    expect(await searchServer('java')).toBeNull();
    resetServerSearch();
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('network'))));
    expect(await searchServer('java')).toBeNull();
  });
});
