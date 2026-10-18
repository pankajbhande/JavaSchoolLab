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

/** YYYY-MM-DD shifted by n days (local calendar arithmetic). */
export function addDaysIso(iso, n) {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return toLocalDateString(d);
}

/** The Monday of the week containing `iso`; a freeze is allowance-per-Monday-week. */
export function mondayOf(iso) {
  const d = new Date(iso + 'T00:00:00');
  return addDaysIso(iso, -((d.getDay() + 6) % 7));
}

/**
 * Streaks with the weekly streak freeze.
 *
 * Every learner gets ONE freeze per Monday-to-Sunday week. It is applied automatically: a single
 * missed day sitting between two studied days (or between the last studied day and today) is
 * bridged instead of ending the streak, provided that week's freeze has not already been spent.
 * A bridged day keeps the streak alive but does not add to its length.
 *
 * Nothing extra is stored. Freezes are re-derived from study_days on every call, like XP, so they
 * can never drift. Bridges are assigned newest-first, so the current streak gets first claim on a
 * week's freeze.
 *
 * @param days  [{ date: 'YYYY-MM-DD' }], any order.
 * @param today 'YYYY-MM-DD'.
 * @returns {{ currentStreak, longestStreak, freezeUsedDates: string[], freezeAvailable: boolean,
 *             studiedToday: boolean, atRisk: boolean }}
 *   freezeUsedDates: missed days the current streak survived thanks to a freeze (newest first).
 *   freezeAvailable: this week's freeze is still unspent.
 *   atRisk: there is a live streak and nothing has been studied yet today.
 */
export function computeStreakInfo(days, today) {
  const dates = [...new Set(days.map(d => d.date))].sort().reverse(); // newest first
  const usedWeeks = new Set();
  const frozen = [];
  const tryFreeze = (missedIso) => {
    const week = mondayOf(missedIso);
    if (usedWeeks.has(week)) return false;
    usedWeeks.add(week);
    return true;
  };

  const studiedToday = dates[0] === today;
  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, freezeUsedDates: [], freezeAvailable: true, studiedToday: false, atRisk: false };
  }

  // Is the streak still alive as of today?
  const gapToday = daysBetween(dates[0], today);
  let currentActive = gapToday <= 1;
  if (!currentActive && gapToday === 2) {
    const yesterday = addDaysIso(today, -1);
    if (tryFreeze(yesterday)) { currentActive = true; frozen.push(yesterday); }
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let run = 1;
  const closeRun = () => {
    longestStreak = Math.max(longestStreak, run);
    if (currentActive) { currentStreak = run; currentActive = false; }
  };
  for (let i = 1; i < dates.length; i++) {
    const gap = daysBetween(dates[i], dates[i - 1]);
    if (gap === 1) {
      run++;
    } else if (gap === 2 && tryFreeze(addDaysIso(dates[i], 1))) {
      if (currentActive) frozen.push(addDaysIso(dates[i], 1));
      run++;
    } else {
      closeRun();
      run = 1;
    }
  }
  closeRun();

  return {
    currentStreak,
    longestStreak,
    freezeUsedDates: frozen,
    freezeAvailable: !usedWeeks.has(mondayOf(today)),
    studiedToday,
    atRisk: !studiedToday && currentStreak > 0,
  };
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
