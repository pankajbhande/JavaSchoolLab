// Server-side topic search (OpenSearch behind GET /api/search). Returns null when the server cannot search (not configured, still
// indexing, or unreachable), and the caller then falls back to the in-page search in contentSearch.ts, so search always works.

import { API_BASE } from './api';
import type { SearchHit } from './contentSearch';

// After "not enabled" the server will not start searching until it is restarted, so stop asking for the rest of the session.
// After "still preparing" or a network error, try again in a little while.
let offUntil = 0;
const FOREVER = Number.MAX_SAFE_INTEGER;

export async function searchServer(query: string, signal?: AbortSignal, limit = 30): Promise<SearchHit[] | null> {
  if (Date.now() < offUntil) return null;
  try {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}&limit=${limit}`, { signal });
    if (res.ok) {
      const body = await res.json();
      return Array.isArray(body.hits) ? (body.hits as SearchHit[]) : null;
    }
    const err = await res.json().catch(() => ({}));
    if (res.status === 503) offUntil = /not enabled/i.test(String(err.error)) ? FOREVER : Date.now() + 30_000;
    return null;
  } catch (e) {
    if ((e as Error)?.name === 'AbortError') throw e;
    offUntil = Date.now() + 30_000;
    return null;
  }
}

/** For tests. */
export function resetServerSearch(): void {
  offUntil = 0;
}
