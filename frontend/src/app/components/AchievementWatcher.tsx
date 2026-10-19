import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { X, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Announcement, PROGRESS_EVENT, refreshAchievements, resetAchievements, subscribeAchievements, takeNewBadges, winText } from '../services/achievements';
import { track } from '../services/analytics';
import { BadgeIcon } from './BadgeIcon';

const CONFETTI = ['#f97316', '#fbbf24', '#10b981', '#6366f1', '#ec4899', '#0ea5e9'];

function Confetti() {
  const pieces = Array.from({ length: 22 }, (_, i) => ({ i, x: (i / 22) * 100 - 50 + ((i * 37) % 11), r: (i * 53) % 360, c: CONFETTI[i % CONFETTI.length], d: (i % 5) * 0.04 }));
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-2 h-0 overflow-visible">
      {pieces.map(p => (
        <motion.span key={p.i} className="absolute left-1/2 top-0 block h-2.5 w-1.5 rounded-sm" style={{ background: p.c }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }} animate={{ x: p.x * 4, y: [0, -60 - (p.i % 4) * 14, 120], opacity: [1, 1, 0], rotate: p.r + 360 }}
          transition={{ duration: 1.6, delay: p.d, ease: 'easeOut' }} />
      ))}
    </div>
  );
}

/**
 * Celebrates a new badge or level the moment it is earned. It asks the server for news when someone signs in, and a moment after
 * progress is saved (a topic opened, a quiz taken, a certificate issued). Each badge is announced once: the server only reports it the
 * first time. Several at once are shown one after another.
 */
export function AchievementWatcher() {
  const { isLoggedIn } = useAuth();
  const reduce = useReducedMotion();
  const [queue, setQueue] = useState<Announcement[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const busy = useRef(false);

  const check = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      await refreshAchievements();       // new badges arrive through the subscription below
    } catch { /* offline or signed out: try again at the next event */ } finally { busy.current = false; }
  }, []);

  useEffect(() => {
    // Any part of the site that asks for achievements may be the one the server tells about a new badge; all of them reach this queue.
    const take = () => {
      const fresh = takeNewBadges();
      if (fresh.length) setQueue(q => [...q, ...fresh.filter(n => !q.some(x => x.id === n.id))]);
    };
    take();
    return subscribeAchievements(take);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) { setQueue([]); resetAchievements(); return; }
    void check();
    const onProgress = () => { clearTimeout(timer.current); timer.current = setTimeout(() => void check(), 1500); };
    window.addEventListener(PROGRESS_EVENT, onProgress);
    return () => { window.removeEventListener(PROGRESS_EVENT, onProgress); clearTimeout(timer.current); };
  }, [isLoggedIn, check]);

  const current = queue[0];
  const close = useCallback(() => setQueue(q => q.slice(1)), []);

  useEffect(() => {
    if (!current) return;
    const t = setTimeout(close, 10000);
    return () => clearTimeout(t);
  }, [current, close]);

  const share = async () => {
    if (!current) return;
    const text = winText(current);
    const url = window.location.origin;
    track('share', { path: '/achievements', detail: 'win' });
    if (typeof navigator.share === 'function' && window.matchMedia?.('(pointer: coarse)').matches) {
      try { await navigator.share({ title: 'JavaSchoolLab', text, url }); } catch { /* closed */ }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[90] flex justify-center px-3">
      <AnimatePresence mode="wait">
        {current && (
          <motion.div key={current.id} role="status" data-testid="achievement-toast"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="pointer-events-auto relative w-full max-w-sm rounded-2xl border border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-800 p-4 shadow-2xl">
            {!reduce && <Confetti />}
            <button type="button" onClick={close} aria-label="Close" className="absolute right-2 top-2 rounded-md p-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className="flex items-start gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-md">
                <BadgeIcon name={current.icon} className="h-6 w-6" />
              </div>
              <div className="min-w-0 pr-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-orange-700 dark:text-orange-300">{current.kind === 'level' ? 'Level up!' : 'New badge!'}</p>
                <p className="font-display text-lg font-bold leading-tight text-gray-900 dark:text-white">{current.name}</p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{current.message}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <a href="/achievements" className="text-sm font-medium text-orange-700 dark:text-orange-300 underline-offset-2 hover:underline">See all badges</a>
              <button type="button" onClick={share} className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500">
                <Share2 className="h-4 w-4" aria-hidden="true" /> Share my win
              </button>
            </div>
            {queue.length > 1 && <p className="mt-2 text-center text-[11px] text-gray-500 dark:text-gray-400">{queue.length - 1} more to show</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
