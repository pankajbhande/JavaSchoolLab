// Types for the authored assessment banks.
//
// Why these exist: the original MCQ generator derived questions from interview-question
// strings and hard-coded every correct answer to option 0, so a student could score 100%
// without reading anything. Assessments are now authored here and shuffled by the engine,
// so answer position carries no signal.

export type QuizDifficulty = 'beginner' | 'intermediate' | 'expert';

export interface QuizQuestion {
  /** Unique within its bank. Used as a React key and as a stable handle for future analytics. */
  id: string;
  question: string;
  /**
   * Two to six options, authored in any order — the engine shuffles them per attempt,
   * so do NOT try to arrange them here. Every option should be plausible to someone who
   * skimmed the topic; a distractor nobody would pick adds no measurement value.
   */
  options: string[];
  /** Index into `options` AS AUTHORED. The engine remaps it after shuffling. */
  correctAnswer: number;
  /** Shown once the student answers. Required: a wrong answer with no explanation teaches nothing. */
  explanation: string;
  difficulty?: QuizDifficulty;
}

export interface QuizBank {
  /**
   * Either a subTopic id (a "module", preferred — more specific) or a course id
   * (the broader fallback used when no module bank exists). See coursesData.
   */
  key: string;
  /** Human label for the UI and the certificate. */
  label: string;
  questions: QuizQuestion[];
}
