import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

async function fresh(mode: 'api' | 'bundle') {
  vi.resetModules();
  vi.stubEnv('VITE_CONTENT_SOURCE', mode);
  vi.stubEnv('VITE_API_BASE_URL', '/api');
  return import('./datasetLoader');
}

const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body });

describe('dataset loader, api mode', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('fetches the right URL, caches, and exposes the value synchronously afterwards', async () => {
    fetchMock.mockResolvedValue(ok([{ key: 'java', label: 'Java', questions: [] }]));
    const { loadDataset, getLoadedDataset } = await fresh('api');
    expect(getLoadedDataset('quiz-banks')).toBeUndefined();
    const a = await loadDataset('quiz-banks');
    const b = await loadDataset('quiz-banks');
    expect(a).toBe(b);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('/api/content/datasets/quiz-banks');
    expect(getLoadedDataset('quiz-banks')).toBe(a);
  });

  it('study-packs is an object, the others are arrays', async () => {
    const { loadDataset } = await fresh('api');
    fetchMock.mockResolvedValueOnce(ok({ 'java/operators': { keypoints: [], interview: [], mcq: [] } }));
    await expect(loadDataset('study-packs')).resolves.toHaveProperty('java/operators');
    fetchMock.mockResolvedValueOnce(ok({ not: 'an array' }));
    await expect(loadDataset('learning-paths')).rejects.toThrow(/unexpected shape/);
    fetchMock.mockResolvedValueOnce(ok([]));
    await expect(loadDataset('predict-output')).resolves.toEqual([]);
  });

  it('rejects on 404 and on invalid JSON', async () => {
    const { loadDataset } = await fresh('api');
    fetchMock.mockResolvedValueOnce({ ok: false, status: 404, json: async () => ({}) });
    await expect(loadDataset('quiz-banks')).rejects.toThrow(/HTTP 404/);
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => { throw new SyntaxError('bad'); } });
    await expect(loadDataset('predict-output')).rejects.toThrow(/not valid JSON/);
    fetchMock.mockResolvedValueOnce(ok(null));
    await expect(loadDataset('learning-paths')).rejects.toThrow(/unexpected shape/);
  });

  it('does not cache a failure: the next call retries', async () => {
    fetchMock.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(ok([]));
    const { loadDataset, getLoadedDataset } = await fresh('api');
    await expect(loadDataset('learning-paths')).rejects.toThrow('offline');
    expect(getLoadedDataset('learning-paths')).toBeUndefined();
    await expect(loadDataset('learning-paths')).resolves.toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('preloadDatasets starts all four loads and swallows failures', async () => {
    fetchMock.mockRejectedValue(new Error('offline'));
    const { preloadDatasets } = await fresh('api');
    preloadDatasets();
    expect(fetchMock).toHaveBeenCalledTimes(4);
    await new Promise(r => setTimeout(r, 0));
  });
});

describe('dataset loader, bundle mode', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('returns the very same data as the TypeScript modules, without fetching', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { loadDataset, getLoadedDataset } = await fresh('bundle');
    const { allBanks } = await import('./quiz');
    const { predictChallenges } = await import('./predictOutput');
    const { allStudyPacks } = await import('./studyPacks');
    const { learningPaths } = await import('./learningPaths');
    expect(await loadDataset('quiz-banks')).toBe(allBanks);
    expect(await loadDataset('predict-output')).toBe(predictChallenges);
    expect(await loadDataset('study-packs')).toBe(allStudyPacks);
    expect(await loadDataset('learning-paths')).toBe(learningPaths);
    expect(getLoadedDataset('study-packs')).toBe(allStudyPacks);
    expect(fetchMock).not.toHaveBeenCalled();
  }, 60000);
});
