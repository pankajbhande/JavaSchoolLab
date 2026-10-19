// Points at the local API by default so `npm run dev` works with no config.
// Set VITE_API_BASE_URL at build time to target a deployed backend.
export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api';

/** Progress was just saved (a topic opened, a quiz taken, a certificate issued): the achievements watcher looks for new badges shortly after. */
export const PROGRESS_EVENT = 'jsl:progress';
export function announceProgress(): void {
  try { window.dispatchEvent(new Event(PROGRESS_EVENT)); } catch { /* not in a browser */ }
}

function getToken(): string | null {
  return localStorage.getItem('jsl_token');
}

/** The signed-in user's token, for work that must outlive the sign-out that clears it. */
export function getAuthToken(): string | null {
  return getToken();
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export interface User {
  id: number;
  fullName: string;
  email: string | null;
  mobile: string | null;
  loginType: 'email' | 'mobile';
  gender?: string | null;
  dob?: string | null;
  organization?: string | null;
  /** Profile photo as a data URL; null/absent means none. */
  avatar?: string | null;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CertificateData {
  id: number;
  certificateUid: string;
  studentName: string;
  courseName: string;
  topicName: string;
  score: number;
  totalQuestions: number;
  issuedAt: string;
}

// OTP
export interface OtpResponse {
  message: string;
  expiresIn: number;
  _dev_otp?: string;
}

export async function sendOtp(data: { identifier: string; identifierType: 'email' | 'mobile'; purpose: 'login' | 'register' }): Promise<OtpResponse> {
  const res = await fetch(`${API_BASE}/otp/send`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
  return res.json();
}

export async function verifyOtp(data: { identifier: string; identifierType: 'email' | 'mobile'; otp: string; purpose: 'login' | 'register' }): Promise<{ verified: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/otp/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
  return res.json();
}

// Auth
export async function registerUser(data: { fullName: string; email?: string; mobile?: string; password: string; loginType: 'email' | 'mobile' }): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
  return res.json();
}

export async function registerWithOtp(data: { fullName: string; email?: string; mobile?: string; password: string; loginType: 'email' | 'mobile'; otp: string; gender?: string; dob?: string; organization?: string }): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
  return res.json();
}

export async function loginUser(data: { email?: string; mobile?: string; password: string; loginType: 'email' | 'mobile' }): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
  return res.json();
}

export async function loginWithOtp(data: { email?: string; mobile?: string; loginType: 'email' | 'mobile'; otp: string }): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
  return res.json();
}

export async function getAuthConfig(): Promise<{ googleClientId: string }> {
  const res = await fetch(`${API_BASE}/auth/config`);
  if (!res.ok) throw new Error("Could not read sign-in settings");
  return res.json();
}

export async function loginWithGoogle(credential: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/google`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ credential }) });
  if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || "Google sign-in failed"); }
  return res.json();
}

export async function fetchCurrentUser(): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/me`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Not authenticated');
  return res.json();
}

async function jsonOrThrow<T>(res: Response, fallback: string): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || fallback);
  }
  return res.json();
}

// Profile
export async function updateProfile(data: { fullName: string; gender?: string; dob?: string; organization?: string }): Promise<void> {
  await jsonOrThrow(await fetch(`${API_BASE}/auth/profile`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(data) }), 'Failed to update profile');
}

export async function uploadAvatar(image: string): Promise<void> {
  await jsonOrThrow(await fetch(`${API_BASE}/profile/avatar`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ image }) }), 'Failed to save your photo');
}

/** Pass null to clear the weekly goal. */
export async function saveWeeklyGoal(minutes: number | null): Promise<void> {
  await jsonOrThrow(await fetch(`${API_BASE}/progress/goal`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ minutes }) }), 'Failed to save your goal');
}

export async function removeAvatar(): Promise<void> {
  await jsonOrThrow(await fetch(`${API_BASE}/profile/avatar`, { method: 'DELETE', headers: authHeaders() }), 'Failed to remove your photo');
}

export async function changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
  await jsonOrThrow(await fetch(`${API_BASE}/auth/change-password`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }), 'Failed to change password');
}

// Bookmarks & notes
export interface TopicRef { courseId: string; moduleId: string; topicId: string; topicName: string }
export interface Bookmark extends TopicRef { createdAt: string }
export interface Note extends TopicRef { body: string; updatedAt: string }

export async function fetchBookmarks(): Promise<Bookmark[]> {
  return jsonOrThrow(await fetch(`${API_BASE}/bookmarks`, { headers: authHeaders() }), 'Failed to load bookmarks');
}
export async function addBookmark(ref: TopicRef): Promise<void> {
  await jsonOrThrow(await fetch(`${API_BASE}/bookmarks`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(ref) }), 'Failed to save bookmark');
}
export async function removeBookmark(ref: { courseId: string; topicId: string }): Promise<void> {
  await jsonOrThrow(await fetch(`${API_BASE}/bookmarks`, { method: 'DELETE', headers: authHeaders(), body: JSON.stringify(ref) }), 'Failed to remove bookmark');
}
export async function fetchNotes(): Promise<Note[]> {
  return jsonOrThrow(await fetch(`${API_BASE}/notes`, { headers: authHeaders() }), 'Failed to load notes');
}
export async function saveNote(ref: TopicRef & { body: string }): Promise<void> {
  await jsonOrThrow(await fetch(`${API_BASE}/notes`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(ref) }), 'Failed to save note');
}

// Leaderboard
export interface LeaderboardEntry { rank: number; name: string; xp: number; modulesPassed: number; isMe: boolean }
export interface Leaderboard { top: LeaderboardEntry[]; me: { rank: number; xp: number } | null; total: number }
export async function fetchLeaderboard(): Promise<Leaderboard> {
  return jsonOrThrow(await fetch(`${API_BASE}/leaderboard`, { headers: authHeaders() }), 'Failed to load leaderboard');
}

// Certificates
export async function issueCertificate(data: { courseName: string; topicName: string; score: number; totalQuestions: number }): Promise<CertificateData> {
  const res = await fetch(`${API_BASE}/certificates`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
  if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
  announceProgress();
  return res.json();
}

export interface VerifiedCertificate {
  valid: true;
  certificateUid: string;
  studentName: string;
  courseName: string;
  topicName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  issuedAt: string;
}

/** Public lookup behind the QR code. Resolves to null when no such certificate exists. */
export async function verifyCertificate(uid: string): Promise<VerifiedCertificate | null> {
  const res = await fetch(`${API_BASE}/certificates/verify/${encodeURIComponent(uid)}`);
  if (res.status === 404) return null;
  if (res.status === 429) throw new Error('Too many checks in a short time. Please wait a minute and try again.');
  if (!res.ok) throw new Error('The verification service is not reachable right now. Please try again shortly.');
  return res.json();
}

export async function fetchCertificates(): Promise<CertificateData[]> {
  const res = await fetch(`${API_BASE}/certificates`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch certificates');
  return res.json();
}

// Visitors
export async function incrementVisitor(): Promise<{ count: number }> {
  const res = await fetch(`${API_BASE}/visitors/increment`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

// Counts this page load exactly once, no matter how many components ask or how often they
// remount (React StrictMode, navigating between pages). Every full page load / return visit
// is a new module instance, so it adds +1 again: 100 visits -> 100 on the counter.
let visitPromise: Promise<{ count: number }> | null = null;
export function registerVisit(): Promise<{ count: number }> {
  if (!visitPromise) {
    // A reload the app triggered itself (installing an update) is not a new visit.
    let skip = false;
    try { skip = sessionStorage.getItem("jsl_no_count") === "1"; sessionStorage.removeItem("jsl_no_count"); } catch { /* ignore */ }
    visitPromise = (skip ? getVisitorCount() : incrementVisitor()).catch(async (err) => {
      // Server unreachable: show the current number, and still count nothing twice.
      try { return await getVisitorCount(); } catch { throw err; }
    });
  }
  return visitPromise;
}

export async function getVisitorCount(): Promise<{ count: number }> {
  const res = await fetch(`${API_BASE}/visitors/count`);
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

// ==================== LEARNING PROGRESS ====================

export interface VisitedTopic {
  courseId: string;
  moduleId: string;
  topicId: string;
}

export interface ProgressSummary {
  /** Derived server-side from source rows on every request, so it cannot drift. */
  xp: number;
  currentStreak: number;
  longestStreak: number;
  /** One missed day per Monday-week is forgiven automatically; `usedDates` are recent saved days. */
  streakFreeze: { available: boolean; usedDates: string[] };
  studiedToday: boolean;
  /** A live streak exists and nothing has been studied yet today. */
  streakAtRisk: boolean;
  topicsSeen: number;
  modulesPassed: number;
  studySecondsToday: number;
  studySecondsTotal: number;
  /** Most recent 60 studied days, newest first, as YYYY-MM-DD. */
  studiedDates: string[];
  /** About a year of per-day study seconds, newest first, for the heatmap and weekly goal. */
  studyDays: { date: string; seconds: number }[];
  /** Weekly study goal in minutes, or null when none is set. */
  weeklyGoalMinutes: number | null;
  /** courseId -> number of topics opened in that course. */
  byCourse: Record<string, number>;
  passedModules: { courseId: string; moduleId: string; best: number }[];
  /** Where the student last was, for the Continue card. */
  resume: VisitedTopic | null;
}

export interface QuizAttempt {
  courseId: string;
  moduleId: string;
  moduleName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  attemptedAt: string;
}

export interface ReviewItem {
  courseId: string;
  moduleId: string;
  moduleName: string;
  best: number;
  everPassed: boolean;
  attempts: number;
  intervalDays: number;
  daysSince: number;
}

export async function recordTopicVisit(data: VisitedTopic): Promise<void> {
  const res = await fetch(`${API_BASE}/progress/topic`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
  if (res.ok) announceProgress();
}

export async function importProgress(topics: VisitedTopic[]): Promise<{ imported: number }> {
  const res = await fetch(`${API_BASE}/progress/import`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ topics }) });
  if (!res.ok) throw new Error('Failed to import progress');
  return res.json();
}

/**
 * Adds study time to the signed-in user's total. `token` lets the final flush on sign-out use the
 * token the time was earned under; by then the stored one has already been cleared.
 */
export async function recordStudySeconds(seconds: number, token: string | null = getToken()): Promise<void> {
  if (!token) return; // signed out: there is nobody to credit
  const res = await fetch(`${API_BASE}/progress/study`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ seconds }),
  });
  // An expired token will never succeed, so drop that time instead of retrying it forever;
  // anything else (server down, 5xx) throws so the caller keeps the seconds for the next flush.
  if (!res.ok && res.status !== 401) throw new Error('Failed to record study time');
}

export async function fetchProgressSummary(): Promise<ProgressSummary> {
  const res = await fetch(`${API_BASE}/progress/summary`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load progress');
  return res.json();
}

export async function fetchVisitedTopics(): Promise<VisitedTopic[]> {
  const res = await fetch(`${API_BASE}/progress/topics`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load visited topics');
  return res.json();
}

export async function recordQuizAttempt(data: {
  courseId: string; moduleId: string; moduleName: string; score: number; totalQuestions: number;
}): Promise<{ id: number; percentage: number; passed: boolean }> {
  const res = await fetch(`${API_BASE}/quiz/attempts`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to record attempt');
  announceProgress();
  return res.json();
}

export async function fetchQuizAttempts(): Promise<QuizAttempt[]> {
  const res = await fetch(`${API_BASE}/quiz/attempts`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load attempts');
  return res.json();
}

export async function fetchReviewQueue(): Promise<ReviewItem[]> {
  const res = await fetch(`${API_BASE}/progress/review`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load review queue');
  return res.json();
}

// ==================== PUBLIC PROFILES ====================

export interface ProfileSettings {
  isPublic: boolean;
  handle: string;
  displayName: string;
  bio: string;
  showCertificates: boolean;
  showStats: boolean;
  showBadges: boolean;
  showProgress: boolean;
}

export interface PublicProfile {
  handle: string;
  displayName: string;
  bio: string;
  memberSince: string | null;
  avatar?: string;
  show: { certificates: boolean; stats: boolean; badges: boolean; progress: boolean };
  certificates?: {
    certificateUid: string; courseName: string; topicName: string; score: number;
    totalQuestions: number; percentage: number; issuedAt: string;
  }[];
  stats?: {
    xp: number; currentStreak: number; longestStreak: number; topicsSeen: number;
    modulesPassed: number; studyDays: number; studySecondsTotal: number;
  };
  badges?: { id: string; name: string; hint: string }[];
  courses?: { courseId: string; topicsSeen: number }[];
}

export async function fetchProfileSettings(): Promise<ProfileSettings> {
  return jsonOrThrow(await fetch(`${API_BASE}/profile/settings`, { headers: authHeaders() }), 'Failed to load profile settings');
}

export async function saveProfileSettings(data: Partial<ProfileSettings>): Promise<ProfileSettings> {
  return jsonOrThrow(await fetch(`${API_BASE}/profile/settings`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) }), 'Failed to save profile settings');
}

export async function checkHandleAvailable(handle: string, signal?: AbortSignal): Promise<{ handle: string; available: boolean; reason: string | null }> {
  return jsonOrThrow(
    await fetch(`${API_BASE}/profile/handle-available?handle=${encodeURIComponent(handle)}`, { headers: authHeaders(), signal }),
    'Could not check that handle'
  );
}

/** Public page data. Resolves to null for an unknown OR unpublished handle (the server cannot tell them apart). */
export async function fetchPublicProfile(handle: string): Promise<PublicProfile | null> {
  const res = await fetch(`${API_BASE}/profiles/${encodeURIComponent(handle)}`);
  if (res.status === 404) return null;
  if (res.status === 429) throw new Error('Too many requests in a short time. Please wait a minute and try again.');
  if (!res.ok) throw new Error('This profile could not be loaded right now. Please try again shortly.');
  return res.json();
}
