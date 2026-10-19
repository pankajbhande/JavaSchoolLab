import { describe, expect, it } from 'vitest';
import { genderOf, pickVoice } from './voicePicker';

const v = (name: string, lang = 'en-IN') => ({ name, lang });

describe('genderOf', () => {
  it('reads gender from known names and whole words', () => {
    expect(genderOf('Microsoft Neerja Online (Natural) - English (India)')).toBe('female');
    expect(genderOf('Microsoft Prabhat Online (Natural) - English (India)')).toBe('male');
    expect(genderOf('Microsoft Ravi - English (India)')).toBe('male');
    expect(genderOf('Microsoft Heera - English (India)')).toBe('female');
    expect(genderOf('Microsoft David - English (United States)')).toBe('male');
    expect(genderOf('Some Voice Female')).toBe('female');
    expect(genderOf('Some Voice Male')).toBe('male');
  });

  it('does not confuse "male" with "female" or "man" with "woman"', () => {
    expect(genderOf('English Female')).toBe('female');
    expect(genderOf('A Woman Voice')).toBe('female');
  });

  it('Prataprao is a male voice', () => {
    expect(genderOf('Prataprao')).toBe('male');
  });

  it('returns null when the name says nothing', () => {
    expect(genderOf('Google हिन्दी')).toBeNull();
  });
});

describe('pickVoice', () => {
  const edge = [
    v('Microsoft David - English (United States)', 'en-US'),
    v('Microsoft Ravi - English (India)'),
    v('Microsoft Heera - English (India)'),
    v('Microsoft Neerja Online (Natural) - English (India)'),
    v('Microsoft Prabhat Online (Natural) - English (India)'),
  ];

  it('girl voice is a woman, preferring the Natural Indian one', () => {
    const p = pickVoice(edge, 'female');
    expect(p.voice?.name).toContain('Neerja');
    expect(p.exact).toBe(true);
  });

  it('boy voice is a man, preferring the Natural Indian one', () => {
    const p = pickVoice(edge, 'male');
    expect(p.voice?.name).toContain('Prabhat');
    expect(p.exact).toBe(true);
  });

  it('the girl voice is never a male voice, even when no female voice is installed', () => {
    const onlyMen = [v('Microsoft David - English (United States)', 'en-US'), v('Microsoft Ravi - English (India)')];
    const p = pickVoice(onlyMen, 'female');
    expect(p.exact).toBe(false);
    expect(p.voice).toBeUndefined();
  });

  it('falls back to an unknown-gender voice, flagged as not exact', () => {
    const p = pickVoice([v('Google US English', 'en-US'), v('Microsoft David - English (United States)', 'en-US')], 'female');
    expect(p.exact).toBe(false);
    expect(p.voice?.name).toBe('Google US English');
  });

  it('prefers Indian English over other English of the same gender', () => {
    const p = pickVoice([v('Microsoft Zira - English (United States)', 'en-US'), v('Microsoft Heera - English (India)')], 'female');
    expect(p.voice?.name).toContain('Heera');
  });

  it('ignores non-English voices', () => {
    const p = pickVoice([v('Microsoft Hedda - German', 'de-DE')], 'female');
    expect(p.voice).toBeUndefined();
  });
});
