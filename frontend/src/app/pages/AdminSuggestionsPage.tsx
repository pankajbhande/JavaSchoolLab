import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE, getAuthToken } from '../services/api';

interface Row { id: number; category: string; message: string; pagePath: string | null; status: Status; createdAt: string; userName: string; userEmail: string | null }
type Status = 'new' | 'seen' | 'done';
type Filter = 'all' | Status;

const CATEGORY: Record<string, string> = { idea: 'Idea', content: 'Lesson mistake', bug: 'Bug', other: 'Other' };
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'new', label: 'New' }, { id: 'seen', label: 'Seen' }, { id: 'done', label: 'Done' }, { id: 'all', label: 'All' },
];
const STATUSES: Status[] = ['new', 'seen', 'done'];

const headers = () => ({ Authorization: `Bearer ${getAuthToken()}`, 'Content-Type': 'application/json' });

/** The site admin's list of suggestions learners sent. Only the ADMIN_EMAILS accounts get past the server check. */
export default function AdminSuggestionsPage() {
  const [filter, setFilter] = useState<Filter>('new');
  const [rows, setRows] = useState<Row[]>([]);
  const [state, setState] = useState<'loading' | 'ok' | 'login' | 'forbidden' | 'error'>('loading');

  const load = useCallback(async (f: Filter) => {
    if (!getAuthToken()) { setState('login'); return; }
    setState('loading');
    try {
      const r = await fetch(`${API_BASE}/admin/suggestions${f === 'all' ? '' : `?status=${f}`}`, { headers: headers() });
      if (r.status === 401) return setState('login');
      if (r.status === 403) return setState('forbidden');
      if (!r.ok) return setState('error');
      setRows(await r.json());
      setState('ok');
    } catch {
      setState('error');
    }
  }, []);

  useEffect(() => {
    document.title = 'Suggestions · JavaSchoolLab';
    load(filter);
  }, [filter, load]);

  const setStatus = async (row: Row, status: Status) => {
    try {
      const r = await fetch(`${API_BASE}/admin/suggestions/${row.id}/status`, { method: 'PUT', headers: headers(), body: JSON.stringify({ status }) });
      if (!r.ok) throw new Error();
      // Under a status filter the row no longer belongs in the list once its status changes.
      setRows(prev => (filter === 'all' ? prev.map(x => (x.id === row.id ? { ...x, status } : x)) : prev.filter(x => x.id !== row.id)));
    } catch {
      toast.error('Could not change the status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="bg-gradient-to-r from-[#ff5500] to-[#ff9a0a] dark:from-orange-800 dark:to-amber-700 text-white">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Suggestions</h1>
            <p className="text-sm text-white/90">Ideas, lesson mistakes and bug reports from learners</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin" className="inline-flex items-center gap-1.5 rounded-lg bg-white/20 hover:bg-white/30 px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              <BarChart3 className="w-4 h-4" aria-hidden="true" /> Analytics
            </Link>
            <Link to="/dashboard" className="inline-flex items-center gap-1.5 rounded-lg bg-white/20 hover:bg-white/30 px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to site
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {state === 'login' && <p className="text-sm">Please <Link to="/dashboard" className="underline text-orange-700 dark:text-orange-300">sign in</Link> with an admin account to see suggestions.</p>}
        {state === 'forbidden' && <p className="text-sm">This page is only for the site admin.</p>}
        {state === 'error' && <p className="text-sm">Could not load the suggestions. <button type="button" onClick={() => load(filter)} className="underline text-orange-700 dark:text-orange-300">Try again</button></p>}

        {(state === 'ok' || state === 'loading') && (
          <>
            <div role="tablist" aria-label="Filter by status" className="mb-4 flex gap-1">
              {FILTERS.map(f => (
                <button key={f.id} role="tab" aria-selected={filter === f.id} onClick={() => setFilter(f.id)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium ${filter === f.id ? 'bg-orange-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-700'}`}>
                  {f.label}
                </button>
              ))}
            </div>

            {state === 'loading' ? <p className="text-sm text-gray-600 dark:text-gray-300">Loading...</p>
              : rows.length === 0 ? <p className="text-sm text-gray-600 dark:text-gray-300">Nothing here.</p>
              : (
                <ul className="space-y-3">
                  {rows.map(r => (
                    <li key={r.id} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600 dark:text-gray-300">
                        <span className="font-semibold text-orange-700 dark:text-orange-300">{CATEGORY[r.category] ?? r.category}</span>
                        <span>{r.userName}{r.userEmail ? ` · ${r.userEmail}` : ''} · <time dateTime={r.createdAt}>{new Date(r.createdAt).toLocaleString()}</time></span>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm">{r.message}</p>
                      {r.pagePath && <p className="mt-1 break-all text-xs text-gray-500 dark:text-gray-400">{r.pagePath}</p>}
                      <div className="mt-3 flex gap-1" role="group" aria-label="Status">
                        {STATUSES.map(s => (
                          <button key={s} type="button" aria-pressed={r.status === s} onClick={() => r.status !== s && setStatus(r, s)}
                            className={`px-3 py-1 rounded-md text-xs font-medium capitalize ${r.status === s ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900' : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
          </>
        )}
      </main>
    </div>
  );
}
