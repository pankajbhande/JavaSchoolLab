import { describe, it, expect } from 'vitest';
import { findBankIn } from './quizBanks';
import { findBank, allBanks } from '../data/quiz';
import { buildQuiz } from '../services/quizEngine';
import { challengesForTopicIn } from './predictOutput';
import { challengesForTopic, predictChallenges } from '../data/predictOutput';

describe('findBankIn', () => {
  it('matches the bundled findBank for every bank key and for misses', () => {
    for (const b of allBanks) {
      const [course, module] = b.key.split('/');
      expect(findBankIn(allBanks, module, course)).toBe(findBank(module, course));
      expect(findBankIn(allBanks, 'no-such-module', course)).toBe(findBank('no-such-module', course));
    }
    expect(findBankIn(allBanks, 'x', 'no-such-course')).toBeUndefined();
    expect(findBankIn(allBanks, 'x', undefined)).toBeUndefined();
    expect(findBankIn([], 'x', 'java')).toBeUndefined();
  });

  it('buildQuiz with a banks list reports unavailable when empty and certified otherwise', () => {
    const b = allBanks[0];
    const [course, module] = b.key.split('/');
    expect(buildQuiz(module, course, 1, []).mode).toBe('unavailable');
    expect(buildQuiz(module, course, 1, allBanks)).toEqual(buildQuiz(module, course, 1));
  });
});

describe('challengesForTopicIn', () => {
  it('equals the bundled challengesForTopic', () => {
    const ids = new Set(predictChallenges.map(c => c.topicId));
    for (const id of ids) expect(challengesForTopicIn(predictChallenges, id)).toEqual(challengesForTopic(id));
    expect(challengesForTopicIn([], 'x')).toEqual([]);
  });
});
