import { motion } from 'motion/react';
import { Flame, Snowflake, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { slugify } from '../lib/slug';
import { addDays, fromIso, toIso } from '../lib/studyActivity';

/** "5h 20m" / "40m" until local midnight, when today's chance to study runs out. */
function timeLeftToday(now = new Date()): string {
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  const mins = Math.max(1, Math.round((end.getTime() - now.getTime()) / 60000));
  const h = Math.floor(mins / 60);
  return h > 0 ? `${h}h ${mins % 60}m` : `${mins}m`;
}

const dayName = (iso: string) => fromIso(iso).toLocaleDateString(undefined, { weekday: 'long' });

/**
 * Streak warnings. Two cases:
 *  - at risk: a live streak and nothing studied yet today, so say how long is left and what backup exists;
 *  - saved: a streak freeze covered yesterday or today recently, so tell the learner it worked.
 * Renders nothing the rest of the time.
 */
export function StreakBanner() {
  const { summary } = useProgress();
  const navigate = useNavigate();
  if (!summary) return null;

  const today = toIso(new Date());
  const yesterday = addDays(today, -1);
  const freeze = summary.streakFreeze;
  const savedRecently = freeze.usedDates.find(d => d === yesterday || d === today);

  const studyNow = () => {
    const r = summary.resume;
    if (r) navigate(`/course/${slugify(r.courseId)}/${slugify(r.moduleId)}/${slugify(r.topicId)}`);
    else document.getElementById('course-catalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (summary.streakAtRisk) {
    const n = summary.currentStreak;
    return (
      <motion.div
        role="status"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 flex flex-col gap-3 rounded-xl border border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3 dark:border-orange-700/60 dark:from-orange-950/40 dark:to-amber-950/30 sm:flex-row sm:items-center"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <Flame className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 dark:text-gray-100">
              Your {n}-day streak is at risk
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-300">
              Study for a few minutes in the next {timeLeftToday()} to keep it.{' '}
              {freeze.available ? (
                <span className="inline-flex items-center gap-1 font-medium text-sky-700 dark:text-sky-300">
                  <Snowflake className="h-3.5 w-3.5" aria-hidden="true" /> Your weekly streak freeze is ready as a backup.
                </span>
              ) : (
                <span className="font-medium text-red-700 dark:text-red-300">
                  You have used this week&apos;s streak freeze, so a missed day would end it.
                </span>
              )}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={studyNow}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-orange-600 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
        >
          <Play className="h-4 w-4" aria-hidden="true" /> Study now
        </button>
      </motion.div>
    );
  }

  if (savedRecently) {
    return (
      <motion.div
        role="status"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 flex items-center gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 dark:border-sky-800/60 dark:bg-sky-950/30"
      >
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-white">
          <Snowflake className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="text-sm text-gray-800 dark:text-gray-100">
          <span className="font-semibold">Streak freeze used.</span>{' '}
          It saved your streak on {savedRecently === yesterday ? 'yesterday' : dayName(savedRecently)}. You get a fresh freeze every Monday.
        </p>
      </motion.div>
    );
  }

  return null;
}
