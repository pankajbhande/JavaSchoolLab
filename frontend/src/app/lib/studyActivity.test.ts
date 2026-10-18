import { describe, expect, it } from 'vitest';
import { activeDayCount, addDays, buildHeatmap, formatMinutes, levelFor, weekSeconds, weekStart } from './studyActivity';

describe('weekStart', () => {
  it('returns the Monday of the week', () => {
    expect(weekStart('2026-10-17')).toBe('2026-10-12'); // Saturday
    expect(weekStart('2026-10-12')).toBe('2026-10-12'); // Monday
    expect(weekStart('2026-10-18')).toBe('2026-10-12'); // Sunday belongs to the week that began Monday
  });
});

describe('levelFor', () => {
  it('maps minutes to shades', () => {
    expect([0, 60, 15 * 60, 30 * 60, 60 * 60].map(levelFor)).toEqual([0, 1, 2, 3, 4]);
  });
});

describe('buildHeatmap', () => {
  const today = '2026-10-17'; // Saturday
  const map = buildHeatmap([{ date: '2026-10-12', seconds: 1800 }, { date: '2026-10-17', seconds: 60 }], today, 4);

  it('has the requested weeks of 7 days, ending with the current week', () => {
    expect(map).toHaveLength(4);
    expect(map.every(col => col.length === 7)).toBe(true);
    expect(map[3][0].date).toBe('2026-10-12');
    expect(map[0][0].date).toBe(addDays('2026-10-12', -21));
  });

  it('fills levels and blanks out days after today', () => {
    expect(map[3][0].level).toBe(3);
    expect(map[3][5]).toMatchObject({ date: '2026-10-17', level: 1, future: false });
    expect(map[3][6]).toMatchObject({ date: '2026-10-18', future: true, level: 0 });
  });
});

describe('weekSeconds', () => {
  it('sums only this week up to today', () => {
    const days = [
      { date: '2026-10-11', seconds: 999 }, // last Sunday, excluded
      { date: '2026-10-12', seconds: 600 },
      { date: '2026-10-17', seconds: 300 },
    ];
    expect(weekSeconds(days, '2026-10-17')).toBe(900);
  });
});

describe('activeDayCount', () => {
  it('counts studied days inside the window only', () => {
    const days = [{ date: '2026-10-12', seconds: 60 }, { date: '2026-10-13', seconds: 0 }, { date: '2020-01-01', seconds: 60 }];
    expect(activeDayCount(days, '2026-10-17', 4)).toBe(1);
  });
});

describe('formatMinutes', () => {
  it('formats hours and minutes', () => {
    expect(formatMinutes(45)).toBe('45m');
    expect(formatMinutes(120)).toBe('2h');
    expect(formatMinutes(150)).toBe('2h 30m');
  });
});
