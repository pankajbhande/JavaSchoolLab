import { Flame, Zap, Trophy, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { levelFromXp } from '../../lib/xp';

interface StatsStripProps {
  xp: number;
  currentStreak: number;
  longestStreak: number;
  studyMinutes: number;
  isLoggedIn: boolean;
  /** Guests have no study-time tracking or server streak, so the labels say what is shown. */
  streakLabel: string;
}

export function StatsStrip({ xp, currentStreak, longestStreak, studyMinutes, isLoggedIn, streakLabel }: StatsStripProps) {
  const lvl = levelFromXp(xp);
  const lit = currentStreak > 0;

  return (
    <section aria-label="Your streak, XP and level" className="mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.4fr_1fr] gap-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/50 backdrop-blur-sm p-3 sm:p-4">
        <div className="flex items-center gap-3 px-1">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${lit ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/25' : 'bg-gray-200 dark:bg-gray-700'}`}>
            <Flame className={`w-6 h-6 ${lit ? 'text-white' : 'text-gray-500 dark:text-gray-300'}`} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="font-display font-bold text-xl text-gray-900 dark:text-gray-100 leading-none tabular-nums">
              {currentStreak} <span className="text-sm font-semibold">{currentStreak === 1 ? 'day' : 'days'}</span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
              {streakLabel}
              {longestStreak > 0 && <> &middot; best {longestStreak}</>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-1 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
            <Trophy className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-display font-bold text-xl text-gray-900 dark:text-gray-100 leading-none">Level {lvl.level}</span>
              <span className="text-xs text-gray-600 dark:text-gray-300 tabular-nums inline-flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" aria-hidden="true" />{xp.toLocaleString()} XP
              </span>
            </div>
            <div
              role="progressbar"
              aria-label={`Progress to level ${lvl.level + 1}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={lvl.percent}
              className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden"
            >
              <div className="h-2 rounded-full bg-gradient-to-r from-orange-600 to-amber-400 transition-[width] duration-700 motion-reduce:transition-none" style={{ width: `${lvl.percent}%` }} />
            </div>
            <div className="text-[11px] text-gray-600 dark:text-gray-400 mt-1 tabular-nums">
              {lvl.xpForNext - lvl.xpIntoLevel} XP to level {lvl.level + 1}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-1">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="font-display font-bold text-xl text-gray-900 dark:text-gray-100 leading-none tabular-nums">
              {studyMinutes >= 60 ? `${Math.floor(studyMinutes / 60)}h ${studyMinutes % 60}m` : `${studyMinutes}m`}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">Study time{isLoggedIn ? '' : ' (sign in to track)'}</div>
          </div>
        </div>
      </div>

      {!isLoggedIn && (
        <p className="mt-2 text-xs text-center text-gray-600 dark:text-gray-400">
          Your progress is saved in this browser only.{' '}
          <Link to="/login" className="font-semibold text-orange-700 dark:text-orange-300 underline underline-offset-2 hover:text-orange-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-600 rounded">
            Log in to keep your streak safe
          </Link>
          .
        </p>
      )}
    </section>
  );
}
