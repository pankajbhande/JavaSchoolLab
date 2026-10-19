import { describe, expect, it } from 'vitest';
import { ageOn, clampDob, daysInMonth, formatYmd, parseYmd } from './dob';

const today = { y: 2026, m: 10, d: 19 };

describe('dob helpers', () => {
  it('knows the length of every month, including leap years', () => {
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2025, 2)).toBe(28);
    expect(daysInMonth(2000, 2)).toBe(29);
    expect(daysInMonth(1900, 2)).toBe(28);
    expect(daysInMonth(2026, 4)).toBe(30);
    expect(daysInMonth(2026, 12)).toBe(31);
  });

  it('parses and formats yyyy-mm-dd and rejects impossible dates', () => {
    expect(parseYmd('2000-01-01')).toEqual({ y: 2000, m: 1, d: 1 });
    expect(formatYmd({ y: 2000, m: 1, d: 5 })).toBe('2000-01-05');
    expect(parseYmd('2001-02-29')).toBeNull();
    expect(parseYmd('2000-13-01')).toBeNull();
    expect(parseYmd('')).toBeNull();
    expect(parseYmd(undefined)).toBeNull();
  });

  it('pulls the day back when the month is shorter', () => {
    expect(clampDob({ y: 2001, m: 2, d: 31 }, today)).toEqual({ y: 2001, m: 2, d: 28 });
    expect(clampDob({ y: 2000, m: 2, d: 31 }, today)).toEqual({ y: 2000, m: 2, d: 29 });
  });

  it('never allows a date after today', () => {
    expect(clampDob({ y: 2030, m: 5, d: 5 }, today)).toEqual({ y: 2026, m: 5, d: 5 });
    expect(clampDob({ y: 2026, m: 12, d: 25 }, today)).toEqual({ y: 2026, m: 10, d: 19 });
    expect(clampDob({ y: 2026, m: 10, d: 30 }, today)).toEqual({ y: 2026, m: 10, d: 19 });
    expect(clampDob({ y: 2026, m: 10, d: 19 }, today)).toEqual({ y: 2026, m: 10, d: 19 });
  });

  it('counts whole years, with the birthday itself counting', () => {
    expect(ageOn({ y: 2000, m: 1, d: 1 }, today)).toBe(26);
    expect(ageOn({ y: 2000, m: 10, d: 19 }, today)).toBe(26);
    expect(ageOn({ y: 2000, m: 10, d: 20 }, today)).toBe(25);
    expect(ageOn({ y: 2000, m: 11, d: 1 }, today)).toBe(25);
    expect(ageOn({ y: 2026, m: 10, d: 19 }, today)).toBe(0);
  });
});
