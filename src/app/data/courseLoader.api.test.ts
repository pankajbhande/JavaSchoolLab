import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

async function freshLoader(mode: 'api' | 'bundle') {
  vi.resetModules();
  vi.stubEnv('VITE_CONTENT_SOURCE', mode);
  vi.stubEnv('VITE_API_BASE_URL', '/api');
  return import('./courseLoader');
}

const course = (id: string) => ({ id, name: id, icon: 'x', subTopics: [] });
const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body });

describe('course loader, api mode', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('returns the course and encodes the id in the URL', async () => {
    fetchMock.mockResolvedValue(ok(course('HTML and CSS')));
    const { loadCourse } = await freshLoader('api');
    const c = await loadCourse('HTML and CSS');
    expect(c.id).toBe('HTML and CSS');
    expect(fetchMock).toHaveBeenCalledWith('/api/content/courses/HTML%20and%20CSS');
    await loadCourse('HTML and CSS');
    expect(fetchMock).toHaveBeenCalledTimes(1); // cached
  });

  it('rejects on 404', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 404, json: async () => ({}) });
    const { loadCourse } = await freshLoader('api');
    await expect(loadCourse('nope')).rejects.toThrow(/HTTP 404/);
  });

  it('rejects malformed bodies', async () => {
    const { loadCourse } = await freshLoader('api');
    fetchMock.mockResolvedValueOnce(ok({ id: 'a' }));
    await expect(loadCourse('a')).rejects.toThrow(/unexpected shape/);
    fetchMock.mockResolvedValueOnce(ok(course('other')));
    await expect(loadCourse('b')).rejects.toThrow(/unexpected shape/);
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => { throw new SyntaxError('bad'); } });
    await expect(loadCourse('c')).rejects.toThrow(/not valid JSON/);
  });

  it('retries after a failed load', async () => {
    fetchMock.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(ok(course('java')));
    const { loadCourse } = await freshLoader('api');
    await expect(loadCourse('java')).rejects.toThrow('offline');
    await expect(loadCourse('java')).resolves.toMatchObject({ id: 'java' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe('course loader, bundle mode', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('still builds the course from the bundled data without fetching', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { loadCourse } = await freshLoader('bundle');
    const { courseIndex } = await import('./courseIndex');
    const { coursesData } = await import('./coursesData');
    const id = courseIndex[0].id;
    const lazy = await loadCourse(id);
    expect(JSON.stringify(lazy) === JSON.stringify(coursesData.find(c => c.id === id))).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  }, 240000);   // rebuilds every course from the bundled TypeScript: slow on a busy machine
});
