import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAchievements } from '../hooks/useAchievements';
import { BadgeIcon } from '../components/BadgeIcon';

/** My level and badges: short, warm, and honest about what is left to earn. */
export default function AchievementsPage() {
  const { isLoggedIn } = useAuth();
  const data = useAchievements();

  useEffect(() => { document.title = 'My achievements · JavaSchoolLab'; }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-900 text-gray-900 dark:text-gray-100">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-700 dark:text-orange-300 hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
        </Link>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight">My achievements</h1>

        {!isLoggedIn && <p className="mt-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">Please <Link className="font-semibold text-orange-700 dark:text-orange-300 underline" to="/login">sign in</Link> to collect badges and level up.</p>}
        {isLoggedIn && !data && <p role="status" className="mt-4 text-gray-600 dark:text-gray-400">Loading your badges…</p>}

        {data && (
          <>
            <section aria-label="Your level" className="mt-5 rounded-2xl bg-gradient-to-r from-[#ff5500] to-[#ff9a0a] p-5 text-white shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/90">Level {data.level.number}</p>
              <p className="font-display text-3xl font-extrabold">{data.level.name}</p>
              <p className="mt-1 text-sm text-white/95">{data.level.saying}</p>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/30" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={data.level.percent} aria-label="Progress to the next level">
                <div className="h-full rounded-full bg-white" style={{ width: `${data.level.percent}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-white/95">
                {data.level.maxed ? 'You have reached the top of the fort. Well done!' : `${data.level.xp} of ${data.level.toXp} XP to reach ${data.level.nextName}`}
              </p>
              <ol className="mt-3 flex flex-wrap gap-1.5" aria-label="All levels">
                {data.levels.map(l => (
                  <li key={l.number} className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${l.reached ? 'bg-white text-orange-700' : 'bg-white/20 text-white/90'}`}>{l.name}</li>
                ))}
              </ol>
            </section>

            <h2 className="mt-7 flex items-baseline justify-between font-display text-xl font-bold">
              Badges <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{data.totalEarned} of {data.totalBadges} earned</span>
            </h2>
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {data.badges.map(b => (
                <li key={b.id} className={`rounded-2xl border p-3.5 ${b.earned ? 'border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-800' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'}`}>
                  <div className={`grid h-11 w-11 place-items-center rounded-full ${b.earned ? 'bg-gradient-to-br from-orange-500 to-amber-400 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                    {b.earned ? <BadgeIcon name={b.icon} className="h-5 w-5" /> : <Lock aria-hidden="true" className="h-4 w-4" />}
                  </div>
                  <p className="mt-2 text-sm font-bold leading-tight">{b.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{b.description}</p>
                  {b.earned
                    ? <p className="mt-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">Earned{b.earnedAt ? ` ${new Date(b.earnedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}</p>
                    : <div className="mt-1.5"><div className="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"><div className="h-full bg-orange-500" style={{ width: `${Math.round((b.progress / b.target) * 100)}%` }} /></div><p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">{b.progress} / {b.target}</p></div>}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
