import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Flame, Zap, BookOpenCheck, Clock, PlayCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { fetchReviewQueue, ReviewItem } from '../services/api';
import { TOTAL_TOPICS } from '../data/courseStats';
import { slugify } from '../lib/slug';
import { StudyActivity } from './StudyActivity';
import { StreakBanner } from './StreakBanner';

function formatDuration(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function Stat({ icon, value, label, tone }: {
  icon: React.ReactNode; value: string; label: string; tone: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/70 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tone}`}>{icon}</div>
      <div className="min-w-0">
        <div className="font-display font-bold text-lg text-gray-800 dark:text-gray-100 leading-none tabular-nums">{value}</div>
        <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{label}</div>
      </div>
    </div>
  );
}

/**
 * The signed-in student's progress: streak, XP, coverage, where to resume, and which
 * modules are due for another attempt. Renders a sign-in prompt for guests, because their
 * progress is trapped in one browser until they have an account.
 */
export function ProgressPanel() {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const { summary } = useProgress();
  const [review, setReview] = useState<ReviewItem[]>([]);

  useEffect(() => {
    if (!isLoggedIn) { setReview([]); return; }
    let cancelled = false;
    fetchReviewQueue()
      .then(items => { if (!cancelled) setReview(items); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isLoggedIn, summary?.modulesPassed]);

  if (!isLoggedIn) {
    return null;
  }

  if (!summary) return null;

  const pct = TOTAL_TOPICS > 0 ? Math.round((summary.topicsSeen / TOTAL_TOPICS) * 100) : 0;
  const firstName = user?.fullName?.split(' ')[0] || 'there';
  const dueNow = review.slice(0, 3);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/50 backdrop-blur-sm p-5"
      aria-label="Your learning progress"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
        <h2 className="font-display text-lg font-bold text-gray-800 dark:text-gray-100 tracking-tight">
          Welcome back, {firstName}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {summary.topicsSeen} of {TOTAL_TOPICS} topics opened
        </p>
      </div>

      <StreakBanner />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat
          icon={<Flame className="w-5 h-5 text-white" />}
          value={summary.currentStreak === 0 ? 'Start today' : `${summary.currentStreak} day${summary.currentStreak === 1 ? '' : 's'}`}
          label={`${summary.longestStreak > summary.currentStreak ? `Best: ${summary.longestStreak} days` : 'Current streak'} · freeze ${summary.streakFreeze.available ? 'ready' : 'used'}`}
          tone="bg-gradient-to-br from-orange-500 to-red-500"
        />
        <Stat
          icon={<Zap className="w-5 h-5 text-white" />}
          value={summary.xp.toLocaleString()}
          label="XP earned"
          tone="bg-gradient-to-br from-amber-400 to-yellow-500"
        />
        <Stat
          icon={<BookOpenCheck className="w-5 h-5 text-white" />}
          value={`${summary.modulesPassed}`}
          label={summary.modulesPassed === 1 ? 'Module passed' : 'Modules passed'}
          tone="bg-gradient-to-br from-emerald-500 to-teal-500"
        />
        <Stat
          icon={<Clock className="w-5 h-5 text-white" />}
          value={formatDuration(summary.studySecondsToday)}
          label={`Today - ${formatDuration(summary.studySecondsTotal)} total`}
          tone="bg-gradient-to-br from-sky-500 to-indigo-500"
        />
      </div>

      {/* Overall coverage */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
          <span>Course library covered</span>
          <span className="tabular-nums">{pct}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <motion.div
            className="h-2 rounded-full bg-gradient-to-r from-orange-600 to-amber-500"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      <StudyActivity />

      <div className="flex flex-col lg:flex-row gap-3">
        {summary.resume && (
          <button
            onClick={() => navigate(
              `/course/${slugify(summary.resume!.courseId)}/${slugify(summary.resume!.moduleId)}/${slugify(summary.resume!.topicId)}`
            )}
            className="flex-1 text-left rounded-xl border border-orange-200 dark:border-orange-900/50 bg-orange-50/70 dark:bg-orange-950/20 px-4 py-3 flex items-center gap-3 hover:border-orange-400 transition-colors"
          >
            <PlayCircle className="w-8 h-8 text-orange-600 dark:text-orange-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Continue where you left off</div>
              <div className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                {summary.resume.topicId.replace(/[-_]/g, ' ')}
              </div>
            </div>
          </button>
        )}

        {dueNow.length > 0 && (
          <div className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Due for review
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {dueNow.map(item => (
                <button
                  key={item.courseId + '/' + item.moduleId}
                  onClick={() => navigate(`/course/${slugify(item.courseId)}`)}
                  title={item.everPassed
                    ? `Best ${item.best}% - last attempted ${item.daysSince} day(s) ago`
                    : `Not passed yet - best ${item.best}%`}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-purple-200 dark:border-purple-900/50 bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 hover:border-purple-400 transition-colors"
                >
                  {item.moduleName}
                  <span className="ml-1.5 opacity-70 tabular-nums">{item.best}%</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}
