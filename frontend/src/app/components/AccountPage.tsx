import { useEffect, useMemo, useState } from 'react';
import { certificateVerifyUrl } from '../lib/siteUrl';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  LayoutDashboard, Bookmark as BookmarkIcon, Award, Trophy, UserCog, Download, Trash2,
  Flame, Zap, BookOpenCheck, Clock, Medal, Lock, StickyNote, Lightbulb,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { ProgressPanel } from './ProgressPanel';
import { ProfileSettingsCard } from './profile/ProfileSettingsCard';
import { PrivacyCard } from './profile/PrivacyCard';
import { SuggestionBox } from './profile/SuggestionBox';
import { slugify } from '../lib/slug';
import {
  Bookmark, Note, CertificateData, Leaderboard,
  fetchBookmarks, removeBookmark, fetchNotes, saveNote, fetchCertificates, fetchLeaderboard,
  updateProfile, changePassword, uploadAvatar, removeAvatar,
} from '../services/api';
import { Avatar } from './Avatar';
import { AvatarCropDialog } from './AvatarCropDialog';
import { avatarFileError } from '../lib/avatarImage';

type Tab = 'overview' | 'saved' | 'certificates' | 'leaderboard' | 'suggestions' | 'profile';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'saved', label: 'Bookmarks & Notes', icon: <BookmarkIcon className="w-4 h-4" /> },
  { id: 'certificates', label: 'Certificates', icon: <Award className="w-4 h-4" /> },
  { id: 'leaderboard', label: 'Leaderboard & Badges', icon: <Trophy className="w-4 h-4" /> },
  { id: 'suggestions', label: 'Suggestion Box', icon: <Lightbulb className="w-4 h-4" /> },
  { id: 'profile', label: 'Profile', icon: <UserCog className="w-4 h-4" /> },
];

const pretty = (id: string) => id.replace(/[-_]/g, ' ');
const topicUrl = (b: { courseId: string; moduleId: string; topicId: string }) =>
  `/course/${slugify(b.courseId)}/${slugify(b.moduleId)}/${slugify(b.topicId)}`;

const card = 'rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/50 p-5';
const input =
  'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500';

// ---------- Badges (derived from data the server already computes) ----------

interface BadgeDef { id: string; name: string; hint: string; icon: React.ReactNode; earned: boolean }

function buildBadges(s: { topicsSeen: number; longestStreak: number; modulesPassed: number; studySecondsTotal: number }, certs: number): BadgeDef[] {
  const ic = 'w-6 h-6';
  return [
    { id: 'first', name: 'First Steps', hint: 'Open your first topic', icon: <BookOpenCheck className={ic} />, earned: s.topicsSeen >= 1 },
    { id: 'explorer', name: 'Explorer', hint: 'Open 25 topics', icon: <BookOpenCheck className={ic} />, earned: s.topicsSeen >= 25 },
    { id: 'scholar', name: 'Scholar', hint: 'Open 100 topics', icon: <BookOpenCheck className={ic} />, earned: s.topicsSeen >= 100 },
    { id: 'streak3', name: 'On Fire', hint: '3-day streak', icon: <Flame className={ic} />, earned: s.longestStreak >= 3 },
    { id: 'streak7', name: 'Week Warrior', hint: '7-day streak', icon: <Flame className={ic} />, earned: s.longestStreak >= 7 },
    { id: 'streak30', name: 'Unstoppable', hint: '30-day streak', icon: <Flame className={ic} />, earned: s.longestStreak >= 30 },
    { id: 'quiz1', name: 'Quiz Passer', hint: 'Pass your first module test', icon: <Zap className={ic} />, earned: s.modulesPassed >= 1 },
    { id: 'quiz5', name: 'Quiz Master', hint: 'Pass 5 module tests', icon: <Zap className={ic} />, earned: s.modulesPassed >= 5 },
    { id: 'cert', name: 'Certified', hint: 'Earn a certificate', icon: <Award className={ic} />, earned: certs >= 1 },
    { id: 'focus', name: 'Deep Focus', hint: 'Study for 1 hour in total', icon: <Clock className={ic} />, earned: s.studySecondsTotal >= 3600 },
  ];
}

// ---------- Tabs ----------

function Overview() {
  const { summary } = useProgress();
  const navigate = useNavigate();
  const courses = useMemo(
    () => Object.entries(summary?.byCourse ?? {}).sort((a, b) => b[1] - a[1]),
    [summary]
  );
  const maxCourse = Math.max(1, ...courses.map(([, n]) => n));
  return (
    <div className="space-y-5">
      <ProgressPanel />
      <div className={card}>
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Topics opened by course</h3>
        {courses.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-300">Nothing yet. Open any course to start tracking.</p>
        ) : (
          <ul className="space-y-2">
            {courses.map(([courseId, n]) => (
              <li key={courseId}>
                <button onClick={() => navigate(`/course/${slugify(courseId)}`)} className="w-full text-left group">
                  <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300 capitalize">
                    <span className="group-hover:text-orange-600">{pretty(courseId)}</span>
                    <span className="tabular-nums text-gray-500">{n}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 mt-1 overflow-hidden">
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-500" style={{ width: `${(n / maxCourse) * 100}%` }} />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Saved() {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<Bookmark[] | null>(null);
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([fetchBookmarks(), fetchNotes()])
      .then(([b, n]) => { setBookmarks(b); setNotes(n); })
      .catch(() => setError(true));
  }, []);

  if (error) return <p className="text-sm text-gray-600 dark:text-gray-300">Could not load your saved items. Is the server running?</p>;
  if (!bookmarks || !notes) return <p className="text-sm text-gray-600 dark:text-gray-300">Loading…</p>;

  const dropBookmark = async (b: Bookmark) => {
    setBookmarks(list => list && list.filter(x => !(x.courseId === b.courseId && x.topicId === b.topicId)));
    try { await removeBookmark(b); } catch { toast.error('Could not remove bookmark'); }
  };
  const dropNote = async (n: Note) => {
    setNotes(list => list && list.filter(x => !(x.courseId === n.courseId && x.topicId === n.topicId)));
    try { await saveNote({ ...n, body: '' }); } catch { toast.error('Could not delete note'); }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className={card}>
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
          <BookmarkIcon className="w-4 h-4 text-orange-600" /> Bookmarks ({bookmarks.length})
        </h3>
        {bookmarks.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-300">Tap the bookmark icon on any topic to save it here.</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {bookmarks.map(b => (
              <li key={b.courseId + b.topicId} className="flex items-center gap-2 py-2">
                <button onClick={() => navigate(topicUrl(b))} className="flex-1 min-w-0 text-left">
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate hover:text-orange-600">{b.topicName}</div>
                  <div className="text-xs text-gray-500 capitalize truncate">{pretty(b.courseId)}</div>
                </button>
                <button onClick={() => dropBookmark(b)} aria-label="Remove bookmark" className="p-1.5 text-gray-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={card}>
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-orange-600" /> Notes ({notes.length})
        </h3>
        {notes.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-300">Use the note icon on any topic to jot something down.</p>
        ) : (
          <ul className="space-y-3">
            {notes.map(n => (
              <li key={n.courseId + n.topicId} className="rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                <div className="flex items-start gap-2">
                  <button onClick={() => navigate(topicUrl(n))} className="flex-1 min-w-0 text-left text-sm font-semibold text-gray-800 dark:text-gray-100 truncate hover:text-orange-600">
                    {n.topicName}
                  </button>
                  <button onClick={() => dropNote(n)} aria-label="Delete note" className="text-gray-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-wrap break-words line-clamp-5">{n.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

async function downloadCertificate(c: CertificateData) {
  // Same design (and QR code) as the certificate shown after a test
  const { downloadCertificatePdf } = await import('../lib/certificate/pdf');
  await downloadCertificatePdf({
    studentName: c.studentName,
    moduleName: c.topicName,
    courseName: c.courseName,
    score: c.score,
    totalQuestions: c.totalQuestions,
    issuedAt: new Date(c.issuedAt),
    certificateUid: c.certificateUid,
    verifyUrl: certificateVerifyUrl(c.certificateUid),
  });
}

function Certificates() {
  const [certs, setCerts] = useState<CertificateData[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchCertificates().then(setCerts).catch(() => setError(true));
  }, []);

  if (error) return <p className="text-sm text-gray-600 dark:text-gray-300">Could not load certificates. Is the server running?</p>;
  if (!certs) return <p className="text-sm text-gray-600 dark:text-gray-300">Loading…</p>;
  if (certs.length === 0) {
    return <div className={card}><p className="text-sm text-gray-600 dark:text-gray-300">No certificates yet. Pass a topic assessment (70% or more) to earn one.</p></div>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {certs.map(c => (
        <div key={c.id} className={`${card} flex flex-col`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white grid place-items-center mb-3">
            <Award className="w-5 h-5" />
          </div>
          <div className="font-semibold text-gray-800 dark:text-gray-100">{c.topicName}</div>
          <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">{c.courseName}</div>
          <div className="text-sm text-gray-700 dark:text-gray-300 tabular-nums">
            Score {c.score}/{c.totalQuestions} ({Math.round((c.score / c.totalQuestions) * 100)}%)
          </div>
          <div className="text-xs text-gray-500 mb-4">
            {new Date(c.issuedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} · {c.certificateUid}
          </div>
          <button
            onClick={() => downloadCertificate(c).catch(() => toast.error('Could not create PDF'))}
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold py-2"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      ))}
    </div>
  );
}

function LeaderboardTab() {
  const { summary } = useProgress();
  const [board, setBoard] = useState<Leaderboard | null>(null);
  const [certCount, setCertCount] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchLeaderboard().then(setBoard).catch(() => setError(true));
    fetchCertificates().then(c => setCertCount(c.length)).catch(() => {});
  }, []);

  const badges = summary ? buildBadges(summary, certCount) : [];
  const earned = badges.filter(b => b.earned).length;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className={card}>
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-orange-600" /> Leaderboard
        </h3>
        {board?.me && (
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
            You are #{board.me.rank} of {board.total} with {board.me.xp.toLocaleString()} XP
          </p>
        )}
        {error ? <p className="text-sm text-gray-600 dark:text-gray-300">Could not load the leaderboard.</p>
          : !board ? <p className="text-sm text-gray-600 dark:text-gray-300">Loading…</p>
          : board.top.length === 0 ? <p className="text-sm text-gray-600 dark:text-gray-300">No one has earned XP yet. Be the first!</p>
          : (
            <ol className="space-y-1.5">
              {board.top.map(r => (
                <li
                  key={r.rank}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${r.isMe ? 'bg-orange-50 dark:bg-orange-950/30 ring-1 ring-orange-300 dark:ring-orange-800' : 'bg-gray-50 dark:bg-gray-800/50'}`}
                >
                  <span className={`w-6 text-center font-bold tabular-nums ${r.rank <= 3 ? 'text-orange-600' : 'text-gray-500'}`}>
                    {r.rank <= 3 ? <Medal className="w-5 h-5 inline" /> : r.rank}
                  </span>
                  <span className="flex-1 truncate text-gray-800 dark:text-gray-100">{r.name}{r.isMe && ' (you)'}</span>
                  <span className="tabular-nums font-semibold text-gray-700 dark:text-gray-200">{r.xp.toLocaleString()} XP</span>
                </li>
              ))}
            </ol>
          )}
      </section>

      <section className={card}>
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
          <Medal className="w-4 h-4 text-orange-600" /> Badges ({earned}/{badges.length})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {badges.map(b => (
            <div
              key={b.id}
              title={b.hint}
              className={`rounded-xl border p-3 text-center ${b.earned
                ? 'border-orange-300 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300'
                : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'}`}
            >
              <div className="mx-auto mb-1 w-fit">{b.earned ? b.icon : <Lock className="w-6 h-6" />}</div>
              <div className="text-xs font-semibold">{b.name}</div>
              <div className="text-[10px] opacity-80">{b.hint}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ProfileTab() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.fullName ?? '',
    gender: user?.gender ?? '',
    dob: user?.dob ?? '',
    organization: user?.organization ?? '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [savingPw, setSavingPw] = useState(false);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile(form);
      await refreshUser();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPw(true);
    try {
      await changePassword(pw);
      setPw({ currentPassword: '', newPassword: '' });
      toast.success('Password changed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not change password');
    } finally {
      setSavingPw(false);
    }
  };

  const [photoBusy, setPhotoBusy] = useState(false);
  const [pickedPhoto, setPickedPhoto] = useState<File | null>(null);
  const pickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // lets the same file be picked again after a failure
    if (!file) return;
    const problem = avatarFileError(file);
    if (problem) { toast.error(problem); return; }
    setPickedPhoto(file);
  };
  const savePhoto = async (dataUrl: string) => {
    setPhotoBusy(true);
    try {
      await uploadAvatar(dataUrl);
      await refreshUser();
      setPickedPhoto(null);
      toast.success('Photo updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update your photo');
    } finally {
      setPhotoBusy(false);
    }
  };
  const deletePhoto = async () => {
    setPhotoBusy(true);
    try {
      await removeAvatar();
      await refreshUser();
      toast.success('Photo removed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not remove your photo');
    } finally {
      setPhotoBusy(false);
    }
  };

  const label = 'block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1';

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form onSubmit={saveProfile} className={`${card} space-y-3`}>
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Your details</h3>
        <div className="flex items-center gap-4">
          <Avatar src={user?.avatar} name={user?.fullName ?? ''} className="w-20 h-20 text-3xl" fallbackClassName="bg-gradient-to-br from-orange-500 to-amber-500 text-white" />
          <div className="space-y-1.5">
            <div className="flex flex-wrap gap-2">
              <label className={`inline-flex cursor-pointer items-center rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm font-medium text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 focus-within:ring-2 focus-within:ring-orange-500 ${photoBusy ? 'opacity-60 pointer-events-none' : ''}`}>
                {photoBusy ? 'Working…' : user?.avatar ? 'Change photo' : 'Add photo'}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={pickPhoto} disabled={photoBusy} />
              </label>
              {user?.avatar && (
                <button type="button" onClick={deletePhoto} disabled={photoBusy} className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-60">
                  Remove
                </button>
              )}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300">JPG, PNG or WebP. Shown on your public profile if you publish one.</p>
          </div>
        </div>
        <div>
          <label className={label} htmlFor="pf-name">Full name</label>
          <input id="pf-name" className={input} value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required minLength={2} maxLength={100} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label} htmlFor="pf-gender">Gender</label>
            <select id="pf-gender" className={input} value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
              <option value="">Prefer not to say</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className={label} htmlFor="pf-dob">Date of birth</label>
            <input id="pf-dob" type="date" className={input} value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} />
          </div>
        </div>
        <div>
          <label className={label} htmlFor="pf-org">College / company</label>
          <input id="pf-org" className={input} value={form.organization} onChange={e => setForm({ ...form, organization: e.target.value })} maxLength={150} />
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-300">
          {user?.email || user?.mobile} (sign-in id, cannot be changed here)
        </div>
        <button disabled={savingProfile} className="rounded-lg bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2">
          {savingProfile ? 'Saving…' : 'Save changes'}
        </button>
      </form>

      <form onSubmit={savePassword} className={`${card} space-y-3 self-start`}>
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Change password</h3>
        <div>
          <label className={label} htmlFor="pf-cur">Current password</label>
          <input id="pf-cur" type="password" autoComplete="current-password" className={input} value={pw.currentPassword} onChange={e => setPw({ ...pw, currentPassword: e.target.value })} required />
        </div>
        <div>
          <label className={label} htmlFor="pf-new">New password (min 8 characters)</label>
          <input id="pf-new" type="password" autoComplete="new-password" className={input} value={pw.newPassword} onChange={e => setPw({ ...pw, newPassword: e.target.value })} required minLength={8} />
        </div>
        <button disabled={savingPw} className="rounded-lg bg-gray-800 hover:bg-gray-900 dark:bg-gray-100 dark:hover:bg-white dark:text-gray-900 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2">
          {savingPw ? 'Updating…' : 'Update password'}
        </button>
      </form>

      <ProfileSettingsCard />

      <PrivacyCard />

      <AvatarCropDialog file={pickedPhoto} busy={photoBusy} onCancel={() => setPickedPhoto(null)} onConfirm={savePhoto} />
    </div>
  );
}

// ---------- Page ----------

export function AccountPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');

  return (
    <main id="main-content" className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-5 flex items-center gap-3">
          <Avatar src={user?.avatar} name={user?.fullName ?? ''} className="w-12 h-12 text-xl" fallbackClassName="bg-gradient-to-br from-orange-500 to-amber-500 text-white" />
          <div className="min-w-0">
            <h1 className="font-display text-xl font-bold text-gray-800 dark:text-gray-100 truncate">{user?.fullName}</h1>
            <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{user?.email || user?.mobile}</p>
          </div>
        </motion.div>

        <div role="tablist" aria-label="Account sections" className="flex gap-1 overflow-x-auto mb-5 pb-1">
          {TABS.map(t => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              tabIndex={tab === t.id ? 0 : -1}
              onKeyDown={e => {
                const i = TABS.findIndex(x => x.id === t.id);
                const next = e.key === 'ArrowRight' ? (i + 1) % TABS.length : e.key === 'ArrowLeft' ? (i - 1 + TABS.length) % TABS.length : -1;
                if (next < 0) return;
                e.preventDefault();
                setTab(TABS[next].id);
                (e.currentTarget.parentElement?.children[next] as HTMLElement | undefined)?.focus();
              }}
              onClick={() => setTab(t.id)}
              className={`flex-none inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 ${tab === t.id
                ? 'bg-orange-600 text-white shadow'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-700'}`}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && <Overview />}
        {tab === 'saved' && <Saved />}
        {tab === 'certificates' && <Certificates />}
        {tab === 'leaderboard' && <LeaderboardTab />}
        {tab === 'suggestions' && <SuggestionBox />}
        {tab === 'profile' && <ProfileTab />}
      </div>
    </main>
  );
}
