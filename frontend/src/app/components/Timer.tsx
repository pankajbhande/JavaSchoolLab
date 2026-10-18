import { useState, useEffect, useCallback } from 'react';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

const STORAGE_KEY = 'jsl_study_timer';

interface Saved {
  /** Milliseconds counted before the current run started. */
  elapsedMs: number;
  /** When the current run started (epoch ms), or null while paused / stopped. */
  startedAt: number | null;
}

function load(): Saved {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (raw && typeof raw.elapsedMs === 'number') return { elapsedMs: raw.elapsedMs, startedAt: typeof raw.startedAt === 'number' ? raw.startedAt : null };
  } catch { /* unreadable or blocked storage: start fresh */ }
  return { elapsedMs: 0, startedAt: null };
}

export function formatTimer(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export interface StudyTimer {
  seconds: number;
  isRunning: boolean;
  toggle: () => void;
  reset: () => void;
}

/**
 * The study timer's state. It lives in the header, which never unmounts, so the timer keeps
 * running while its panel is closed. Time is measured from timestamps rather than by counting
 * ticks, so it stays correct when the browser throttles a background tab, and it is saved so
 * a reload does not lose it.
 */
export function useStudyTimer(): StudyTimer {
  const [state, setState] = useState<Saved>(load);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* quota or private mode */ }
  }, [state]);

  useEffect(() => {
    if (state.startedAt === null) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [state.startedAt]);

  const elapsed = state.elapsedMs + (state.startedAt === null ? 0 : Math.max(0, now - state.startedAt));

  const toggle = useCallback(() => {
    setState(s => s.startedAt === null
      ? { elapsedMs: s.elapsedMs, startedAt: Date.now() }
      : { elapsedMs: s.elapsedMs + Math.max(0, Date.now() - s.startedAt), startedAt: null });
  }, []);
  const reset = useCallback(() => setState({ elapsedMs: 0, startedAt: null }), []);

  return { seconds: Math.floor(elapsed / 1000), isRunning: state.startedAt !== null, toggle, reset };
}

export function Timer({ timer }: { timer: StudyTimer }) {
  const { seconds, isRunning, toggle, reset } = timer;
  const status = isRunning ? 'Running' : seconds > 0 ? 'Paused' : 'Ready';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl shadow-md border border-blue-200 dark:border-blue-700"
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">Study Timer</h3>
        </div>
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${isRunning
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
            : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}
        >
          {status}
        </span>
      </div>

      <div className="text-3xl font-mono font-bold text-center mb-4 text-gray-800 dark:text-gray-200" role="timer" aria-live="off">
        {formatTimer(seconds)}
      </div>

      <div className="flex gap-2 justify-center">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggle}
          aria-label={isRunning ? 'Pause timer' : 'Start timer'}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={reset}
          aria-label="Reset timer"
          className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
        >
          <RotateCcw className="w-4 h-4" />
        </motion.button>
      </div>
      {isRunning && <p className="mt-3 text-center text-xs text-gray-600 dark:text-gray-300">Keeps running while this panel is closed.</p>}
    </motion.div>
  );
}
