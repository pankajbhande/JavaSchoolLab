import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Award, BadgeCheck, BookOpenCheck, Clock, Flame, Zap, Medal, ShieldOff, TriangleAlert } from 'lucide-react';
import { PageShell, btnPrimary, card } from '../components/study/PageShell';
import { ShareProfile } from '../components/profile/ShareProfile';
import { fetchPublicProfile, type PublicProfile } from '../services/api';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { courseStats } from '../data/courseStats';
import { courseIndex } from '../data/courseIndex';
import { levelFromXp } from '../lib/xp';
import { siteUrl } from '../lib/siteUrl';
import { profileUrl } from '../lib/profileHandle';

type State =
  | { kind: 'loading' }
  | { kind: 'ok'; profile: PublicProfile }
  | { kind: 'missing' }
  | { kind: 'error'; message: string };

const monthYear = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : '';
const dayMonthYear = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const initials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '?') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
};
const courseName = (id: string) => courseIndex.find(c => c.id === id)?.name ?? id.replace(/[-_]/g, ' ');
const hours = (s: number) => (s >= 3600 ? `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m` : `${Math.floor(s / 60)}m`);

const BADGE_ICON: Record<string, typeof Award> = {
  first: BookOpenCheck, explorer: BookOpenCheck, scholar: BookOpenCheck,
  streak3: Flame, streak7: Flame, streak30: Flame, quiz1: Zap, quiz5: Zap, cert: Award, focus: Clock,
};

function Skeleton() {
  return (
    <div className="space-y-5 animate-pulse" aria-busy="true" aria-label="Loading profile">
      <div className={`${card} p-6 flex gap-4 items-center`}>
        <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-48 max-w-full rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-64 max-w-full rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1].map(i => <div key={i} className={`${card} h-32`} />)}
      </div>
    </div>
  );
}

function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-3 text-lg font-bold text-gray-800 dark:text-gray-100">
        {title}{count !== undefined && <span className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">{count}</span>}
      </h2>
      {children}
    </section>
  );
}

export default function ProfilePage() {
  const { handle = '' } = useParams();
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setState({ kind: 'loading' });
    fetchPublicProfile(handle.toLowerCase())
      .then(p => { if (!cancelled) setState(p ? { kind: 'ok', profile: p } : { kind: 'missing' }); })
      .catch(e => { if (!cancelled) setState({ kind: 'error', message: e instanceof Error ? e.message : 'Could not load this profile.' }); });
    return () => { cancelled = true; };
  }, [handle]);

  const profile = state.kind === 'ok' ? state.profile : null;
  useDocumentMeta({
    title: profile ? `${profile.displayName} (@${profile.handle})` : state.kind === 'missing' ? 'Profile not found' : 'Learner profile',
    description: profile
      ? (profile.bio || `${profile.displayName}'s learning profile on JavaSchoolLab.`).slice(0, 155)
      : 'A learner profile on JavaSchoolLab.',
    path: `/u/${handle.toLowerCase()}`,
  });

  // Decision: noindex. Profiles are opt-in for sharing with people, not for search; a search-engine copy
  // would outlive an unpublish and defeat "the page disappears immediately".
  useEffect(() => {
    const tag = document.createElement('meta');
    tag.name = 'robots';
    tag.content = 'noindex, nofollow';
    document.head.appendChild(tag);
    return () => { tag.remove(); };
  }, []);

  const url = profileUrl(siteUrl(), handle.toLowerCase());
  const level = useMemo(() => (profile?.stats ? levelFromXp(profile.stats.xp) : null), [profile]);

  return (
    <PageShell title={profile ? profile.displayName : 'Learner profile'} subtitle={profile ? `@${profile.handle}` : undefined} wide>
      <div role="status" aria-live="polite">
        {state.kind === 'loading' && <Skeleton />}

        {state.kind === 'missing' && (
          <div className={`${card} mx-auto max-w-xl p-8 text-center`}>
            <ShieldOff className="mx-auto h-12 w-12 text-gray-400" aria-hidden />
            <h2 className="mt-3 text-2xl font-bold">Profile not found</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              There is no public profile at this address. It may not exist, or its owner has made it private.
            </p>
            <Link to="/dashboard" className={`${btnPrimary} mt-5`}>Explore JavaSchoolLab</Link>
          </div>
        )}

        {state.kind === 'error' && (
          <div className="mx-auto max-w-xl rounded-2xl border border-amber-300 bg-amber-50 p-6 text-center dark:border-amber-800 dark:bg-amber-950/30">
            <TriangleAlert className="mx-auto h-10 w-10 text-amber-600" aria-hidden />
            <h2 className="mt-2 text-lg font-bold text-amber-900 dark:text-amber-200">We could not load this profile</h2>
            <p className="mt-1 text-sm text-amber-900/80 dark:text-amber-100/80">{state.message}</p>
          </div>
        )}
      </div>

      {profile && (
        <>
          <div className={`${card} overflow-hidden`}>
            <div className="h-16 bg-gradient-to-r from-orange-600 to-amber-500 sm:h-20" aria-hidden />
            <div className="px-5 pb-5 sm:px-6">
              <div className="-mt-10 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-start">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt=""
                    className="h-20 w-20 shrink-0 rounded-full object-cover ring-4 ring-white dark:ring-gray-800 sm:h-24 sm:w-24"
                  />
                ) : (
                  <div
                    aria-hidden
                    className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-2xl font-bold text-white ring-4 ring-white dark:ring-gray-800 sm:h-24 sm:w-24 sm:text-3xl"
                  >
                    {initials(profile.displayName)}
                  </div>
                )}
                <div className="min-w-0 flex-1 sm:mt-14">
                  <h1 className="break-words text-2xl font-extrabold leading-tight">{profile.displayName}</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    @{profile.handle}{profile.memberSince && <> · Member since {monthYear(profile.memberSince)}</>}
                  </p>
                </div>
              </div>

              {profile.bio && <p className="mt-4 max-w-2xl whitespace-pre-wrap break-words text-gray-700 dark:text-gray-200">{profile.bio}</p>}

              {profile.stats && level && (
                <ul className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
                  <li className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-orange-800 dark:bg-orange-950/50 dark:text-orange-200">
                    <Flame className="h-4 w-4" aria-hidden /> {profile.stats.currentStreak}-day streak
                  </li>
                  <li className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                    <Medal className="h-4 w-4" aria-hidden /> Level {level.level}
                  </li>
                  <li className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                    <Zap className="h-4 w-4" aria-hidden /> {profile.stats.xp.toLocaleString()} XP
                  </li>
                </ul>
              )}

              <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
                <ShareProfile url={url} name={profile.displayName} />
              </div>
            </div>
          </div>

          {profile.stats && (
            <Section title="Study stats">
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ['Longest streak', `${profile.stats.longestStreak} ${profile.stats.longestStreak === 1 ? 'day' : 'days'}`],
                  ['Topics opened', profile.stats.topicsSeen.toLocaleString()],
                  ['Modules passed', profile.stats.modulesPassed.toLocaleString()],
                  ['Time studied', hours(profile.stats.studySecondsTotal)],
                ].map(([k, v]) => (
                  <div key={k} className={`${card} p-4`}>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{k}</dt>
                    <dd className="mt-1 text-xl font-bold tabular-nums">{v}</dd>
                  </div>
                ))}
              </dl>
            </Section>
          )}

          {profile.certificates && (
            <Section title="Certificates" count={profile.certificates.length}>
              {profile.certificates.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-300">No certificates earned yet.</p>
              ) : (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {profile.certificates.map(c => (
                    <li key={c.certificateUid} className={`${card} flex flex-col overflow-hidden`}>
                      <div className="h-1.5 bg-gradient-to-r from-orange-600 to-amber-500" aria-hidden />
                      <div className="flex flex-1 flex-col p-4">
                        <div className="mb-2 grid h-9 w-9 place-items-center rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300">
                          <Award className="h-5 w-5" aria-hidden />
                        </div>
                        <h3 className="break-words font-semibold">{c.topicName}</h3>
                        <p className="break-words text-xs text-gray-600 dark:text-gray-300">{c.courseName}</p>
                        <p className="mt-2 text-sm tabular-nums">Score {c.score}/{c.totalQuestions} ({c.percentage}%)</p>
                        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">{dayMonthYear(c.issuedAt)}</p>
                        <Link
                          to={`/verify/${encodeURIComponent(c.certificateUid)}`}
                          className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-300 px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
                        >
                          <BadgeCheck className="h-4 w-4" aria-hidden /> Verify
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          )}

          {profile.badges && (
            <Section title="Badges" count={profile.badges.length}>
              {profile.badges.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-300">No badges earned yet.</p>
              ) : (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {profile.badges.map(b => {
                    const Icon = BADGE_ICON[b.id] ?? Award;
                    return (
                      <li key={b.id} className="rounded-xl border border-orange-300 bg-orange-50 p-3 text-center text-orange-700 dark:border-orange-800 dark:bg-orange-950/20 dark:text-orange-300">
                        <Icon className="mx-auto mb-1 h-6 w-6" aria-hidden />
                        <div className="text-sm font-semibold">{b.name}</div>
                        <div className="text-[11px] opacity-80">{b.hint}</div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Section>
          )}

          {profile.courses && (
            <Section title="Course progress">
              {profile.courses.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-300">No courses started yet.</p>
              ) : (
                <ul className={`${card} space-y-4 p-5`}>
                  {profile.courses.map(c => {
                    const total = courseStats[c.courseId]?.topics ?? 0;
                    const pct = total > 0 ? Math.min(100, Math.round((c.topicsSeen / total) * 100)) : 0;
                    return (
                      <li key={c.courseId}>
                        <div className="flex justify-between gap-3 text-sm">
                          <span className="min-w-0 break-words font-medium">{courseName(c.courseId)}</span>
                          <span className="shrink-0 tabular-nums text-gray-500 dark:text-gray-400">
                            {total > 0 ? `${c.topicsSeen}/${total} topics` : `${c.topicsSeen} topics`}
                          </span>
                        </div>
                        <div
                          className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
                          role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${courseName(c.courseId)} progress`}
                        >
                          <div className="h-2 rounded-full bg-gradient-to-r from-orange-600 to-amber-500" style={{ width: `${pct}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Section>
          )}

          <p className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
            This profile is shared by its owner and shows only what they chose to make public.{' '}
            <Link to="/dashboard" className="font-semibold text-orange-700 underline dark:text-orange-400">Learn with JavaSchoolLab</Link>
          </p>
        </>
      )}
    </PageShell>
  );
}
