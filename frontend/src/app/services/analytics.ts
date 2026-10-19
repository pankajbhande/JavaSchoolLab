// Anonymous site analytics: page views and searches, sent to POST /api/analytics/event. Nothing here can break the page: every
// failure is swallowed. No cookies are set; the session id lives only in sessionStorage (one per browser tab) and is random.
// Browsers that send "Do Not Track" are not tracked at all.

import { API_BASE, getAuthToken } from './api';

const SESSION_KEY = 'jsl_sid';

function sessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36));
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return 'no-session';
  }
}

function doNotTrack(): boolean {
  return typeof navigator !== 'undefined' && (navigator.doNotTrack === '1' || (window as { doNotTrack?: string }).doNotTrack === '1');
}

export function track(type: 'page_view' | 'search' | 'share', fields: { path?: string; detail?: string; value?: number } = {}): void {
  if (doNotTrack()) return;
  try {
    const token = getAuthToken();
    void fetch(`${API_BASE}/analytics/event`, {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ type, sessionId: sessionId(), ...fields }),
    }).catch(() => {});
  } catch {
    /* tracking must never break the site */
  }
}

/** Page view for the current route. The query string and fragment are cut off here and again on the server. */
export function trackPageView(pathname: string): void {
  track('page_view', { path: pathname });
}

// A search box fires on every keystroke; only the query that stays put for a moment is a real search.
let searchTimer: ReturnType<typeof setTimeout> | undefined;
let lastTracked = '';
export function trackSearch(query: string, resultCount: number, delayMs = 1500): void {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return;
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    if (q === lastTracked) return;
    lastTracked = q;
    track('search', { detail: q, value: resultCount });
  }, delayMs);
}
