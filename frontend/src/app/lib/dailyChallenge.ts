// Deterministic "question of the day" built from the authored banks. Pure functions only.

export interface RawQuestion {
  id: string;
  question: string;
  /** Options as authored. */
  options: string[];
  /** Index of the correct option in `options`. */
  correctAnswer: number;
  explanation: string;
  source: string;
}

export interface DailyQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  source: string;
}

/** FNV-1a 32-bit. */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const rnd = mulberry32(seed);
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Sorted by id so the pool order never depends on import order. Drops malformed questions. */
export function normalisePool(raw: RawQuestion[]): RawQuestion[] {
  return raw
    .filter(q => q.options.length >= 2 && q.correctAnswer >= 0 && q.correctAnswer < q.options.length)
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

/** Picks the question for a local date (YYYY-MM-DD) and shuffles its options with a date-seeded shuffle. */
export function pickDailyQuestion(pool: RawQuestion[], date: string): DailyQuestion | null {
  const sorted = normalisePool(pool);
  if (sorted.length === 0) return null;
  const q = sorted[hashString(`jsl-daily:${date}`) % sorted.length];
  const tagged = q.options.map((text, i) => ({ text, ok: i === q.correctAnswer }));
  const shuffled = seededShuffle(tagged, hashString(`jsl-shuffle:${date}:${q.id}`));
  return {
    id: q.id,
    question: q.question,
    options: shuffled.map(o => o.text),
    answerIndex: shuffled.findIndex(o => o.ok),
    explanation: q.explanation,
    source: q.source,
  };
}

/** Milliseconds until the next local midnight. */
export function msUntilMidnight(now: Date = new Date()): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return next.getTime() - now.getTime();
}

export function formatCountdown(ms: number): string {
  const mins = Math.max(0, Math.ceil(ms / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// ---- Local history (YYYY-MM-DD -> answer) -------------------------------------------------------------------------

export interface DailyAnswer { qid: string; choice: number; correct: boolean }
export type DailyHistory = Record<string, DailyAnswer>;

const KEY = 'jsl_daily_v1';

export function readHistory(): DailyHistory {
  try {
    const raw = localStorage.getItem(KEY);
    const v = raw ? JSON.parse(raw) : {};
    return v && typeof v === 'object' ? v : {};
  } catch { return {}; }
}

export function saveAnswer(date: string, a: DailyAnswer): DailyHistory {
  const h = { ...readHistory(), [date]: a };
  const keys = Object.keys(h).sort();
  for (const k of keys.slice(0, Math.max(0, keys.length - 400))) delete h[k];
  try { localStorage.setItem(KEY, JSON.stringify(h)); } catch { /* storage unavailable */ }
  return h;
}
