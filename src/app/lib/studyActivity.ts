// Pure helpers behind the study heatmap and the weekly goal. Dates are YYYY-MM-DD in the learner's
// local time, matching what the server stores in study_days.

export interface StudyDay { date: string; seconds: number }

export interface HeatCell {
  date: string;
  seconds: number;
  /** 0 = no study, 1..4 = increasing amount. */
  level: 0 | 1 | 2 | 3 | 4;
  /** True for days after today, drawn as blanks. */
  future: boolean;
}

const pad = (n: number) => String(n).padStart(2, '0');

export function toIso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, n: number): string {
  const d = fromIso(iso);
  d.setDate(d.getDate() + n);
  return toIso(d);
}

/** The Monday of the week containing `iso` (weeks run Monday to Sunday). */
export function weekStart(iso: string): string {
  const d = fromIso(iso);
  return addDays(iso, -((d.getDay() + 6) % 7));
}

/** Minutes studied -> shade. Thresholds are deliberately low: 15 minutes already counts as a real day. */
export function levelFor(seconds: number): HeatCell['level'] {
  const m = seconds / 60;
  if (m <= 0) return 0;
  if (m < 15) return 1;
  if (m < 30) return 2;
  if (m < 60) return 3;
  return 4;
}

/** Columns of 7 cells (Mon..Sun), oldest week first, ending with the week that contains `today`. */
export function buildHeatmap(days: StudyDay[], today: string, weeks = 26): HeatCell[][] {
  const bySeconds = new Map(days.map(d => [d.date, d.seconds]));
  const firstMonday = addDays(weekStart(today), -7 * (weeks - 1));
  const columns: HeatCell[][] = [];
  for (let w = 0; w < weeks; w++) {
    const col: HeatCell[] = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(firstMonday, w * 7 + i);
      const future = date > today;
      const seconds = future ? 0 : bySeconds.get(date) ?? 0;
      col.push({ date, seconds, level: levelFor(seconds), future });
    }
    columns.push(col);
  }
  return columns;
}

/** Seconds studied from this week's Monday through today. */
export function weekSeconds(days: StudyDay[], today: string): number {
  const start = weekStart(today);
  return days.filter(d => d.date >= start && d.date <= today).reduce((a, d) => a + d.seconds, 0);
}

/** How many of the last `weeks` days had any study, for the heatmap caption. */
export function activeDayCount(days: StudyDay[], today: string, weeks = 26): number {
  const from = addDays(weekStart(today), -7 * (weeks - 1));
  return days.filter(d => d.seconds > 0 && d.date >= from && d.date <= today).length;
}

export function formatMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  return `${m}m`;
}
