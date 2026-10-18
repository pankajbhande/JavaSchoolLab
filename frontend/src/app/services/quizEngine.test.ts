import { describe, it, expect } from 'vitest';
import { buildQuiz, PASS_PERCENTAGE, QUIZ_LENGTH } from './quizEngine';
import { allBanks, findBank } from '../data/quiz';

describe('answer position', () => {
  // THE regression this suite exists for. The original generator hard-coded the correct
  // answer to option 0 in all seven branches and never shuffled the options, so clicking
  // the first option ten times scored 100% and earned a real, database-backed certificate.
  it('is uniformly distributed, so position carries no signal', () => {
    const counts = [0, 0, 0, 0];
    let total = 0;
    for (let seed = 1; seed <= 3000; seed++) {
      for (const q of buildQuiz('basics', 'java', seed).questions) {
        counts[q.answerIndex]++;
        total++;
      }
    }
    expect(total).toBeGreaterThan(20000);
    for (const c of counts) {
      const share = c / total;
      // A four-option question should land near 25%. Anything outside 22-28% means the
      // shuffle has stopped working; option-0 bias would show as ~100%.
      expect(share).toBeGreaterThan(0.22);
      expect(share).toBeLessThan(0.28);
    }
  });

  it('never always-picks the same index across attempts', () => {
    const seen = new Set<number>();
    for (let seed = 1; seed <= 50; seed++) {
      for (const q of buildQuiz('collection', 'collection', seed).questions) seen.add(q.answerIndex);
    }
    expect(seen.size).toBeGreaterThan(1);
  });
});

describe('answer tracking through the shuffle', () => {
  it('keeps answerIndex pointing at the authored correct option', () => {
    let checked = 0;
    for (let seed = 1; seed <= 200; seed++) {
      for (const [moduleId, courseId] of [['basics', 'java'], ['oop', 'java'], ['list', 'collection']]) {
        const quiz = buildQuiz(moduleId, courseId, seed);
        const bank = findBank(moduleId, courseId)!;
        for (const q of quiz.questions) {
          const authored = bank.questions.find(x => x.id === q.id)!;
          expect(q.options[q.answerIndex]).toBe(authored.options[authored.correctAnswer]);
          checked++;
        }
      }
    }
    expect(checked).toBeGreaterThan(1000);
  });

  it('preserves the full option set, just reordered', () => {
    const quiz = buildQuiz('basics', 'java', 42);
    const bank = findBank('basics', 'java')!;
    for (const q of quiz.questions) {
      const authored = bank.questions.find(x => x.id === q.id)!;
      expect([...q.options].sort()).toEqual([...authored.options].sort());
    }
  });
});

describe('seeding', () => {
  it('is reproducible for one attempt so React re-renders cannot reshuffle mid-test', () => {
    expect(buildQuiz('basics', 'java', 77)).toEqual(buildQuiz('basics', 'java', 77));
  });

  it('draws a different order for a new attempt', () => {
    expect(buildQuiz('basics', 'java', 77)).not.toEqual(buildQuiz('basics', 'java', 78));
  });
});

describe('bank resolution', () => {
  it('prefers a module bank over the course bank', () => {
    expect(buildQuiz('basics', 'java', 1).bankLabel).toBe('Java Basics');
  });

  it('falls back to the course bank when the module has none', () => {
    expect(buildQuiz('list', 'collection', 1).bankLabel).toBe('Collection Framework');
  });

  it('scopes module ids by course', () => {
    // Both Java and JSP Servlets have a module called exception-handling. An unscoped
    // lookup would serve Java questions to JSP students.
    expect(buildQuiz('exception-handling', 'java', 1).bankLabel).toBe('Exception Handling in Java');
    expect(buildQuiz('exception-handling', 'jsp-servlet', 1).bankLabel).toBe('JSP Servlets');
  });

  it('reports unavailable rather than inventing a quiz', () => {
    const quiz = buildQuiz('reactjs', 'react-js', 1);
    expect(quiz.mode).toBe('unavailable');
    expect(quiz.questions).toHaveLength(0);
  });

  it('is unavailable when ids are missing entirely', () => {
    expect(buildQuiz(undefined, undefined, 1).mode).toBe('unavailable');
  });
});

describe('quiz shape', () => {
  it('never serves more than QUIZ_LENGTH questions', () => {
    for (const bank of allBanks) {
      const quiz = buildQuiz(undefined, bank.key.split('/')[0], 5);
      expect(quiz.questions.length).toBeLessThanOrEqual(QUIZ_LENGTH);
    }
  });

  it('serves distinct questions within one attempt', () => {
    const ids = buildQuiz('basics', 'java', 9).questions.map(q => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps the pass mark at a sane threshold', () => {
    expect(PASS_PERCENTAGE).toBeGreaterThanOrEqual(60);
    expect(PASS_PERCENTAGE).toBeLessThanOrEqual(100);
  });
});

describe('authored bank integrity', () => {
  it('has banks registered', () => {
    expect(allBanks.length).toBeGreaterThan(0);
  });

  it('uses a unique key per bank', () => {
    const keys = allBanks.map(b => b.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it.each(allBanks.map(b => [b.key, b] as const))('%s is well formed', (_key, bank) => {
    expect(bank.questions.length).toBeGreaterThan(0);
    const ids = new Set<string>();
    for (const q of bank.questions) {
      expect(ids.has(q.id), `duplicate question id ${q.id}`).toBe(false);
      ids.add(q.id);
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(q.options.length).toBeLessThanOrEqual(6);
      expect(q.correctAnswer).toBeGreaterThanOrEqual(0);
      expect(q.correctAnswer).toBeLessThan(q.options.length);
      // Duplicate options make one of them unmarkable.
      expect(new Set(q.options).size, `duplicate options in ${q.id}`).toBe(q.options.length);
      // A wrong answer with no explanation teaches nothing.
      expect(q.explanation.trim().length).toBeGreaterThan(20);
      expect(q.question.trim().length).toBeGreaterThan(10);
    }
  });
});
