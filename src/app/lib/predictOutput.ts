// Pure helpers for the "Predict the output" feature (no React, no DOM except guarded storage).
import type { PredictChallenge } from '../data/predictOutput';

export const PREDICT_STORAGE_KEY = 'jsl_predict_v1';

/** Deterministic 32-bit hash of a string (FNV-1a). */
export function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Small seeded PRNG (mulberry32). Returns numbers in [0, 1). */
export function seededRandom(seed: string): () => number {
  let a = hashSeed(seed);
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates shuffle that always gives the same order for the same seed. Does not mutate. */
export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  const out = items.slice();
  const rand = seededRandom(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** The four options of a challenge in their stable shuffled order. */
export function optionsFor(c: Pick<PredictChallenge, 'id' | 'answer' | 'wrong'>): string[] {
  return seededShuffle([c.answer, ...c.wrong], c.id);
}

export interface PredictState {
  /** challenge id -> the option text the learner picked (kept only until "Try again"). */
  [id: string]: string;
}

export function loadState(storage?: Pick<Storage, 'getItem'> | null): PredictState {
  try {
    const s = storage === undefined ? (typeof localStorage === 'undefined' ? null : localStorage) : storage;
    const raw = s?.getItem(PREDICT_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const out: PredictState = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === 'string') out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

export function saveState(state: PredictState, storage?: Pick<Storage, 'setItem'> | null): void {
  try {
    const s = storage === undefined ? (typeof localStorage === 'undefined' ? null : localStorage) : storage;
    s?.setItem(PREDICT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* private mode / quota: the feature still works for this visit */
  }
}

/** How many of the given challenges were answered correctly / answered at all. */
export function scoreFor(challenges: readonly PredictChallenge[], state: PredictState) {
  let correct = 0;
  let answered = 0;
  for (const c of challenges) {
    const picked = state[c.id];
    if (picked === undefined) continue;
    answered++;
    if (picked === c.answer) correct++;
  }
  return { correct, answered, total: challenges.length };
}

/** Index of the first unanswered challenge, or 0 when all are answered / none exist. */
export function firstUnansweredIndex(challenges: readonly PredictChallenge[], state: PredictState): number {
  const i = challenges.findIndex((c) => state[c.id] === undefined);
  return i === -1 ? 0 : i;
}
