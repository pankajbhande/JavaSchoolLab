// Spaced-repetition scheduler (Anki / SM-2 flavoured Leitner boxes). Everything here is pure:
// callers pass `now` (epoch ms) and get a new state back, so it is trivial to test and the
// storage layer stays separate.
//
//   new       never seen
//   learning  being learned (or relearned after a lapse) through short minute-level steps
//   review    graduated; scheduled in whole days, growing by the ease factor

export type Grade = 'again' | 'hard' | 'good' | 'easy';
export const GRADES: Grade[] = ['again', 'hard', 'good', 'easy'];

export type CardPhase = 'new' | 'learning' | 'review';

export interface CardState {
  phase: CardPhase;
  /** Index into LEARNING_STEPS_MIN while phase is "learning". */
  step: number;
  /** Interval in days once graduated (0 while learning). */
  interval: number;
  /** SM-2 ease factor, never below MIN_EASE. */
  ease: number;
  reps: number;
  lapses: number;
  /** Epoch ms when the card is next due. 0 for a new card. */
  due: number;
  /** Epoch ms of the last review, 0 if never. */
  last: number;
}

export const MINUTE = 60_000;
export const DAY = 24 * 60 * MINUTE;
export const LEARNING_STEPS_MIN = [1, 10];
export const START_EASE = 2.5;
export const MIN_EASE = 1.3;
export const GRADUATING_INTERVAL = 1;
export const EASY_INTERVAL = 4;
export const DEFAULT_NEW_PER_DAY = 10;

export function newCard(): CardState {
  return { phase: 'new', step: 0, interval: 0, ease: START_EASE, reps: 0, lapses: 0, due: 0, last: 0 };
}

const clampEase = (e: number) => Math.max(MIN_EASE, Math.round(e * 100) / 100);

/** Grade a card and return its next state. Never mutates the input. */
export function review(card: CardState, grade: Grade, now: number): CardState {
  const base = { ...card, reps: card.reps + 1, last: now };
  const learnDue = (step: number) => now + LEARNING_STEPS_MIN[step] * MINUTE;
  const graduate = (days: number): CardState => ({
    ...base, phase: 'review', step: 0, interval: days, due: now + days * DAY,
  });

  if (card.phase === 'new' || card.phase === 'learning') {
    const step = card.phase === 'new' ? 0 : card.step;
    switch (grade) {
      case 'again':
        return { ...base, phase: 'learning', step: 0, due: learnDue(0) };
      case 'hard':
        return { ...base, phase: 'learning', step, due: learnDue(step) };
      case 'good':
        if (step + 1 >= LEARNING_STEPS_MIN.length) {
          // A relearning card keeps the interval it was reduced to, minimum one day
          return graduate(Math.max(GRADUATING_INTERVAL, card.interval));
        }
        return { ...base, phase: 'learning', step: step + 1, due: learnDue(step + 1) };
      case 'easy':
        return graduate(Math.max(EASY_INTERVAL, card.interval));
    }
  }

  // review phase
  const days = card.interval;
  switch (grade) {
    case 'again':
      return {
        ...base,
        phase: 'learning',
        step: 0,
        // after relearning the card returns at half its old interval (at least a day)
        interval: Math.max(1, Math.round(days * 0.5)),
        ease: clampEase(card.ease - 0.2),
        lapses: card.lapses + 1,
        due: learnDue(0),
      };
    case 'hard': {
      const next = Math.max(days + 1, Math.round(days * 1.2));
      return { ...base, interval: next, ease: clampEase(card.ease - 0.15), due: now + next * DAY };
    }
    case 'good': {
      const next = Math.max(days + 1, Math.round(days * card.ease));
      return { ...base, interval: next, due: now + next * DAY };
    }
    case 'easy': {
      const next = Math.max(days + 2, Math.round(days * card.ease * 1.3));
      return { ...base, interval: next, ease: clampEase(card.ease + 0.15), due: now + next * DAY };
    }
  }
}

/** True when the card should be shown now. New cards are handled by the daily limit instead. */
export function isDue(card: CardState, now: number): boolean {
  return card.phase !== 'new' && card.due <= now;
}

/** "10m", "1d", "3d", "2mo" - label for the wait a grade would produce. */
export function formatWait(ms: number): string {
  const mins = Math.round(ms / MINUTE);
  if (ms < MINUTE) return '<1m';
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(ms / (60 * MINUTE));
  if (hours < 24) return `${hours}h`;
  const days = Math.round(ms / DAY);
  if (days < 30) return `${days}d`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${Math.round((days / 365) * 10) / 10}y`;
}

/** What each grade would schedule, for the labels on the answer buttons. */
export function previewWaits(card: CardState, now: number): Record<Grade, string> {
  const out = {} as Record<Grade, string>;
  for (const g of GRADES) out[g] = formatWait(review(card, g, now).due - now);
  return out;
}

export interface QueueInput {
  id: string;
  state: CardState;
}

export interface QueueOptions {
  /** Maximum new cards per day. */
  newLimit: number;
  /** New cards already introduced today. */
  newIntroducedToday: number;
}

/**
 * Builds a review session: every due learning/review card (most overdue first) followed by as
 * many new cards as the daily limit still allows, in the order given.
 */
export function buildQueue(cards: QueueInput[], now: number, opts: QueueOptions): string[] {
  const due = cards
    .filter(c => isDue(c.state, now))
    .sort((a, b) => a.state.due - b.state.due)
    .map(c => c.id);
  const room = Math.max(0, opts.newLimit - opts.newIntroducedToday);
  const fresh = cards.filter(c => c.state.phase === 'new').slice(0, room).map(c => c.id);
  return [...due, ...fresh];
}

export interface DueCounts {
  due: number;
  fresh: number;
  total: number;
}

/** Counts for the deck picker: due reviews, new cards available today, deck size. */
export function countDue(cards: QueueInput[], now: number, opts: QueueOptions): DueCounts {
  let due = 0;
  let newCount = 0;
  for (const c of cards) {
    if (isDue(c.state, now)) due++;
    else if (c.state.phase === 'new') newCount++;
  }
  const room = Math.max(0, opts.newLimit - opts.newIntroducedToday);
  return { due, fresh: Math.min(newCount, room), total: cards.length };
}
