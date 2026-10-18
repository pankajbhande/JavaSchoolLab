import { describe, it, expect } from 'vitest';
import { pickDailyQuestion, seededShuffle, formatCountdown, msUntilMidnight, type RawQuestion } from './dailyChallenge';

const pool: RawQuestion[] = Array.from({ length: 40 }, (_, i) => ({
  id: `q${i}`, question: `Question ${i}?`, options: ['right', 'w1', 'w2', 'w3'], correctAnswer: 0,
  explanation: 'because', source: 'test',
}));
const day = (d: number) => `2026-02-${String(d).padStart(2, '0')}`;

describe('daily challenge', () => {
  it('is deterministic for a date and independent of pool order', () => {
    const a = pickDailyQuestion(pool, '2026-10-17');
    const b = pickDailyQuestion([...pool].reverse(), '2026-10-17');
    expect(a).toEqual(b);
  });
  it('tracks the correct answer through the shuffle', () => {
    for (let d = 1; d <= 28; d++) {
      const q = pickDailyQuestion(pool, day(d))!;
      expect(q.options[q.answerIndex]).toBe('right');
      expect([...q.options].sort()).toEqual(['right', 'w1', 'w2', 'w3']);
    }
  });
  it('varies across days and does not always put the answer first', () => {
    const ids = new Set<string>();
    const pos = new Set<number>();
    for (let d = 1; d <= 28; d++) {
      const q = pickDailyQuestion(pool, day(d))!;
      ids.add(q.id);
      pos.add(q.answerIndex);
    }
    expect(ids.size).toBeGreaterThan(10);
    expect(pos.size).toBeGreaterThan(1);
  });
  it('handles empty and malformed pools', () => {
    expect(pickDailyQuestion([], '2026-10-17')).toBeNull();
    expect(pickDailyQuestion([{ ...pool[0], correctAnswer: 9 }], '2026-10-17')).toBeNull();
  });
  it('seededShuffle is stable', () => {
    expect(seededShuffle([1, 2, 3, 4, 5], 7)).toEqual(seededShuffle([1, 2, 3, 4, 5], 7));
  });
  it('countdown helpers', () => {
    expect(formatCountdown(90 * 60000)).toBe('1h 30m');
    expect(formatCountdown(5 * 60000)).toBe('5m');
    expect(msUntilMidnight(new Date(2026, 9, 17, 23, 0, 0))).toBe(3600000);
  });
});
