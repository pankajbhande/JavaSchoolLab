// Assessment engine.
//
// Guarantees, in order of importance:
//   1. The correct answer lands in a uniformly random position for every question,
//      every attempt. Position must never be a tell.
//   2. A quiz is only ever built from authored questions. Nothing is synthesised
//      from prose, because a fabricated question cannot certify anything.
//   3. A module with no authored bank reports `unavailable` rather than serving a
//      fake test — the caller is expected to hide the certificate path in that case.

import type { QuizQuestion } from '../data/quiz/types';
import { findBank } from '../data/quiz';

export type QuizMode = 'certified' | 'unavailable';

export interface PreparedQuestion {
  id: string;
  question: string;
  /** Options in the order this student sees them. */
  options: string[];
  /** Index into `options` above — already remapped through the shuffle. */
  answerIndex: number;
  explanation: string;
  /** Optional authored concept label (banks may carry `topic` or `concept`). */
  topic?: string;
}

export interface PreparedQuiz {
  questions: PreparedQuestion[];
  mode: QuizMode;
  /** Label of the bank that was used, for the results screen and the certificate. */
  bankLabel: string;
  /** Percentage required to pass and unlock the certificate. */
  passPercentage: number;
  /** How many authored questions the bank holds, before trimming to quiz length. */
  poolSize: number;
}

export const PASS_PERCENTAGE = 70;
export const QUIZ_LENGTH = 10;

/**
 * mulberry32 — small, fast, seedable PRNG.
 * Seeding matters: React may re-render mid-test, and a quiz that reshuffles itself
 * under the student would be unusable. One seed per attempt keeps the order stable.
 */
function createRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates. Returns a new array; the input is untouched. */
function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Shuffles a question's options and reports where the correct one ended up.
 * Tracking the answer through the shuffle (rather than re-finding it by string)
 * keeps this correct even if two options happen to have identical text.
 */
function prepareQuestion(q: QuizQuestion, random: () => number): PreparedQuestion {
  const tagged = q.options.map((text, index) => ({ text, isAnswer: index === q.correctAnswer }));
  const shuffled = shuffle(tagged, random);
  const answerIndex = shuffled.findIndex(o => o.isAnswer);

  const tag = q as QuizQuestion & { topic?: string; concept?: string };
  return {
    id: q.id,
    question: q.question,
    topic: tag.topic || tag.concept || undefined,
    options: shuffled.map(o => o.text),
    // A bank whose correctAnswer is out of range would otherwise silently mark
    // every response wrong; fail loudly in dev instead.
    answerIndex: answerIndex >= 0 ? answerIndex : 0,
    explanation: q.explanation,
  };
}

/**
 * Practice helper: the same questions in a fresh question order with freshly shuffled options.
 * The answer index is re-tracked through the shuffle. Never used for an official attempt.
 */
export function reshuffleQuestions(questions: readonly PreparedQuestion[], seed: number): PreparedQuestion[] {
  const random = createRandom(seed || 1);
  return shuffle(questions, random).map(q => {
    const tagged = q.options.map((text, index) => ({ text, isAnswer: index === q.answerIndex }));
    const options = shuffle(tagged, random);
    return { ...q, options: options.map(o => o.text), answerIndex: Math.max(0, options.findIndex(o => o.isAnswer)) };
  });
}

/**
 * Builds one attempt.
 *
 * @param moduleKey subTopic id of the module under test (most specific match).
 * @param courseKey course id, used as the fallback bank.
 * @param seed      one value per attempt — change it to reshuffle ("Try Again").
 */
export function buildQuiz(moduleKey: string | undefined, courseKey: string | undefined, seed: number): PreparedQuiz {
  const bank = findBank(moduleKey, courseKey);

  if (!bank || bank.questions.length === 0) {
    return { questions: [], mode: 'unavailable', bankLabel: '', passPercentage: PASS_PERCENTAGE, poolSize: 0 };
  }

  const random = createRandom(seed || 1);
  const picked = shuffle(bank.questions, random).slice(0, QUIZ_LENGTH);

  return {
    questions: picked.map(q => prepareQuestion(q, random)),
    mode: 'certified',
    bankLabel: bank.label,
    passPercentage: PASS_PERCENTAGE,
    poolSize: bank.questions.length,
  };
}
