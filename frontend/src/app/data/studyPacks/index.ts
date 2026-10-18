// Hand-written study material per topic, shown in the right sidebar:
//   keypoints  quick-revision facts (term, explanation)
//   interview  real interview questions with model answers
//   mcq        multiple-choice questions; options[0] is ALWAYS the correct one here, the
//              sidebar shuffles them (seeded by the question) before display
//
// Keyed by `courseId/topicId`. A topic without a pack falls back to the keypoints and
// questions derived from the course data, so adding a pack never removes anything.

export type KeypointTuple = [term: string, detail: string];
export type InterviewTuple = [question: string, answer: string];
export type McqTuple = [question: string, options: [correct: string, ...wrong: string[]], reason: string];

export interface StudyPack {
  keypoints: KeypointTuple[];
  interview: InterviewTuple[];
  mcq: McqTuple[];
}

import { javaBasics1 } from './java/basics1';
import { javaBasics2 } from './java/basics2';
import { javaBasics3 } from './java/basics3';

const PACKS: Record<string, StudyPack> = {
  ...javaBasics1,
  ...javaBasics2,
  ...javaBasics3,
};

export function getStudyPack(courseId?: string | null, topicId?: string | null): StudyPack | undefined {
  if (!courseId || !topicId) return undefined;
  return PACKS[`${courseId}/${topicId}`];
}

export const allStudyPacks = PACKS;
