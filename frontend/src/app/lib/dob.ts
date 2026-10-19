// Date-of-birth helpers for the sign-up picker. Pure functions so they can be tested without a browser.

export interface Ymd {
  y: number;
  m: number; // 1-12
  d: number; // 1-31
}

export function daysInMonth(year: number, month1to12: number): number {
  return new Date(year, month1to12, 0).getDate();
}

export function parseYmd(value: string | undefined | null): Ymd | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '');
  if (!m) return null;
  const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > daysInMonth(y, mo)) return null;
  return { y, m: mo, d };
}

export function formatYmd({ y, m, d }: Ymd): string {
  return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** Keeps a date valid: the day fits the month, and nothing later than `today`. */
export function clampDob(v: Ymd, today: Ymd): Ymd {
  let { y, m, d } = v;
  if (y > today.y) y = today.y;
  if (y === today.y && m > today.m) m = today.m;
  d = Math.min(d, daysInMonth(y, m));
  if (y === today.y && m === today.m && d > today.d) d = today.d;
  return { y, m, d };
}

/** Whole years completed on `today`. */
export function ageOn(dob: Ymd, today: Ymd): number {
  let age = today.y - dob.y;
  if (today.m < dob.m || (today.m === dob.m && today.d < dob.d)) age--;
  return Math.max(0, age);
}

export function todayYmd(now: Date = new Date()): Ymd {
  return { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
}
