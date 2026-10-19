import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, Users, UserPlus, Search, ClipboardCheck, Award, BookOpen, Activity, Share2 } from 'lucide-react';
import { API_BASE, getAuthToken } from '../services/api';

interface Day { date: string; pageViews: number; sessions: number; signups: number; quizAttempts: number; certificates: number; searches: number }
interface Dashboard {
  days: number;
  generatedAt: string;
  totals: { visitorCounter: number; users: number; certificates: number; quizAttempts: number; topicsStudied: number; pageViews: number; sessions: number; searches: number; signups: number; shares: number };
  funnel: { sessions: number; signups: number; quizTakers: number; certificateEarners: number; signupRatePercent: number };
  daily: Day[];
  topPages: { path: string; views: number }[];
  topSearches: { query: string; searches: number; avgResults: number }[];
  emptySearches: { query: string; searches: number; avgResults: number }[];
  topCourses: { courseId: string; learners: number; topics: number }[];
  topShared: { path: string; shares: number }[];
  shareChannels: { channel: string; shares: number }[];
}

const nf = new Intl.NumberFormat('en-IN');

function Kpi({ icon: Icon, label, value, hint }: { icon: typeof Eye; label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        <Icon className="w-4 h-4 text-orange-600 dark:text-orange-400" aria-hidden="true" /> {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{nf.format(value)}</div>
      {hint && <div className="text-xs text-gray-600 dark:text-gray-400">{hint}</div>}
    </div>
  );
}

function Bars({ days, pick, color, label }: { days: Day[]; pick: (d: Day) => number; color: string; label: string }) {
  const max = Math.max(1, ...days.map(pick));
  return (
    <figure>
      <figcaption className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">{label}</figcaption>
      <div className="flex items-end gap-[2px] h-28" role="img" aria-label={`${label} per day, highest ${max}`}>
        {days.map(d => (
          <div key={d.date} title={`${d.date}: ${pick(d)}`} className={`flex-1 min-w-[2px] rounded-t ${color}`} style={{ height: `${Math.max(2, (pick(d) / max) * 100)}%` }} />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-gray-500 dark:text-gray-400"><span>{days[0]?.date}</span><span>{days[days.length - 1]?.date}</span></div>
    </figure>
  );
}

function Table({ title, note, rows, empty }: { title: string; note?: string; rows: (string | number)[][]; empty: string }) {
  return (
    <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
      {note && <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{note}</p>}
      {rows.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400 py-3">{empty}</p> : (
        <table className="w-full text-sm mt-1">
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                <td className="py-1.5 pr-3 text-gray-800 dark:text-gray-200 break-all">{r[0]}</td>
                {r.slice(1).map((c, j) => <td key={j} className="py-1.5 pl-3 text-right tabular-nums text-gray-600 dark:text-gray-300">{typeof c === 'number' ? nf.format(c) : c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Dashboard | null>(null);
  const [state, setState] = useState<'loading' | 'ok' | 'login' | 'forbidden' | 'error'>('loading');

  useEffect(() => {
    document.title = 'Analytics · JavaSchoolLab';
    if (!getAuthToken()) { setState('login'); return; }
    let cancelled = false;
    setState('loading');
    fetch(`${API_BASE}/admin/analytics?days=${days}`, { headers: { Authorization: `Bearer ${getAuthToken()}` } })
      .then(async r => {
        if (cancelled) return;
        if (r.status === 401) return setState('login');
        if (r.status === 403) return setState('forbidden');
        if (!r.ok) return setState('error');
        setData(await r.json());
        setState('ok');
      })
      .catch(() => { if (!cancelled) setState('error'); });
    return () => { cancelled = true; };
  }, [days]);

  const funnel = useMemo(() => {
    if (!data) return [];
    const f = data.funnel;
    const top = Math.max(1, f.sessions);
    return [
      ['Visitors (sessions)', f.sessions], ['Signed up', f.signups], ['Took a quiz', f.quizTakers], ['Earned a certificate', f.certificateEarners],
    ].map(([label, n]) => ({ label: label as string, n: n as number, pct: Math.round(((n as number) / top) * 1000) / 10 }));
  }, [data]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="bg-gradient-to-r from-[#ff5500] to-[#ff9a0a] dark:from-orange-800 dark:to-amber-700 text-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Site analytics</h1>
            <p className="text-sm text-white/90">Visits, sign-ups, learning activity and what people search for</p>
          </div>
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 rounded-lg bg-white/20 hover:bg-white/30 px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to site
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {state === 'login' && <p className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">Please <Link className="text-orange-700 dark:text-orange-300 font-semibold underline" to="/login">sign in</Link> with the admin email to see the analytics.</p>}
        {state === 'forbidden' && <p className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">This page is only for the site admin. Your account is not on the admin list (<code>ADMIN_EMAILS</code>).</p>}
        {state === 'error' && <p className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">The analytics could not be loaded. Try again in a moment.</p>}
        {state === 'loading' && <p role="status" className="text-gray-600 dark:text-gray-400">Loading…</p>}

        {state === 'ok' && data && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div role="group" aria-label="Time range" className="inline-flex rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1">
                {[7, 30, 90].map(n => (
                  <button key={n} type="button" aria-pressed={days === n} onClick={() => setDays(n)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${days === n ? 'bg-orange-600 text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-gray-700'}`}>
                    Last {n} days
                  </button>
                ))}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Updated {new Date(data.generatedAt).toLocaleString('en-IN')}</span>
            </div>

            <section aria-label="Key numbers" className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Kpi icon={Eye} label="Visitor counter" value={data.totals.visitorCounter} hint="all time, shown on the site" />
              <Kpi icon={Activity} label="Page views" value={data.totals.pageViews} hint={`last ${data.days} days`} />
              <Kpi icon={Users} label="Sessions" value={data.totals.sessions} hint={`last ${data.days} days`} />
              <Kpi icon={UserPlus} label="Sign-ups" value={data.totals.signups} hint={`last ${data.days} days, ${nf.format(data.totals.users)} in total`} />
              <Kpi icon={Share2} label="Shares" value={data.totals.shares} hint={`last ${data.days} days`} />
              <Kpi icon={Search} label="Searches" value={data.totals.searches} hint={`last ${data.days} days`} />
              <Kpi icon={ClipboardCheck} label="Quiz attempts" value={data.totals.quizAttempts} hint="all time" />
              <Kpi icon={Award} label="Certificates" value={data.totals.certificates} hint="all time" />
              <Kpi icon={BookOpen} label="Topics studied" value={data.totals.topicsStudied} hint="all time, across learners" />
            </section>

            <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
              <h2 className="text-sm font-semibold">From visitor to certificate <span className="font-normal text-gray-600 dark:text-gray-400">(last {data.days} days; sign-up rate {data.funnel.signupRatePercent}%)</span></h2>
              <ol className="mt-3 space-y-2">
                {funnel.map(s => (
                  <li key={s.label}>
                    <div className="flex justify-between text-sm"><span>{s.label}</span><span className="tabular-nums text-gray-600 dark:text-gray-300">{nf.format(s.n)} <span className="text-gray-500">({s.pct}%)</span></span></div>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden"><div className="h-full bg-orange-500" style={{ width: `${Math.min(100, s.pct)}%` }} /></div>
                  </li>
                ))}
              </ol>
            </section>

            <section className="grid md:grid-cols-3 gap-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
              <Bars days={data.daily} pick={d => d.pageViews} color="bg-orange-500" label="Page views per day" />
              <Bars days={data.daily} pick={d => d.signups} color="bg-emerald-500" label="Sign-ups per day" />
              <Bars days={data.daily} pick={d => d.quizAttempts} color="bg-indigo-500" label="Quiz attempts per day" />
            </section>

            <div className="grid md:grid-cols-2 gap-4">
              <Table title="Most visited pages" rows={data.topPages.map(p => [p.path, p.views])} empty="No page views recorded yet." />
              <Table title="Most studied courses" note="Topics opened by signed-in learners" rows={data.topCourses.map(c => [c.courseId, c.topics, `${c.learners} learners`])} empty="No learning activity yet." />
              <Table title="Most shared topics" note="Topics people sent to friends" rows={data.topShared.map(s => [s.path, s.shares])} empty="Nothing shared yet." />
              <Table title="How people share" rows={data.shareChannels.map(c => [c.channel, c.shares])} empty="Nothing shared yet." />
              <Table title="What people search for" rows={data.topSearches.map(s => [s.query, s.searches, `~${s.avgResults} results`])} empty="No searches recorded yet." />
              <Table title="Searches that found nothing" note="Content gaps: lessons your visitors want and do not find" rows={data.emptySearches.map(s => [s.query, s.searches])} empty="Every search found something." />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
