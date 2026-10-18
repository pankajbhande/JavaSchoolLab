import { describe, it, expect } from 'vitest';
import { localDay, minutesOfDay, parseClock, alarmIsDue } from './localDate';

describe('localDay', () => {
  it('uses the local calendar date, zero-padded', () => {
    expect(localDay(new Date(2026, 0, 5, 3, 0))).toBe('2026-01-05');
    expect(localDay(new Date(2026, 11, 31, 23, 59))).toBe('2026-12-31');
  });
  it('does not flip to the next day early in a time zone ahead of UTC', () => {
    // 00:30 local on the 6th is still the 6th, whatever the UTC date is
    expect(localDay(new Date(2026, 5, 6, 0, 30))).toBe('2026-06-06');
  });
});

describe('parseClock / minutesOfDay', () => {
  it('parses HH:MM and rejects junk', () => {
    expect(parseClock('07:05')).toBe(425);
    expect(parseClock('7:05')).toBe(425);
    expect(parseClock('23:59')).toBe(1439);
    expect(Number.isNaN(parseClock('24:00'))).toBe(true);
    expect(Number.isNaN(parseClock('12:60'))).toBe(true);
    expect(Number.isNaN(parseClock(''))).toBe(true);
    expect(Number.isNaN(parseClock('noon'))).toBe(true);
  });
  it('counts minutes from local midnight', () => {
    expect(minutesOfDay(new Date(2026, 0, 1, 8, 30, 59))).toBe(510);
  });
});

describe('alarmIsDue', () => {
  const at = (h: number, m: number) => new Date(2026, 0, 1, h, m, 30);
  it('rings in its own minute', () => expect(alarmIsDue('08:30', at(8, 30))).toBe(true));
  it('still rings a minute or two late (throttled background tab)', () => {
    expect(alarmIsDue('08:30', at(8, 31))).toBe(true);
    expect(alarmIsDue('08:30', at(8, 32))).toBe(true);
  });
  it('does not ring early or long after', () => {
    expect(alarmIsDue('08:30', at(8, 29))).toBe(false);
    expect(alarmIsDue('08:30', at(8, 33))).toBe(false);
  });
  it('ignores a malformed time', () => expect(alarmIsDue('abc', at(8, 30))).toBe(false));
});
