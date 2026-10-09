// Points at the local API by default so `npm run dev` works with no config.
// Set VITE_API_BASE_URL at build time to target a deployed backend.
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api';

function getToken(): string | null {
  return localStorage.getItem('jsl_token');
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

export async function fetchCurrentUser(): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/me`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Not authenticated');
  return res.json();
}

// Certificates
export async function issueCertificate(data: { courseName: string; topicName: string; score: number; totalQuestions: number }): Promise<CertificateData> {
  const res = await fetch(`${API_BASE}/certificates`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
  if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
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
  topicsSeen: number;
  modulesPassed: number;
  studySecondsToday: number;
  studySecondsTotal: number;
  /** Most recent 60 studied days, newest first, as YYYY-MM-DD. */
  studiedDates: string[];
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
  await fetch(`${API_BASE}/progress/topic`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
}

export async function importProgress(topics: VisitedTopic[]): Promise<{ imported: number }> {
  const res = await fetch(`${API_BASE}/progress/import`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ topics }) });
  if (!res.ok) throw new Error('Failed to import progress');
  return res.json();
}

export async function recordStudySeconds(seconds: number): Promise<void> {
  await fetch(`${API_BASE}/progress/study`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ seconds }) });
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
