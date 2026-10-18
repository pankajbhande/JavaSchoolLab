// Calendar-day helpers in the viewer's own time zone.
//
// `new Date().toISOString().slice(0, 10)` is the UTC date, which flips at 05:30 in India (and
// at odd hours elsewhere), so "today's study time" and "already rang today" reset at the wrong
// moment. These use the local date, which is what a student means by "today".

const pad = (n: number) => String(n).padStart(2, '0');

/** YYYY-MM-DD for the given moment in the local time zone. */
export function localDay(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Minutes since local midnight, e.g. 07:05 -> 425. */
export function minutesOfDay(date: Date = new Date()): number {
  return date.getHours() * 60 + date.getMinutes();
}

/** "HH:MM" (24h) to minutes since midnight, or NaN when malformed. */
export function parseClock(time: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!m) return NaN;
  const h = Number(m[1]), min = Number(m[2]);
  return h < 24 && min < 60 ? h * 60 + min : NaN;
}

/**
 * True when an alarm set for `time` should ring now: its minute has arrived and it is no more
 * than `graceMinutes` old. The grace matters because browsers throttle timers in background tabs
 * to about one tick a minute, so a check can land just after the exact minute and would
 * otherwise never see it.
 */
export function alarmIsDue(time: string, now: Date = new Date(), graceMinutes = 2): boolean {
  const at = parseClock(time);
  if (Number.isNaN(at)) return false;
  const diff = minutesOfDay(now) - at;
  return diff >= 0 && diff <= graceMinutes;
}
