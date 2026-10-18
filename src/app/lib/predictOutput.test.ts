import { describe, it, expect } from 'vitest';
import { predictChallenges, challengesForTopic } from '../data/predictOutput';
import { courseIndex } from '../data/courseIndex';
import {
  seededShuffle,
  optionsFor,
  loadState,
  saveState,
  scoreFor,
  firstUnansweredIndex,
  PREDICT_STORAGE_KEY,
} from './predictOutput';

describe('predict-output content', () => {
  it('has a healthy number of challenges', () => {
    expect(predictChallenges.length).toBeGreaterThanOrEqual(60);
  });

  it('has unique ids', () => {
    const ids = predictChallenges.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('only uses topic ids that exist in the java course', () => {
    const java = courseIndex.find((c) => c.id === 'java');
    expect(java).toBeTruthy();
    const topicIds = new Set(java!.subTopics.flatMap((m) => m.topics.map((t) => t.id)));
    for (const c of predictChallenges) expect(topicIds.has(c.topicId), `${c.id} -> ${c.topicId}`).toBe(true);
  });

  it('has 2 to 4 challenges per topic', () => {
    const byTopic = new Map<string, number>();
    for (const c of predictChallenges) byTopic.set(c.topicId, (byTopic.get(c.topicId) ?? 0) + 1);
    for (const [t, n] of byTopic) {
      expect(n, t).toBeGreaterThanOrEqual(2);
      expect(n, t).toBeLessThanOrEqual(7);
    }
  });

  it('every challenge has exactly one correct option among four distinct options', () => {
    for (const c of predictChallenges) {
      const opts = optionsFor(c);
      expect(opts, c.id).toHaveLength(4);
      expect(new Set(opts).size, c.id).toBe(4);
      expect(opts.filter((o) => o === c.answer), c.id).toHaveLength(1);
      expect(c.wrong).not.toContain(c.answer);
    }
  });

  it('has real code and non-trivial explanations', () => {
    for (const c of predictChallenges) {
      expect(c.code, c.id).toContain('public class Main');
      expect(c.code, c.id).toContain('static void main');
      expect(c.explanation.length, c.id).toBeGreaterThan(60);
      expect(c.trap.length, c.id).toBeGreaterThan(20);
      expect(c.title.length, c.id).toBeGreaterThan(5);
    }
  });

  it('challengesForTopic filters and unknown topics are empty', () => {
    expect(challengesForTopic('operators').length).toBeGreaterThan(1);
    expect(challengesForTopic('nope')).toEqual([]);
  });
});

describe('seededShuffle', () => {
  it('is deterministic per seed and keeps all items', () => {
    const a = seededShuffle([1, 2, 3, 4, 5, 6], 'seed');
    expect(seededShuffle([1, 2, 3, 4, 5, 6], 'seed')).toEqual(a);
    expect([...a].sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });
  it('does not mutate the input', () => {
    const src = [1, 2, 3, 4];
    seededShuffle(src, 'x');
    expect(src).toEqual([1, 2, 3, 4]);
  });
  it('different seeds give varied correct-answer positions', () => {
    const positions = new Set(predictChallenges.map((c) => optionsFor(c).indexOf(c.answer)));
    expect(positions.size).toBe(4);
  });
});

describe('state persistence and score', () => {
  const mem = () => {
    const m: Record<string, string> = {};
    return {
      getItem: (k: string) => (k in m ? m[k] : null),
      setItem: (k: string, v: string) => void (m[k] = v),
    };
  };
  it('round-trips and tolerates garbage', () => {
    const s = mem();
    saveState({ a: 'x' }, s);
    expect(loadState(s)).toEqual({ a: 'x' });
    s.setItem(PREDICT_STORAGE_KEY, '{bad');
    expect(loadState(s)).toEqual({});
    s.setItem(PREDICT_STORAGE_KEY, '[1]');
    expect(loadState(s)).toEqual({});
    s.setItem(PREDICT_STORAGE_KEY, JSON.stringify({ a: 1, b: 'y' }));
    expect(loadState(s)).toEqual({ b: 'y' });
  });
  it('scores and finds the next unanswered', () => {
    const cs = challengesForTopic('operators').slice(0, 3);
    const state = { [cs[0].id]: cs[0].answer, [cs[1].id]: 'wrong' };
    expect(scoreFor(cs, state)).toEqual({ correct: 1, answered: 2, total: 3 });
    expect(firstUnansweredIndex(cs, state)).toBe(2);
    expect(firstUnansweredIndex(cs, {})).toBe(0);
  });
});
