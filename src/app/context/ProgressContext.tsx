import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import {
  VisitedTopic, ProgressSummary,
  recordTopicVisit, importProgress, recordStudySeconds,
  fetchProgressSummary, fetchVisitedTopics, recordQuizAttempt,
} from '../services/api';
import { useAuth } from './AuthContext';

// v1 stored bare topic ids, which cannot be attributed to a course and so cannot be
// uploaded. v2 stores the full triple. v1 entries are still read so existing students do
// not visibly lose their ticks; they get re-recorded properly on the next visit.
const LEGACY_KEY = 'jsl_visited_topics';
const LOCAL_KEY = 'jsl_progress_v2';

interface ProgressContextValue {
  /** topicIds the student has opened, from whichever store is authoritative. */
  visited: Set<string>;
  summary: ProgressSummary | null;
  loading: boolean;
  markVisited: (courseId: string, moduleId: string, topicId: string) => void;
  addStudySeconds: (seconds: number) => void;
  saveAttempt: (a: { courseId: string; moduleId: string; moduleName: string; score: number; totalQuestions: number }) => Promise<void>;
  refresh: () => Promise<void>;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

function readLocal(): VisitedTopic[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function readLegacyIds(): string[] {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Study seconds are accumulated locally and flushed on a timer. Posting once per second
  // would be one request per second per student for no extra fidelity.
  const pendingSeconds = useRef(0);

  const refresh = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const [s, topics] = await Promise.all([fetchProgressSummary(), fetchVisitedTopics()]);
      setSummary(s);
      setVisited(new Set(topics.map(t => t.topicId)));
    } catch {
      // Offline or API down: the UI keeps whatever it already has rather than blanking.
    }
  }, [isLoggedIn]);

  // On sign-in, adopt anything recorded while browsing as a guest, then load from server.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      if (isLoggedIn) {
        const local = readLocal();
        if (local.length > 0) {
          try {
            await importProgress(local);
            localStorage.removeItem(LOCAL_KEY);
          } catch {
            // Keep the local copy so the next sign-in can retry the import.
          }
        }
        await refresh();
      } else {
        const local = readLocal();
        const ids = new Set<string>([...readLegacyIds(), ...local.map(t => t.topicId)]);
        if (!cancelled) {
          setVisited(ids);
          setSummary(null);
        }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [isLoggedIn, refresh]);

  const markVisited = useCallback((courseId: string, moduleId: string, topicId: string) => {
    setVisited(prev => (prev.has(topicId) ? prev : new Set(prev).add(topicId)));

    if (isLoggedIn) {
      // Fire and forget: a dropped write costs one tick mark, not correctness.
      recordTopicVisit({ courseId, moduleId, topicId }).catch(() => {});
      return;
    }
    const local = readLocal();
    if (!local.some(t => t.topicId === topicId)) {
      local.push({ courseId, moduleId, topicId });
      try { localStorage.setItem(LOCAL_KEY, JSON.stringify(local)); } catch { /* quota */ }
    }
  }, [isLoggedIn]);

  const addStudySeconds = useCallback((seconds: number) => {
    pendingSeconds.current += seconds;
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    const flush = () => {
      const n = pendingSeconds.current;
      if (n <= 0) return;
      pendingSeconds.current = 0;
      recordStudySeconds(n).catch(() => { pendingSeconds.current += n; });
    };
    const id = setInterval(flush, 60000);
    // Also flush when the tab is hidden or closed, so a short session still counts.
    const onHide = () => { if (document.visibilityState === 'hidden') flush(); };
    document.addEventListener('visibilitychange', onHide);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onHide);
      flush();
    };
  }, [isLoggedIn]);

  const saveAttempt = useCallback(async (a: {
    courseId: string; moduleId: string; moduleName: string; score: number; totalQuestions: number;
  }) => {
    if (!isLoggedIn) return;
    try {
      await recordQuizAttempt(a);
      await refresh();
    } catch {
      // A lost attempt should never block the student from seeing their result.
    }
  }, [isLoggedIn, refresh]);

  return (
    <ProgressContext.Provider value={{ visited, summary, loading, markVisited, addStudySeconds, saveAttempt, refresh }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
