// Recently opened topic ids for the command palette (names are resolved from the index).

const KEY = 'jsl_recent_topics';
const MAX = 6;

export function getRecents(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string').slice(0, MAX) : [];
  } catch { return []; }
}

export function pushRecent(topicId: string): string[] {
  const next = [topicId, ...getRecents().filter(id => id !== topicId)].slice(0, MAX);
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
  return next;
}
