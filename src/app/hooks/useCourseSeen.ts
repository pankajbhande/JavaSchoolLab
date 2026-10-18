import { useEffect, useState } from 'react';
import { useProgress } from '../context/ProgressContext';

/**
 * Topics opened per course. Signed-in students get the server's numbers; guests (and the moment
 * before the summary arrives) are derived from the locally visited topic ids.
 */
export function useCourseSeen(): Record<string, number> {
  const { summary, visited } = useProgress();
  const [local, setLocal] = useState<Record<string, number>>({});

  useEffect(() => {
    if (summary?.byCourse) return;
    let cancelled = false;
    import('../data/courseIndex').then(({ courseIndex }) => {
      if (cancelled) return;
      const out: Record<string, number> = {};
      for (const c of courseIndex) {
        let n = 0;
        for (const m of c.subTopics) for (const t of m.topics) if (visited.has(t.id)) n++;
        if (n > 0) out[c.id] = n;
      }
      setLocal(out);
    });
    return () => { cancelled = true; };
  }, [summary?.byCourse, visited]);

  return summary?.byCourse ?? local;
}
