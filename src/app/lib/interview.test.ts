import { describe, it, expect } from 'vitest';
import {
  shuffle, pickQuestions, scorePercent, tally, weakTopics, questionsForTopics, verdict,
  type AnswerResult,
} from './interview';
import type { QCard } from './questionBank';

const card = (id: string, topicId: string): QCard => ({
  id, courseId: 'java', topicId, topicName: topicId, kind: 'interview', front: id, back: 'a',
});
const res = (topicId: string, rating: AnswerResult['rating']): AnswerResult => ({
  cardId: topicId + rating, courseId: 'java', topicId, topicName: topicId, rating,
});

describe('interview helpers', () => {
  it('shuffle keeps every item and does not mutate', () => {
    const src = [1, 2, 3, 4, 5];
    const out = shuffle(src, () => 0.3);
    expect([...out].sort()).toEqual(src);
    expect(src).toEqual([1, 2, 3, 4, 5]);
  });

  it('pickQuestions returns at most n distinct cards', () => {
    const pool = ['a', 'b', 'c', 'd'].map(x => card(x, 't'));
    const out = pickQuestions(pool, 3);
    expect(out).toHaveLength(3);
    expect(new Set(out.map(c => c.id)).size).toBe(3);
    expect(pickQuestions(pool, 10)).toHaveLength(4);
    expect(pickQuestions(pool, 0)).toEqual([]);
  });

  it('scores nailed=1, partly=0.5, missed=0', () => {
    expect(scorePercent([])).toBe(0);
    expect(scorePercent([res('a', 'nailed'), res('a', 'missed')])).toBe(50);
    expect(scorePercent([res('a', 'partly'), res('a', 'partly'), res('a', 'nailed')])).toBe(67);
  });

  it('tallies ratings', () => {
    expect(tally([res('a', 'nailed'), res('a', 'missed'), res('b', 'missed')])).toEqual({ missed: 2, partly: 0, nailed: 1 });
  });

  it('ranks weakest topics first and drops perfect ones', () => {
    const results = [
      res('strings', 'nailed'), res('strings', 'nailed'),
      res('loops', 'partly'), res('loops', 'nailed'),
      res('oop', 'missed'), res('oop', 'missed'),
    ];
    const weak = weakTopics(results);
    expect(weak.map(w => w.topicId)).toEqual(['oop', 'loops']);
    expect(weak[0].percent).toBe(0);
    expect(weak[1].percent).toBe(75);
    expect(weakTopics(results, 1)).toHaveLength(1);
  });

  it('selects pool questions for weak topics', () => {
    const pool = [card('1', 'oop'), card('2', 'loops'), card('3', 'oop')];
    const out = questionsForTopics(pool, [{ courseId: 'java', topicId: 'oop' }]);
    expect(out.map(c => c.id)).toEqual(['1', '3']);
  });

  it('gives a verdict per band', () => {
    expect(verdict(90)).toBe('Interview ready');
    expect(verdict(70)).toBe('Getting there');
    expect(verdict(50)).toBe('Keep practising');
    expect(verdict(10)).toBe('Time to revise the basics');
  });
});
