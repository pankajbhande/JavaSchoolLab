import { useEffect, useState } from 'react';

/**
 * Tracks a CSS media query from JS.
 *
 * The three-pane workspace cannot be made responsive with CSS alone: on a phone the
 * sidebars have to become overlay drawers with their own open/closed state, which is a
 * structural change, not a styling one. This hook is what decides between the two shells.
 *
 * The initial value is read synchronously so the first paint is already correct — deferring
 * it to an effect would flash the desktop layout on every mobile load.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    // Re-read on mount: the query may have changed between render and effect
    // (rotation, or a resize during hydration).
    setMatches(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** Tailwind's `lg` breakpoint — the width below which the three-pane shell stops working. */
export const DESKTOP_QUERY = '(min-width: 1024px)';
