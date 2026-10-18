// XP and level maths for the dashboard stats strip. Pure functions, no I/O.

export interface XpInputs {
  topicsSeen: number;
  quizzesPassed: number;
  dailyAnswered: number;
  dailyCorrect: number;
  studySeconds: number;
}

export const XP_PER_TOPIC = 10;
export const XP_PER_QUIZ_PASSED = 50;
export const XP_PER_DAILY_ANSWER = 5;
export const XP_PER_DAILY_CORRECT = 10;
export const XP_PER_STUDY_MINUTE = 1;

const nonNeg = (n: number) => (Number.isFinite(n) && n > 0 ? Math.floor(n) : 0);

export function computeXp(i: XpInputs): number {
  return (
    nonNeg(i.topicsSeen) * XP_PER_TOPIC +
    nonNeg(i.quizzesPassed) * XP_PER_QUIZ_PASSED +
    nonNeg(i.dailyAnswered) * XP_PER_DAILY_ANSWER +
    nonNeg(i.dailyCorrect) * XP_PER_DAILY_CORRECT +
    Math.floor(nonNeg(i.studySeconds) / 60) * XP_PER_STUDY_MINUTE
  );
}

/** Total XP needed to reach `level` (level 1 starts at 0): 100, 300, 600, 1000 ... */
export function xpForLevel(level: number): number {
  const l = Math.max(1, Math.floor(level));
  return 50 * l * (l - 1);
}

export interface LevelInfo {
  level: number;
  /** XP earned inside the current level. */
  xpIntoLevel: number;
  /** XP the current level spans. */
  xpForNext: number;
  /** 0-100 progress to the next level. */
  percent: number;
}

export function levelFromXp(xp: number): LevelInfo {
  const total = nonNeg(xp);
  let level = 1;
  while (xpForLevel(level + 1) <= total) level++;
  const start = xpForLevel(level);
  const span = xpForLevel(level + 1) - start;
  const into = total - start;
  return { level, xpIntoLevel: into, xpForNext: span, percent: Math.min(100, Math.floor((into / span) * 100)) };
}

const toDayNumber = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
};

/** Consecutive-day streaks from YYYY-MM-DD strings. Current counts if today or yesterday is present. */
export function streakFromDates(dates: Iterable<string>, today: string): { current: number; longest: number } {
  const valid = [...new Set(dates)].filter(s => /^\d{4}-\d{2}-\d{2}$/.test(s));
  const days = valid.map(toDayNumber).sort((a, b) => a - b);
  let longest = 0;
  let run = 0;
  for (let i = 0; i < days.length; i++) {
    run = i > 0 && days[i] - days[i - 1] === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }
  const daySet = new Set(days);
  const t = toDayNumber(today);
  let cursor = daySet.has(t) ? t : t - 1;
  let current = 0;
  while (daySet.has(cursor)) { current++; cursor--; }
  return { current, longest };
}
