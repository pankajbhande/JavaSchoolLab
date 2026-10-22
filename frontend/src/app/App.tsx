
import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, useSearchParams, useLocation, Navigate } from 'react-router-dom';
import { trackPageView } from './services/analytics';
import { AchievementWatcher } from './components/AchievementWatcher';
import { ConsentBanner } from './components/ConsentBanner';
import { ErrorBoundary } from './components/study/ErrorBoundary';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ThemeProvider, useTheme } from './components/ThemeProvider';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProgressProvider } from './context/ProgressContext';
import { LoginModal } from './components/LoginModal';
import { AccountPage } from './components/AccountPage';
import { Toaster } from './components/ui/sonner';
import { slugify } from './lib/slug';
import { useDocumentMeta } from './hooks/useDocumentMeta';
import { TOTAL_TOPICS } from './data/courseStats';

// The workspace statically imports every course, so it is loaded on demand. Visitors
// landing on /dashboard never download it; clicking into a course fetches it once.
const loadCourseWorkspace = () => import('./CourseWorkspace');
const CourseWorkspace = lazy(loadCourseWorkspace);
// Public page the QR code on a certificate opens
const VerifyCertificate = lazy(() => import('./components/VerifyCertificate'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const FlashcardsPage = lazy(() => import('./pages/FlashcardsPage'));
const InterviewPracticePage = lazy(() => import('./pages/InterviewPracticePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/AdminAnalyticsPage'));
const AdminSuggestionsPage = lazy(() => import('./pages/AdminSuggestionsPage'));
const AchievementsPage = lazy(() => import('./pages/AchievementsPage'));

// Starts the same dynamic import ahead of the click. The browser and the module cache
// dedupe it, so the later lazy() resolves instantly instead of the student waiting on a
// multi-MB download. Safe to call repeatedly; failures are ignored (the real navigation
// retries and surfaces any error as before).
let workspacePrefetched = false;
function prefetchCourseWorkspace() {
  if (workspacePrefetched) return;
  workspacePrefetched = true;
  loadCourseWorkspace().catch(() => { workspacePrefetched = false; });
}

// Some topic ids across the course data are raw display names ("Control Statements in Java")
// rather than clean slugs ("arraylist") — this turns any id into a URL-safe segment
// (spaces -> underscores) purely for the address bar, without touching the underlying id
// used everywhere else in the app (state, visitedTopics, data lookups).

// Renders the toast container themed to match the app's own light/dark mode
function AppToaster() {
  const { theme } = useTheme();
  // Bottom-centre so a message never sits on top of the header's search, clock and tabs.
  return (
    <Toaster
      theme={theme}
      position="bottom-center"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: 'rounded-xl! shadow-xl! text-sm! gap-3!',
          title: 'font-semibold!',
          description: 'opacity-80!',
          actionButton: 'bg-orange-600! text-white! rounded-lg! font-semibold! px-3!',
        },
      }}
    />
  );
}

// Skeleton splash shown only while the initial auth check (token verification) is in flight,
// so the header never flashes "Login" before flipping to the logged-in state.
function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  if (!loading) return <>{children}</>;

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <div className="h-[76px] bg-gradient-to-r from-orange-600 to-amber-500 flex items-center px-6 gap-4">
        <div className="w-12 h-12 rounded-full bg-white/20 animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-40 rounded bg-white/20 animate-pulse" />
          <div className="h-3 w-56 rounded bg-white/10 animate-pulse" />
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-300 border-t-orange-600 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading JavaSchoolLab…</p>
        </div>
      </div>
    </div>
  );
}

// Login page component
function LoginPage() {
  const { isLoggedIn, isGuest } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn || isGuest) navigate('/dashboard', { replace: true });
  }, [isLoggedIn, isGuest]);

  return <LoginModal onClose={() => navigate('/dashboard')} />;
}

// Signup page component
function SignupPage() {
  const { isLoggedIn, isGuest } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn || isGuest) navigate('/dashboard', { replace: true });
  }, [isLoggedIn, isGuest]);

  return <LoginModal onClose={() => navigate('/dashboard')} />;
}

// The landing page. Deliberately does NOT render the course workspace, so none of the
// course content is pulled into the initial download. Search and Robo Guru are inert
// here exactly as before, since neither has a topic or a visible list to act on.
function DashboardPage() {
  const navigate = useNavigate();
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('female');
  const [search, setSearch] = useState('');

  useDocumentMeta({
    title: 'Learn Java, Spring Boot, React and more',
    description: `Free courses covering ${TOTAL_TOPICS} topics across Java, Spring Boot, React, databases and system design, with worked examples, diagrams and interview questions.`,
    path: '/dashboard',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'JavaSchoolLab',
      description: 'Java and full-stack engineering courses.',
      parentOrganization: { '@type': 'Organization', name: 'DHIPAN Software Technologies Private Limited' },
    },
  });

  // Warm the course bundle once the dashboard has painted and the browser is idle, so the
  // first "Start Learning" click does not wait for it. Skipped on data-saver connections.
  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(prefetchCourseWorkspace, { timeout: 3000 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(prefetchCourseWorkspace, 1500);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <Header
        onToggleSpeech={() => {}}
        isSpeaking={false}
        onSearch={setSearch}
        showSearch={false}
        voiceGender={voiceGender}
        onVoiceChange={setVoiceGender}
      />
      <main
        id="main-content"
        className="flex flex-1 min-w-0 overflow-hidden"
        onPointerOver={prefetchCourseWorkspace}
        onTouchStart={prefetchCourseWorkspace}
        onFocus={prefetchCourseWorkspace}
      >
        <Dashboard
          searchQuery={search}
          onCourseSelect={(courseId) => navigate(`/course/${slugify(courseId)}`)}
        />
      </main>
    </div>
  );
}

// Signed-in home for bookmarks, notes, certificates, leaderboard and profile. Guests are
// sent back to the dashboard; the auth check has already finished by the time this renders.
function AccountRoute() {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/dashboard" replace />;
  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <Header
        onToggleSpeech={() => {}}
        isSpeaking={false}
        onSearch={() => {}}
        showSearch={false}
        voiceGender="female"
        onVoiceChange={() => {}}
      />
      <AccountPage />
    </div>
  );
}

function WorkspaceFallback() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-orange-300 border-t-orange-600 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading course…</p>
      </div>
    </div>
  );
}

function CoursePage() {
  return (
    <Suspense fallback={<WorkspaceFallback />}>
      <CourseWorkspace />
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ProgressProvider>
          <AppToaster />
          <AchievementWatcher />
          <ConsentBanner />
          <AuthGate>
            <AppRoutes />
          </AuthGate>
          </ProgressProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

// Routes inside an error boundary: a render crash shows a friendly screen, never a blank page.
// The boundary resets when the path changes so navigating away recovers.
function AppRoutes() {
  const { pathname } = useLocation();
  // One anonymous page view per route change (the admin page itself is not counted).
  useEffect(() => { if (!pathname.startsWith('/admin')) trackPageView(pathname); }, [pathname]);
  return (
    <ErrorBoundary resetKey={pathname}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/flashcards" element={<Suspense fallback={<WorkspaceFallback />}><FlashcardsPage /></Suspense>} />
              <Route path="/flashcards/:courseId" element={<Suspense fallback={<WorkspaceFallback />}><FlashcardsPage /></Suspense>} />
              <Route path="/interview-practice" element={<Suspense fallback={<WorkspaceFallback />}><InterviewPracticePage /></Suspense>} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/account" element={<AccountRoute />} />
              <Route path="/achievements" element={<Suspense fallback={<WorkspaceFallback />}><AchievementsPage /></Suspense>} />
              <Route path="/admin" element={<Suspense fallback={<WorkspaceFallback />}><AdminAnalyticsPage /></Suspense>} />
              <Route path="/admin/suggestions" element={<Suspense fallback={<WorkspaceFallback />}><AdminSuggestionsPage /></Suspense>} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/privacy" element={<Suspense fallback={<WorkspaceFallback />}><LegalPage kind="privacy" /></Suspense>} />
              <Route path="/terms" element={<Suspense fallback={<WorkspaceFallback />}><LegalPage kind="terms" /></Suspense>} />
              <Route path="/verify" element={<Suspense fallback={<WorkspaceFallback />}><VerifyCertificate /></Suspense>} />
              <Route path="/verify/:uid" element={<Suspense fallback={<WorkspaceFallback />}><VerifyCertificate /></Suspense>} />
              <Route path="/u/:handle" element={<Suspense fallback={<WorkspaceFallback />}><ProfilePage /></Suspense>} />
              <Route path="/course" element={<Navigate to="/dashboard" replace />} />
              <Route path="/course/:courseId" element={<CoursePage />} />
              <Route path="/course/:courseId/:topicId" element={<CoursePage />} />
              <Route path="/course/:courseId/:subTopicId/:topicId" element={<CoursePage />} />
              <Route path="*" element={<Suspense fallback={<WorkspaceFallback />}><NotFoundPage /></Suspense>} />
            </Routes>
    </ErrorBoundary>
  );
}
