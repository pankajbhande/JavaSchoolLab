import { describe, it, expect } from 'vitest';
import { computeXp, levelFromXp, xpForLevel, streakFromDates } from './xp';

describe('xp', () => {
  it('sums sources and ignores junk', () => {
    expect(computeXp({ topicsSeen: 3, quizzesPassed: 1, dailyAnswered: 2, dailyCorrect: 1, studySeconds: 125 })).toBe(30 + 50 + 10 + 10 + 2);
    expect(computeXp({ topicsSeen: -1, quizzesPassed: NaN, dailyAnswered: 0, dailyCorrect: 0, studySeconds: 59 })).toBe(0);
  });
  it('level thresholds', () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(2)).toBe(100);
    expect(xpForLevel(3)).toBe(300);
    expect(levelFromXp(0)).toMatchObject({ level: 1, percent: 0, xpForNext: 100 });
    expect(levelFromXp(99).level).toBe(1);
    expect(levelFromXp(100)).toMatchObject({ level: 2, xpIntoLevel: 0, xpForNext: 200 });
    expect(levelFromXp(200)).toMatchObject({ level: 2, percent: 50 });
    expect(levelFromXp(-5).level).toBe(1);
  });
  it('streaks', () => {
    const r = streakFromDates(['2026-10-17', '2026-10-16', '2026-10-15', '2026-10-01', '2026-10-02'], '2026-10-17');
    expect(r).toEqual({ current: 3, longest: 3 });
    expect(streakFromDates(['2026-10-16'], '2026-10-17').current).toBe(1);
    expect(streakFromDates(['2026-10-10'], '2026-10-17').current).toBe(0);
    expect(streakFromDates([], '2026-10-17')).toEqual({ current: 0, longest: 0 });
  });
});
