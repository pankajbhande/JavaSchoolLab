import { describe, it, expect } from 'vitest';
import {
  todayLocal, toLocalDateString, daysBetween,
  computeStreaks, computeXp, reviewIntervalDays, isDue,
  XP_PER_TOPIC, XP_PER_MODULE_PASSED, XP_PER_STUDY_DAY,
} from './progress.js';

describe('toLocalDateString', () => {
  // The original bug: mysql2 returns a DATE as a JS Date at LOCAL midnight, and
  // toISOString() converts to UTC, rolling the date back a day for every timezone ahead
  // of UTC. "Today" then never matched and studySecondsToday was permanently 0.
  it('keeps a local-midnight Date on its own calendar day', () => {
    const localMidnight = new Date(2026, 7, 26); // 26 Aug 2026, local
    expect(toLocalDateString(localMidnight)).toBe('2026-08-26');
  });

  it('does not regress to the UTC-shifted value', () => {
    const localMidnight = new Date(2026, 7, 26);
    const utcShifted = localMidnight.toISOString().slice(0, 10);
    // The suite runs in Asia/Kolkata (UTC+5:30), so these genuinely differ.
    expect(utcShifted).toBe('2026-08-25');
    expect(toLocalDateString(localMidnight)).not.toBe(utcShifted);
  });

  it('passes through a string date untouched', () => {
    expect(toLocalDateString('2026-01-09')).toBe('2026-01-09');
    expect(toLocalDateString('2026-01-09T00:00:00.000Z')).toBe('2026-01-09');
  });

  it('zero-pads single-digit months and days', () => {
    expect(toLocalDateString(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('todayLocal', () => {
  it('formats the injected clock in local time', () => {
    expect(todayLocal(new Date(2026, 11, 31, 23, 59))).toBe('2026-12-31');
  });
});

describe('daysBetween', () => {
  it('counts forward, backward and across a month boundary', () => {
    expect(daysBetween('2026-08-26', '2026-08-27')).toBe(1);
    expect(daysBetween('2026-08-27', '2026-08-26')).toBe(-1);
    expect(daysBetween('2026-08-26', '2026-08-26')).toBe(0);
    expect(daysBetween('2026-08-31', '2026-09-01')).toBe(1);
  });

  it('handles a leap day', () => {
    expect(daysBetween('2028-02-28', '2028-03-01')).toBe(2);
  });
});

describe('computeStreaks', () => {
  const days = (...d) => d.map(date => ({ date }));

  it('is zero with no studied days', () => {
    expect(computeStreaks([], '2026-08-26')).toEqual({ currentStreak: 0, longestStreak: 0 });
  });

  it('counts a run ending today', () => {
    const r = computeStreaks(days('2026-08-26', '2026-08-25', '2026-08-24'), '2026-08-26');
    expect(r.currentStreak).toBe(3);
  });

  it('keeps the streak alive when the last study day was yesterday', () => {
    // Otherwise every streak would break at midnight, before the student could study.
    const r = computeStreaks(days('2026-08-25', '2026-08-24'), '2026-08-26');
    expect(r.currentStreak).toBe(2);
  });

  it('breaks the streak once two days have passed', () => {
    const r = computeStreaks(days('2026-08-24', '2026-08-23'), '2026-08-26');
    expect(r.currentStreak).toBe(0);
    expect(r.longestStreak).toBe(2); // history still counts
  });

  it('stops the current run at the first gap', () => {
    const r = computeStreaks(days('2026-08-26', '2026-08-25', '2026-08-22', '2026-08-21'), '2026-08-26');
    expect(r.currentStreak).toBe(2);
  });

  it('reports the longest historical run even when it is not the current one', () => {
    const r = computeStreaks(
      days('2026-08-26', '2026-08-20', '2026-08-19', '2026-08-18', '2026-08-17'),
      '2026-08-26',
    );
    expect(r.currentStreak).toBe(1);
    expect(r.longestStreak).toBe(4);
  });
});

describe('computeXp', () => {
  it('applies the published formula', () => {
    expect(computeXp({ topicsSeen: 6, modulesPassed: 1, studyDays: 1 }))
      .toBe(6 * XP_PER_TOPIC + 1 * XP_PER_MODULE_PASSED + 1 * XP_PER_STUDY_DAY);
  });

  it('is zero for a brand new account', () => {
    expect(computeXp({ topicsSeen: 0, modulesPassed: 0, studyDays: 0 })).toBe(0);
  });
});

describe('reviewIntervalDays', () => {
  it('brings weaker scores back sooner, at the documented boundaries', () => {
    expect(reviewIntervalDays(0)).toBe(1);
    expect(reviewIntervalDays(69)).toBe(1);
    expect(reviewIntervalDays(70)).toBe(3);
    expect(reviewIntervalDays(84)).toBe(3);
    expect(reviewIntervalDays(85)).toBe(7);
    expect(reviewIntervalDays(94)).toBe(7);
    expect(reviewIntervalDays(95)).toBe(21);
    expect(reviewIntervalDays(100)).toBe(21);
  });
});

describe('isDue', () => {
  it('always surfaces a module that was never passed', () => {
    expect(isDue({ everPassed: false, best: 95, daysSinceLastAttempt: 0 })).toBe(true);
  });

  it('holds a perfect score back for three weeks', () => {
    expect(isDue({ everPassed: true, best: 100, daysSinceLastAttempt: 20 })).toBe(false);
    expect(isDue({ everPassed: true, best: 100, daysSinceLastAttempt: 21 })).toBe(true);
  });

  it('returns a barely-passed module the next day', () => {
    expect(isDue({ everPassed: true, best: 70, daysSinceLastAttempt: 2 })).toBe(false);
    expect(isDue({ everPassed: true, best: 70, daysSinceLastAttempt: 3 })).toBe(true);
  });
});
