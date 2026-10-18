// localStorage persistence for flashcards and mock-interview history. Nothing leaves the device.
// Every access is wrapped: storage can be blocked or full, and the page must still work.

import type { CardState } from './spaced';
import type { AnswerResult } from './interview';
import { localDay } from './localDate';

const CARDS_KEY = 'jsl.flashcards.v1';
const SESSIONS_KEY = 'jsl.interview.sessions.v1';

export interface FlashcardStore {
  cards: Record<string, CardState>;
  /** New cards introduced on `day` (local date). */
  newToday: { day: string; count: number };
  newLimit: number;
}

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* storage unavailable: progress simply is not saved */ }
}

export function loadFlashcardStore(now = new Date()): FlashcardStore {
  const s = read<FlashcardStore>(CARDS_KEY);
  const day = localDay(now);
  return {
    cards: s && typeof s.cards === 'object' && s.cards ? s.cards : {},
    newToday: s?.newToday?.day === day ? s.newToday : { day, count: 0 },
    newLimit: s?.newLimit && s.newLimit > 0 ? s.newLimit : 10,
  };
}

export function saveFlashcardStore(s: FlashcardStore) {
  write(CARDS_KEY, s);
}

export interface InterviewSession {
  at: number;
  scope: string;
  total: number;
  percent: number;
  results: AnswerResult[];
}

export function loadSessions(): InterviewSession[] {
  const s = read<InterviewSession[]>(SESSIONS_KEY);
  return Array.isArray(s) ? s : [];
}

export function saveSession(session: InterviewSession, keep = 20): InterviewSession[] {
  const all = [session, ...loadSessions()].slice(0, keep);
  write(SESSIONS_KEY, all);
  return all;
}
