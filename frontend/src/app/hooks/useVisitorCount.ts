import { useEffect, useState } from 'react';
import { getVisitorCount, registerVisit } from '../services/api';

/**
 * The site's total visitor count.
 *
 * Opening the application counts one visit (registerVisit adds exactly one per page load, however
 * many components ask). After that the number is re-read from the server every `pollMs`, without
 * counting again, so it grows on screen as other people open the site. Polling pauses while the
 * tab is hidden.
 */
export function useVisitorCount(pollMs = 30000): { count: number; loading: boolean } {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    registerVisit()
      .then(({ count: n }) => { if (!cancelled) setCount(n); })
      .catch(() => { /* server unreachable: keep showing 0 rather than a wrong number */ })
      .finally(() => { if (!cancelled) setLoading(false); });

    const id = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      getVisitorCount()
        .then(({ count: n }) => { if (!cancelled) setCount(prev => (n > prev ? n : prev)); })
        .catch(() => { /* try again next tick */ });
    }, pollMs);

    return () => { cancelled = true; clearInterval(id); };
  }, [pollMs]);

  return { count, loading };
}
