// Pure progress arithmetic, extracted from index.js so it can be tested without booting
// Express or connecting to MySQL. Everything here is a function of its arguments only.

/**
 * XP is deliberately simple and explainable, and is recomputed from source rows on every
 * request rather than stored, so it can never drift from what the student actually did.
 */
export const XP_PER_TOPIC = 10;
export const XP_PER_MODULE_PASSED = 50;
export const XP_PER_STUDY_DAY = 5;

/** Local (not UTC) calendar day, so a streak matches what the student's clock says. */
export function todayLocal(now = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * Format a value from a MySQL DATE column as YYYY-MM-DD in LOCAL time.
 *
 * mysql2 hands back a JS Date set to local midnight. Calling toISOString() on that converts
 * to UTC, which rolls the date back a day for every timezone ahead of UTC (IST included) -
 * so "today" never matched and studySecondsToday was always 0. Read local components.
 */
export function toLocalDateString(value) {
  if (typeof value === 'string') return value.slice(0, 10);
  const d = value instanceof Date ? value : new Date(value);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Whole days from aIso to bIso, both YYYY-MM-DD. Positive when b is later. */
export function daysBetween(aIso, bIso) {
  const a = new Date(aIso + 'T00:00:00');
  const b = new Date(bIso + 'T00:00:00');
  return Math.round((b - a) / 86400000);
}

/**
 * Current and longest run of consecutive studied days.
 *
 * @param days  [{ date: 'YYYY-MM-DD' }], NEWEST FIRST.
 * @param today 'YYYY-MM-DD'.
 *
 * A streak stays alive if the most recent studied day is today or yesterday; requiring it
 * to be today would break every streak the moment midnight passed, before the student has
 * had any chance to study.
 */
export function computeStreaks(days, today) {
  let currentStreak = 0;
  if (days.length) {
    const gap = daysBetween(days[0].date, today);
    if (gap <= 1) {
      currentStreak = 1;
      for (let i = 1; i < days.length; i++) {
        if (daysBetween(days[i].date, days[i - 1].date) === 1) currentStreak++;
        else break;
      }
    }
  }

  let longestStreak = 0;
  let run = 0;
  for (let i = 0; i < days.length; i++) {
    if (i === 0 || daysBetween(days[i].date, days[i - 1].date) === 1) run++;
    else run = 1;
    longestStreak = Math.max(longestStreak, run);
  }

  return { currentStreak, longestStreak };
}

export function computeXp({ topicsSeen, modulesPassed, studyDays }) {
  return topicsSeen * XP_PER_TOPIC
    + modulesPassed * XP_PER_MODULE_PASSED
    + studyDays * XP_PER_STUDY_DAY;
}

/**
 * Review interval by best score. A module answered nearly perfectly comes back in three
 * weeks; one that was scraped through comes back tomorrow.
 */
export function reviewIntervalDays(bestPercentage) {
  if (bestPercentage < 70) return 1;
  if (bestPercentage < 85) return 3;
  if (bestPercentage < 95) return 7;
  return 21;
}

/** A module is due if it was never passed, or its interval has elapsed. */
export function isDue({ everPassed, best, daysSinceLastAttempt }) {
  if (!everPassed) return true;
  return daysSinceLastAttempt >= reviewIntervalDays(best);
}
