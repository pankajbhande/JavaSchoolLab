import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Target, Pencil, X } from 'lucide-react';
import { toast } from 'sonner';
import { useProgress } from '../context/ProgressContext';
import { saveWeeklyGoal } from '../services/api';
import {
  activeDayCount, buildHeatmap, formatMinutes, fromIso, toIso, weekSeconds, type HeatCell,
} from '../lib/studyActivity';

const WEEKS = 26;
const PRESETS = [60, 120, 180, 300, 420]; // minutes: 1h, 2h, 3h, 5h, 7h
const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', ''];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const LEVEL_CLASS: Record<HeatCell['level'], string> = {
  0: 'bg-gray-200 dark:bg-gray-700/70',
  1: 'bg-orange-200 dark:bg-orange-900/60',
  2: 'bg-orange-300 dark:bg-orange-700/80',
  3: 'bg-orange-500 dark:bg-orange-500',
  4: 'bg-orange-700 dark:bg-orange-300',
};

const longDate = (iso: string) =>
  fromIso(iso).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

/** Study heatmap (last 26 weeks) and the weekly goal, for the signed-in learner. */
export function StudyActivity() {
  const { summary, refresh } = useProgress();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [custom, setCustom] = useState('');

  const today = toIso(new Date());
  const days = summary?.studyDays ?? [];
  const columns = useMemo(() => buildHeatmap(days, today, WEEKS), [days, today]);
  const goal = summary?.weeklyGoalMinutes ?? null;

  if (!summary) return null;

  const studiedMinutes = weekSeconds(days, today) / 60;
  const pct = goal ? Math.min(100, Math.round((studiedMinutes / goal) * 100)) : 0;
  const met = goal !== null && studiedMinutes >= goal;
  const active = activeDayCount(days, today, WEEKS);

  // Label a column with its month when the month changes (first column always).
  const monthLabel = (col: HeatCell[], i: number) => {
    const m = fromIso(col[0].date).getMonth();
    const prev = i > 0 ? fromIso(columns[i - 1][0].date).getMonth() : -1;
    return m !== prev ? MONTHS[m] : '';
  };

  const setGoal = async (minutes: number | null) => {
    setSaving(true);
    try {
      await saveWeeklyGoal(minutes);
      await refresh();
      setEditing(false);
      setCustom('');
      toast.success(minutes ? `Weekly goal set to ${formatMinutes(minutes)}` : 'Weekly goal removed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save your goal');
    } finally {
      setSaving(false);
    }
  };

  const submitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const hours = Number(custom);
    if (!Number.isFinite(hours) || hours < 10 / 60 || hours > 28) {
      toast.error('Enter hours between 0.2 and 28');
      return;
    }
    setGoal(Math.round(hours * 60));
  };

  return (
    <div className="mb-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
      {/* Weekly goal */}
      <section aria-label="Weekly study goal" className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400">
            <Target className="h-4 w-4 text-orange-600 dark:text-orange-400" aria-hidden="true" />
            Weekly goal
          </div>
          {goal !== null && !editing && (
            <button type="button" onClick={() => setEditing(true)} aria-label="Change weekly goal" className="rounded p-1 text-gray-500 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400">
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        {goal !== null && !editing ? (
          <>
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-display text-lg font-bold tabular-nums text-gray-800 dark:text-gray-100">
                {formatMinutes(studiedMinutes)} <span className="text-sm font-medium text-gray-500 dark:text-gray-400">of {formatMinutes(goal)}</span>
              </span>
              {met && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Goal reached
                </span>
              )}
            </div>
            <div
              role="progressbar"
              aria-label="Weekly goal progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
            >
              <motion.div
                className={met ? 'h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500' : 'h-2 rounded-full bg-gradient-to-r from-orange-600 to-amber-500'}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
              {met
                ? 'Brilliant week. Keep the streak going.'
                : `${formatMinutes(Math.max(0, Math.ceil(goal - studiedMinutes)))} to go this week (resets Monday).`}
            </p>
          </>
        ) : (
          <div>
            <p className="mb-2 text-xs text-gray-600 dark:text-gray-300">
              {goal === null ? 'How much will you study each week?' : 'Pick a new weekly goal.'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map(m => (
                <button
                  key={m}
                  type="button"
                  disabled={saving}
                  onClick={() => setGoal(m)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-60 ${goal === m
                    ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-300'
                    : 'border-gray-300 text-gray-700 hover:border-orange-400 dark:border-gray-600 dark:text-gray-200'}`}
                >
                  {formatMinutes(m)}
                </button>
              ))}
            </div>
            <form onSubmit={submitCustom} className="mt-2 flex items-center gap-2">
              <label htmlFor="goal-custom" className="sr-only">Custom weekly goal in hours</label>
              <input
                id="goal-custom"
                type="number"
                min={0.2}
                max={28}
                step={0.5}
                inputMode="decimal"
                placeholder="Custom (hours)"
                value={custom}
                onChange={e => setCustom(e.target.value)}
                className="w-36 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-800 outline-none focus-visible:border-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              />
              <button type="submit" disabled={saving || !custom} className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-700 disabled:opacity-60">
                Set
              </button>
              {goal !== null && (
                <>
                  <button type="button" disabled={saving} onClick={() => setGoal(null)} className="rounded-lg px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">
                    Remove
                  </button>
                  <button type="button" onClick={() => setEditing(false)} aria-label="Cancel" className="rounded p-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100">
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </>
              )}
            </form>
          </div>
        )}
      </section>

      {/* Heatmap */}
      <section aria-label="Study activity, last 26 weeks" className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Study activity</span>
          <span className="text-xs text-gray-600 dark:text-gray-300">
            {active} {active === 1 ? 'day' : 'days'} studied in the last 6 months
          </span>
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="inline-flex gap-1.5">
            <div className="flex flex-col gap-[3px] pt-4 text-[9px] leading-[12px] text-gray-500 dark:text-gray-400" aria-hidden="true">
              {DAY_LABELS.map((l, i) => <span key={i} className="h-3">{l}</span>)}
            </div>
            <div>
              <div className="mb-1 flex gap-[3px] text-[9px] leading-3 text-gray-500 dark:text-gray-400" aria-hidden="true">
                {columns.map((col, i) => (
                  <span key={i} className="w-3 overflow-visible whitespace-nowrap">{monthLabel(col, i)}</span>
                ))}
              </div>
              <div className="flex gap-[3px]" role="img" aria-label={`Heatmap of study time. ${active} days studied in the last ${WEEKS} weeks.`}>
                {columns.map((col, ci) => (
                  <div key={ci} className="flex flex-col gap-[3px]">
                    {col.map(cell => (
                      <div
                        key={cell.date}
                        title={cell.future ? undefined : `${longDate(cell.date)}: ${cell.seconds > 0 ? `${formatMinutes(Math.max(1, Math.round(cell.seconds / 60)))} studied` : 'no study'}`}
                        className={`h-3 w-3 rounded-[3px] ${cell.future ? 'invisible' : LEVEL_CLASS[cell.level]} ${cell.date === today ? 'ring-1 ring-orange-600 dark:ring-orange-300' : ''}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-end gap-1.5 text-[10px] text-gray-500 dark:text-gray-400" aria-hidden="true">
          Less
          {([0, 1, 2, 3, 4] as const).map(l => <span key={l} className={`h-3 w-3 rounded-[3px] ${LEVEL_CLASS[l]}`} />)}
          More
        </div>
      </section>
    </div>
  );
}
