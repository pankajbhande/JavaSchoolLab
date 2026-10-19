import { describe, expect, it } from 'vitest';
import { odometer } from './odometer';

describe('odometer', () => {
  it('starts at six zeros and counts up one at a time', () => {
    expect(odometer(0)).toBe('000000');
    expect(odometer(1)).toBe('000001');
    expect(odometer(42)).toBe('000042');
    expect(odometer(1001)).toBe('001001');
    expect(odometer(999999)).toBe('999999');
  });

  it('grows a seventh digit on its own instead of cutting the number', () => {
    expect(odometer(1000000)).toBe('1000000');
  });

  it('never shows a negative, a fraction or nonsense', () => {
    expect(odometer(-5)).toBe('000000');
    expect(odometer(7.6)).toBe('000008');
    expect(odometer(Number.NaN)).toBe('000000');
    expect(odometer(Number.POSITIVE_INFINITY)).toBe('000000');
  });
});
