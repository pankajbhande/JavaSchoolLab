import type { QuizBank } from '../data/quiz/types';

/** Same lookup as data/quiz findBank, over any list of banks: module bank first, then the course bank. */
export function findBankIn(banks: readonly QuizBank[], moduleId?: string, courseId?: string): QuizBank | undefined {
  if (!courseId) return undefined;
  if (moduleId) {
    const scoped = banks.find(b => b.key === courseId + '/' + moduleId);
    if (scoped) return scoped;
  }
  return banks.find(b => b.key === courseId);
}
