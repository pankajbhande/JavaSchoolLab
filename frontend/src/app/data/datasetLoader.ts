// Loads the four non-course data sets (quiz banks, predict-the-output challenges, study packs,
// learning paths). Same switch as courseLoader.ts: VITE_CONTENT_SOURCE=api reads
// GET {API_BASE}/content/datasets/{name}; anything else resolves from the bundled TypeScript
// modules through dynamic import(), so code splitting is unchanged.
//
// Each data set is loaded at most once per visit (promise cache); a failed load is not cached.

import { API_BASE } from '../services/api';

export type DatasetName = 'quiz-banks' | 'predict-output' | 'study-packs' | 'learning-paths';

export const DATASET_NAMES: readonly DatasetName[] = ['quiz-banks', 'predict-output', 'study-packs', 'learning-paths'];

/** True when data sets come from the server. Read per call so tests can switch it. */
export function datasetsFromApi(): boolean {
  return import.meta.env.VITE_CONTENT_SOURCE === 'api';
}

const promises = new Map<DatasetName, Promise<unknown>>();
const loaded = new Map<DatasetName, unknown>();

const bundled: Record<DatasetName, () => Promise<unknown>> = {
  'quiz-banks': () => import('./quiz').then(m => m.allBanks),
  'predict-output': () => import('./predictOutput').then(m => m.predictChallenges),
  'study-packs': () => import('./studyPacks').then(m => m.allStudyPacks),
  'learning-paths': () => import('./learningPaths').then(m => m.learningPaths),
};

async function fetchDataset(name: DatasetName): Promise<unknown> {
  const res = await fetch(`${API_BASE}/content/datasets/${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error(`Could not load data set "${name}" (HTTP ${res.status})`);
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new Error(`Data set "${name}" response was not valid JSON`);
  }
  // quiz-banks, predict-output and learning-paths are arrays; study-packs is an object keyed by "course/topic"
  const isObject = body !== null && typeof body === 'object';
  if (!isObject || (name === 'study-packs') === Array.isArray(body)) {
    throw new Error(`Data set "${name}" response has an unexpected shape`);
  }
  return body;
}

export function loadDataset<T>(name: DatasetName): Promise<T> {
  let p = promises.get(name);
  if (!p) {
    p = (datasetsFromApi() ? fetchDataset(name) : bundled[name]()).then(v => {
      loaded.set(name, v);
      return v;
    });
    promises.set(name, p);
    // a failed download must be retryable, not cached forever
    const mine = p;
    mine.catch(() => { if (promises.get(name) === mine) promises.delete(name); });
  }
  return p as Promise<T>;
}

/** The data set if it has already finished loading, otherwise undefined. */
export function getLoadedDataset<T>(name: DatasetName): T | undefined {
  return loaded.get(name) as T | undefined;
}

/** Starts all four loads (fire and forget; failures surface when a consumer asks again). */
export function preloadDatasets(): void {
  for (const n of DATASET_NAMES) loadDataset(n).catch(() => {});
}
