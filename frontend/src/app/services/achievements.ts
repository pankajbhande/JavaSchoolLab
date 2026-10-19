// Levels and badges (GET /api/achievements).
//
// The server reports a newly earned badge exactly once, to whoever asks first. So every part of the site asks through refreshAchievements():
// it keeps the latest answer for the pages that show levels and badges, and collects the new badges for the celebration, whichever
// part of the site happened to make the call.

import { API_BASE, getAuthToken, PROGRESS_EVENT, announceProgress } from './api';

export { PROGRESS_EVENT, announceProgress };

export interface Level {
  number: number; name: string; saying: string; xp: number; fromXp: number; toXp: number | null; percent: number; nextName: string | null; maxed: boolean;
}
export interface Badge {
  id: string; name: string; description: string; icon: string; target: number; progress: number; earned: boolean; earnedAt: string | null;
}
export interface Announcement { id: string; kind: 'badge' | 'level'; name: string; description: string; icon: string; message: string }
export interface Achievements {
  level: Level;
  levels: { number: number; name: string; minXp: number; reached: boolean }[];
  badges: Badge[];
  totalEarned: number;
  totalBadges: number;
  newlyEarned: Announcement[];
}

async function fetchAchievements(): Promise<Achievements> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/achievements`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) throw new Error('Could not load achievements');
  return res.json();
}

let latest: Achievements | null = null;
let pending: Announcement[] = [];
const listeners = new Set<() => void>();
const notify = () => listeners.forEach(l => l());

export const getLatestAchievements = () => latest;

export function subscribeAchievements(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/** The badges earned since the celebration last asked. Each is handed out once. */
export function takeNewBadges(): Announcement[] {
  const p = pending;
  pending = [];
  return p;
}

export async function refreshAchievements(): Promise<Achievements> {
  const a = await fetchAchievements();
  latest = a;
  if (a.newlyEarned.length) pending = [...pending, ...a.newlyEarned.filter(n => !pending.some(p => p.id === n.id))];
  notify();
  return a;
}

/** Signed out: forget everything so the next learner on this browser starts clean. */
export function resetAchievements(): void {
  latest = null;
  pending = [];
  notify();
}

/** The badge's name and meaning, spoken in the first person for sharing: "I just earned the On Fire badge". */
export function winText(a: { name: string; kind: string }): string {
  return a.kind === 'level'
    ? `I just reached ${a.name} on JavaSchoolLab! Learning Java one step at a time.`
    : `I just earned the "${a.name}" badge on JavaSchoolLab! Learning Java one step at a time.`;
}
