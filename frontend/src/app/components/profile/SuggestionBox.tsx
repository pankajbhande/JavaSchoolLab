import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { fetchMySuggestions, sendSuggestion, type MySuggestion, type SuggestionCategory } from '../../services/api';

const card = 'rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/50 p-5';
const input =
  'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-400';

const MIN = 10;
const MAX = 2000;

const CATEGORIES: { id: SuggestionCategory; label: string }[] = [
  { id: 'idea', label: 'Idea or new feature' },
  { id: 'content', label: 'Mistake in a lesson' },
  { id: 'bug', label: 'Something is broken' },
  { id: 'other', label: 'Something else' },
];

/** Where a signed-in learner sends ideas, content mistakes and bug reports; their own earlier messages are listed below. */
export function SuggestionBox() {
  const [category, setCategory] = useState<SuggestionCategory>('idea');
  const [message, setMessage] = useState('');
  const [page, setPage] = useState('');
  const [busy, setBusy] = useState(false);
  const [mine, setMine] = useState<MySuggestion[]>([]);

  const load = () => { fetchMySuggestions().then(setMine).catch(() => setMine([])); };
  useEffect(load, []);

  const length = message.trim().length;
  const valid = length >= MIN && length <= MAX;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    try {
      await sendSuggestion({ category, message: message.trim(), pagePath: page.trim() || undefined });
      toast.success('Thank you! Your suggestion was sent.');
      setMessage('');
      setPage('');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not send your suggestion');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className={card} aria-labelledby="suggest-heading">
        <h3 id="suggest-heading" className="font-semibold text-gray-800 dark:text-gray-100">Suggestion box</h3>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
          Tell us what to add or fix. Found a mistake in a lesson? Include its name or link so we can find it quickly.
        </p>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200">
            What is this about?
            <select value={category} onChange={e => setCategory(e.target.value as SuggestionCategory)} className={`${input} mt-1`}>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </label>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200">
            Lesson or page (optional)
            <input value={page} maxLength={300} onChange={e => setPage(e.target.value)} placeholder="e.g. /course/java/basics/introduction" className={`${input} mt-1`} />
          </label>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200">
            Your message
            <textarea value={message} maxLength={MAX} rows={6} onChange={e => setMessage(e.target.value)} className={`${input} mt-1 resize-y`}
              placeholder="Write at least 10 characters" />
          </label>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">{length} / {MAX}</span>
            <button type="submit" disabled={!valid || busy}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60">
              <Send className="h-4 w-4" aria-hidden /> {busy ? 'Sending...' : 'Send suggestion'}
            </button>
          </div>
        </form>
      </section>

      <section className={card} aria-labelledby="sent-heading">
        <h3 id="sent-heading" className="font-semibold text-gray-800 dark:text-gray-100">Your earlier suggestions</h3>
        {mine.length === 0 ? (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Nothing sent yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {mine.map(s => (
              <li key={s.id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                <div className="flex items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{CATEGORIES.find(c => c.id === s.category)?.label ?? s.category}</span>
                  <time dateTime={s.createdAt}>{new Date(s.createdAt).toLocaleDateString()}</time>
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-800 dark:text-gray-100">{s.message}</p>
                {s.pagePath && <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">{s.pagePath}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
