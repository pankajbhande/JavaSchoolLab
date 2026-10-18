import { describe, it, expect } from 'vitest';
import {
  newCard, review, isDue, buildQueue, countDue, formatWait, previewWaits,
  MINUTE, DAY, START_EASE, MIN_EASE, type CardState,
} from './spaced';

const NOW = 1_700_000_000_000;
const reviewCard = (over: Partial<CardState> = {}): CardState => ({
  ...newCard(), phase: 'review', interval: 10, due: NOW, reps: 5, ...over,
});

describe('new and learning cards', () => {
  it('starts new, with default ease', () => {
    const c = newCard();
    expect(c.phase).toBe('new');
    expect(c.ease).toBe(START_EASE);
    expect(isDue(c, NOW)).toBe(false);
  });

  it('again puts a new card in learning, due in 1 minute', () => {
    const c = review(newCard(), 'again', NOW);
    expect(c.phase).toBe('learning');
    expect(c.step).toBe(0);
    expect(c.due).toBe(NOW + MINUTE);
    expect(c.reps).toBe(1);
  });

  it('hard repeats the current step', () => {
    const c = review(newCard(), 'hard', NOW);
    expect(c.phase).toBe('learning');
    expect(c.step).toBe(0);
    expect(c.due).toBe(NOW + MINUTE);
  });

  it('good walks the steps then graduates to 1 day', () => {
    const a = review(newCard(), 'good', NOW);
    expect(a.phase).toBe('learning');
    expect(a.step).toBe(1);
    expect(a.due).toBe(NOW + 10 * MINUTE);
    const b = review(a, 'good', NOW + 10 * MINUTE);
    expect(b.phase).toBe('review');
    expect(b.interval).toBe(1);
    expect(b.due).toBe(NOW + 10 * MINUTE + DAY);
  });

  it('easy graduates immediately with a 4 day interval', () => {
    const c = review(newCard(), 'easy', NOW);
    expect(c.phase).toBe('review');
    expect(c.interval).toBe(4);
    expect(c.due).toBe(NOW + 4 * DAY);
  });

  it('a learning card is due only once its step has elapsed', () => {
    const c = review(newCard(), 'again', NOW);
    expect(isDue(c, NOW)).toBe(false);
    expect(isDue(c, NOW + MINUTE)).toBe(true);
  });

  it('does not mutate its input', () => {
    const c = newCard();
    review(c, 'good', NOW);
    expect(c).toEqual(newCard());
  });
});

describe('review cards', () => {
  it('good multiplies the interval by the ease', () => {
    const c = review(reviewCard(), 'good', NOW);
    expect(c.interval).toBe(25);
    expect(c.due).toBe(NOW + 25 * DAY);
    expect(c.ease).toBe(START_EASE);
  });

  it('hard grows slowly and lowers ease', () => {
    const c = review(reviewCard(), 'hard', NOW);
    expect(c.interval).toBe(12);
    expect(c.ease).toBe(2.35);
  });

  it('easy grows fastest and raises ease', () => {
    const c = review(reviewCard(), 'easy', NOW);
    expect(c.interval).toBe(33);
    expect(c.ease).toBe(2.65);
  });

  it('orders intervals hard < good < easy', () => {
    const h = review(reviewCard(), 'hard', NOW).interval;
    const g = review(reviewCard(), 'good', NOW).interval;
    const e = review(reviewCard(), 'easy', NOW).interval;
    expect(h).toBeLessThan(g);
    expect(g).toBeLessThan(e);
  });

  it('always grows by at least a day on small intervals', () => {
    expect(review(reviewCard({ interval: 1 }), 'hard', NOW).interval).toBe(2);
    expect(review(reviewCard({ interval: 1, ease: MIN_EASE }), 'good', NOW).interval).toBe(2);
  });

  it('again is a lapse: relearning, lower ease, halved interval', () => {
    const c = review(reviewCard(), 'again', NOW);
    expect(c.phase).toBe('learning');
    expect(c.lapses).toBe(1);
    expect(c.ease).toBe(2.3);
    expect(c.interval).toBe(5);
    expect(c.due).toBe(NOW + MINUTE);
  });

  it('a relearning card returns to review at its reduced interval', () => {
    let c = review(reviewCard(), 'again', NOW);
    c = review(c, 'good', NOW + MINUTE);
    c = review(c, 'good', NOW + 11 * MINUTE);
    expect(c.phase).toBe('review');
    expect(c.interval).toBe(5);
  });

  it('never drops ease below the floor', () => {
    let c = reviewCard({ ease: 1.35 });
    c = review(c, 'hard', NOW);
    expect(c.ease).toBe(MIN_EASE);
    c = review({ ...c, phase: 'review', interval: 3 }, 'again', NOW);
    expect(c.ease).toBe(MIN_EASE);
  });

  it('is due from its due time onward', () => {
    const c = reviewCard({ due: NOW + DAY });
    expect(isDue(c, NOW)).toBe(false);
    expect(isDue(c, NOW + DAY)).toBe(true);
  });
});

describe('queue and daily limit', () => {
  const cards = [
    { id: 'n1', state: newCard() },
    { id: 'n2', state: newCard() },
    { id: 'n3', state: newCard() },
    { id: 'r-late', state: reviewCard({ due: NOW - 3 * DAY }) },
    { id: 'r-early', state: reviewCard({ due: NOW - DAY }) },
    { id: 'r-future', state: reviewCard({ due: NOW + DAY }) },
  ];

  it('lists due cards (most overdue first) then new cards up to the limit', () => {
    expect(buildQueue(cards, NOW, { newLimit: 2, newIntroducedToday: 0 })).toEqual(['r-late', 'r-early', 'n1', 'n2']);
  });

  it('subtracts new cards already introduced today', () => {
    expect(buildQueue(cards, NOW, { newLimit: 2, newIntroducedToday: 1 })).toEqual(['r-late', 'r-early', 'n1']);
  });

  it('adds no new cards once the limit is reached, but still serves due ones', () => {
    expect(buildQueue(cards, NOW, { newLimit: 2, newIntroducedToday: 5 })).toEqual(['r-late', 'r-early']);
  });

  it('counts due, available new and total', () => {
    expect(countDue(cards, NOW, { newLimit: 2, newIntroducedToday: 0 })).toEqual({ due: 2, fresh: 2, total: 6 });
    expect(countDue(cards, NOW, { newLimit: 10, newIntroducedToday: 0 })).toEqual({ due: 2, fresh: 3, total: 6 });
  });
});

describe('labels', () => {
  it('formats waits', () => {
    expect(formatWait(30_000)).toBe('<1m');
    expect(formatWait(10 * MINUTE)).toBe('10m');
    expect(formatWait(5 * 60 * MINUTE)).toBe('5h');
    expect(formatWait(DAY)).toBe('1d');
    expect(formatWait(60 * DAY)).toBe('2mo');
  });

  it('previews each grade for a new card', () => {
    expect(previewWaits(newCard(), NOW)).toEqual({ again: '1m', hard: '1m', good: '10m', easy: '4d' });
  });
});
