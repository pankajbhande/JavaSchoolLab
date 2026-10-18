import { describe, it, expect } from 'vitest';
import {
  deriveConcept, groupByConcept, lessonLinkForConcept, missedIndexes, buildRetakeSet, formatDuration,
  type LessonIndexCourse,
} from './quizReview';
import { allBanks } from '../data/quiz';
import { buildQuiz, type PreparedQuestion } from '../services/quizEngine';

const courses: LessonIndexCourse[] = [
  {
    id: 'java',
    subTopics: [
      {
        id: 'basics', name: 'Java Basics',
        topics: [
          { id: 'introduction', name: 'Introduction to Java' },
          { id: 'String in java', name: 'String in Java' },
          { id: 'Array in java', name: 'Array in Java' },
        ],
      },
      { id: 'exceptions', name: 'Exceptions', topics: [
        { id: 'exc-q', name: 'Exception Handling Interview Question & Answer' },
        { id: 'exception-handling', name: 'Exception Handling in Java' },
      ] },
    ],
  },
  { id: 'other', subTopics: [{ id: 'm', name: 'M', topics: [{ id: 't', name: 'String in Java' }] }] },
];

describe('deriveConcept', () => {
  it('prefers an authored topic', () => {
    expect(deriveConcept({ id: 'x', question: 'String?', topic: 'My Topic' })).toBe('My Topic');
  });
  it('derives from keywords and falls back to the given label', () => {
    expect(deriveConcept({ id: 'jb-x', question: 'Why is concatenating a String slow?' })).toBe('Strings');
    expect(deriveConcept({ id: 'jb-array-defaults', question: 'A new int array and a new String array' })).toBe('Arrays');
    expect(deriveConcept({ id: 'jb-final-reference', question: 'A List field is declared final with a new ArrayList' })).toBe('final Keyword');
    expect(deriveConcept({ id: 'zzz', question: 'Something unrelated' }, 'Java Basics')).toBe('Java Basics');
  });
  it('gives every authored question a concept that is not the bare fallback for most questions', () => {
    let total = 0;
    let fallback = 0;
    for (const b of allBanks) for (const q of b.questions) {
      total++;
      if (deriveConcept(q, '__fallback__') === '__fallback__') fallback++;
    }
    expect(fallback / total).toBeLessThan(0.1);
  });
});

describe('groupByConcept', () => {
  it('counts and orders weakest first', () => {
    const stats = groupByConcept([
      { concept: 'Strings', correct: true },
      { concept: 'Arrays', correct: false },
      { concept: 'Strings', correct: false },
      { concept: 'Loops', correct: true },
      { concept: 'Arrays', correct: false },
    ]);
    expect(stats.map(s => s.concept)).toEqual(['Arrays', 'Strings', 'Loops']);
    expect(stats[0]).toMatchObject({ correct: 0, total: 2, missed: [1, 4] });
    expect(stats[1]).toMatchObject({ correct: 1, total: 2, missed: [2] });
  });
  it('breaks ratio ties by most missed, then name', () => {
    const stats = groupByConcept([
      { concept: 'B', correct: false }, { concept: 'B', correct: true },
      { concept: 'A', correct: false }, { concept: 'A', correct: true },
      { concept: 'C', correct: false }, { concept: 'C', correct: false }, { concept: 'C', correct: true }, { concept: 'C', correct: true },
    ]);
    expect(stats.map(s => s.concept)).toEqual(['C', 'A', 'B']);
  });
});

describe('lessonLinkForConcept', () => {
  it('links to the confident lesson, slugified', () => {
    expect(lessonLinkForConcept('Strings', 'java', 'basics', courses)).toEqual({
      href: '/course/java/basics/String_in_java', kind: 'topic', label: 'String in Java',
    });
  });
  it('finds a lesson in another module of the same course, skipping interview pages', () => {
    const l = lessonLinkForConcept('Exception Handling', 'java', 'basics', courses);
    expect(l?.href).toBe('/course/java/exceptions/exception-handling');
  });
  it('falls back to the module start when no lesson matches', () => {
    const l = lessonLinkForConcept('Design Patterns', 'java', 'basics', courses);
    expect(l).toMatchObject({ kind: 'module', href: '/course/java/basics/introduction' });
  });
  it('returns null for unknown course, or unknown module with no match', () => {
    expect(lessonLinkForConcept('Strings', 'nope', 'basics', courses)).toBeNull();
    expect(lessonLinkForConcept('Design Patterns', 'java', 'nope', courses)).toBeNull();
  });
  it('never crosses into another course', () => {
    expect(lessonLinkForConcept('Strings', 'other', 'zzz', courses)?.href).toBe('/course/other/m/t');
  });
});

describe('retake set', () => {
  const quiz = buildQuiz('basics', 'java', 7);
  it('missedIndexes treats unanswered as missed', () => {
    const answers = quiz.questions.map(q => q.answerIndex);
    answers[2] = (answers[2] + 1) % 4;
    answers[5] = -1;
    expect(missedIndexes(quiz.questions, answers)).toEqual([2, 5]);
  });
  it('contains only missed questions with the answer remapped through a fresh shuffle', () => {
    const answers = quiz.questions.map(q => q.answerIndex);
    answers[1] = -1;
    answers[3] = -1;
    answers[8] = -1;
    const set: PreparedQuestion[] = buildRetakeSet(quiz.questions, answers, 99);
    expect(set.map(q => q.id).sort()).toEqual([1, 3, 8].map(i => quiz.questions[i].id).sort());
    for (const q of set) {
      const orig = quiz.questions.find(o => o.id === q.id)!;
      expect(q.options.slice().sort()).toEqual(orig.options.slice().sort());
      expect(q.options[q.answerIndex]).toBe(orig.options[orig.answerIndex]);
    }
  });
  it('is empty on a perfect run', () => {
    expect(buildRetakeSet(quiz.questions, quiz.questions.map(q => q.answerIndex), 1)).toEqual([]);
  });
});

describe('formatDuration', () => {
  it('formats seconds and minutes', () => {
    expect(formatDuration(42_000)).toBe('42 s');
    expect(formatDuration(125_000)).toBe('2 min 05 s');
    expect(formatDuration(-5)).toBe('0 s');
  });
});
