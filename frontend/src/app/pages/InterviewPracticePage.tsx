import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Loader2, Timer } from 'lucide-react';
import { PageShell, btnPrimary, btnSecondary, card as cardCls } from '../components/study/PageShell';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useQuestionBank } from '../hooks/useQuestionBank';
import { courseIndex } from '../data/courseIndex';
import { courseName, interviewOnly, type QCard } from '../lib/questionBank';
import {
  pickQuestions, questionsForTopics, scorePercent, tally, verdict, weakTopics,
  type AnswerResult, type Rating,
} from '../lib/interview';
import { slugify } from '../lib/slug';
import { loadSessions, saveSession, type InterviewSession } from '../lib/studyStore';

const COUNTS = [5, 10, 15];
const TIMERS = [0, 30, 60, 120];
const MIXED = 'mixed';

const RATINGS: { id: Rating; label: string; cls: string }[] = [
  { id: 'missed', label: 'Missed', cls: 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-400' },
  { id: 'partly', label: 'Partly', cls: 'bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-400' },
  { id: 'nailed', label: 'Nailed it', cls: 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-400' },
];

const timerLabel = (s: number) => (s === 0 ? 'No timer' : s < 60 ? `${s}s` : `${s / 60} min`);

export default function InterviewPracticePage() {
  useDocumentMeta({
    title: 'Mock interview practice',
    description: 'Practise real interview questions: think, reveal the model answer, rate yourself, and drill your weakest topics.',
    path: '/interview-practice',
  });
  const bank = useQuestionBank(null);
  const pool = useMemo(() => interviewOnly(bank.cards), [bank.cards]);

  const [scope, setScope] = useState(MIXED);
  const [count, setCount] = useState(10);
  const [seconds, setSeconds] = useState(0);
  const [round, setRound] = useState<QCard[] | null>(null);
  const [results, setResults] = useState<AnswerResult[]>([]);
  const [roundScope, setRoundScope] = useState('');
  const [history, setHistory] = useState<InterviewSession[]>(() => loadSessions());

  const perCourse = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of pool) m.set(c.courseId, (m.get(c.courseId) ?? 0) + 1);
    return courseIndex.filter(c => m.has(c.id)).map(c => ({ id: c.id, name: c.name, n: m.get(c.id)! }));
  }, [pool]);

  const scoped = scope === MIXED ? pool : pool.filter(c => c.courseId === scope);

  const begin = (cards: QCard[], label: string) => {
    if (!cards.length) return;
    setRound(cards);
    setResults([]);
    setRoundScope(label);
  };
  const startMain = () => begin(pickQuestions(scoped, count), scope === MIXED ? 'Mixed set' : courseName(scope));

  const finished = !!round && results.length >= round.length;

  // Save once when a round completes
  useEffect(() => {
    if (!finished || !round) return;
    setHistory(saveSession({
      at: Date.now(), scope: roundScope, total: round.length, percent: scorePercent(results), results,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  return (
    <PageShell title="Mock interview" subtitle="Think, reveal, rate yourself">
      {!round ? (
        <Setup
          loading={bank.loading} done={bank.done} total={bank.total}
          perCourse={perCourse} poolSize={pool.length} scoped={scoped.length}
          scope={scope} setScope={setScope} count={count} setCount={setCount}
          seconds={seconds} setSeconds={setSeconds} onStart={startMain} history={history}
        />
      ) : finished ? (
        <Summary
          results={results} scope={roundScope}
          onAgain={() => { setRound(null); setResults([]); }}
          onPractise={(topics) => {
            const weakPool = questionsForTopics(pool, topics);
            begin(pickQuestions(weakPool, Math.min(10, weakPool.length)), 'Weak topics');
          }}
        />
      ) : (
        <Question
          key={round[results.length].id}
          q={round[results.length]} index={results.length} total={round.length} seconds={seconds}
          onRate={(rating) => {
            const q = round[results.length];
            setResults(r => [...r, { cardId: q.id, courseId: q.courseId, topicId: q.topicId, topicName: q.topicName, rating }]);
          }}
          onQuit={() => { setRound(null); setResults([]); }}
        />
      )}
    </PageShell>
  );
}

function Segment<T extends string | number>({ label, value, options, onChange, fmt }: {
  label: string; value: T; options: T[]; onChange: (v: T) => void; fmt: (v: T) => string;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <label key={String(o)} className="cursor-pointer">
            <input type="radio" name={label} className="peer sr-only" checked={value === o} onChange={() => onChange(o)} />
            <span className="inline-block rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium peer-checked:border-orange-600 peer-checked:bg-orange-600 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-orange-400 dark:border-gray-600 dark:bg-gray-900">
              {fmt(o)}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Setup(p: {
  loading: boolean; done: number; total: number; perCourse: { id: string; name: string; n: number }[];
  poolSize: number; scoped: number; scope: string; setScope: (s: string) => void;
  count: number; setCount: (n: number) => void; seconds: number; setSeconds: (n: number) => void;
  onStart: () => void; history: InterviewSession[];
}) {
  const n = Math.min(p.count, p.scoped);
  return (
    <div className="space-y-6">
      <section className={`${cardCls} space-y-6 p-5 sm:p-6`}>
        <div>
          <label htmlFor="scope" className="mb-2 block text-sm font-semibold">Topic set</label>
          <select
            id="scope" value={p.scope} onChange={e => p.setScope(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-900"
          >
            <option value={MIXED}>Mixed - all courses ({p.poolSize} questions)</option>
            {p.perCourse.map(c => <option key={c.id} value={c.id}>{c.name} ({c.n})</option>)}
          </select>
          {p.loading && (
            <p className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400" role="status">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading more courses {p.done}/{p.total}
            </p>
          )}
        </div>
        <Segment label="Questions" value={p.count} options={COUNTS} onChange={p.setCount} fmt={v => String(v)} />
        <Segment label="Timer per question" value={p.seconds} options={TIMERS} onChange={p.setSeconds} fmt={timerLabel} />
        <div>
          <button type="button" className={btnPrimary} onClick={p.onStart} disabled={p.scoped === 0}>
            Start {n > 0 ? `${n} question${n === 1 ? '' : 's'}` : 'interview'}
          </button>
          {p.scoped === 0 && !p.loading && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">No questions in this set yet.</p>}
        </div>
      </section>

      {p.history.length > 0 && (
        <section aria-labelledby="hist-h">
          <h2 id="hist-h" className="mb-3 text-base font-bold">Recent rounds</h2>
          <ul className={`${cardCls} divide-y divide-gray-200 dark:divide-gray-700`}>
            {p.history.slice(0, 5).map(s => (
              <li key={s.at} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="min-w-0">
                  <span className="block truncate font-medium">{s.scope}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(s.at).toLocaleString()} &middot; {s.total} questions</span>
                </span>
                <span className="text-lg font-bold text-orange-700 dark:text-orange-300">{s.percent}%</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Question({ q, index, total, seconds, onRate, onQuit }: {
  q: QCard; index: number; total: number; seconds: number; onRate: (r: Rating) => void; onQuit: () => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    if (!seconds || revealed) return;
    const end = Date.now() + seconds * 1000;
    const id = window.setInterval(() => {
      const l = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setLeft(l);
      if (l === 0) { setRevealed(true); window.clearInterval(id); }
    }, 250);
    return () => window.clearInterval(id);
  }, [seconds, revealed]);

  const onKey = useCallback((e: KeyboardEvent) => {
    const el = e.target as HTMLElement | null;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
    if (!revealed && (e.key === ' ' || e.key === 'Enter')) {
      if (el && el.tagName === 'BUTTON') return;
      e.preventDefault();
      setRevealed(true);
    } else if (revealed && /^[1-3]$/.test(e.key)) {
      e.preventDefault();
      onRate(RATINGS[Number(e.key) - 1].id);
    }
  }, [revealed, onRate]);
  useEffect(() => {
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onKey]);

  const pct = Math.round((index / total) * 100);
  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1 flex items-center justify-between text-xs font-medium text-gray-600 dark:text-gray-300">
          <span>Question {index + 1} of {total}</span>
          <button type="button" onClick={onQuit} className="rounded px-1 underline hover:text-orange-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">End round</button>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Round progress">
          <div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <section className={`${cardCls} flex min-h-[16rem] flex-col p-5 sm:p-8`} aria-live="polite">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-300">
            {courseName(q.courseId)} &middot; {q.topicName}
          </p>
          {seconds > 0 && !revealed && (
            <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ${left <= 10 ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}>
              <Timer className="h-3.5 w-3.5" aria-hidden /> {left}s
            </span>
          )}
        </div>
        <h2 className="mt-3 text-lg font-bold leading-snug sm:text-xl">{q.front}</h2>
        {revealed ? (
          <div className="mt-5 flex-1 whitespace-pre-wrap rounded-xl bg-orange-50 p-4 text-sm leading-relaxed text-gray-800 dark:bg-gray-900 dark:text-gray-100 sm:text-base">
            <span className="mb-1 block text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Model answer</span>
            {q.back}
          </div>
        ) : (
          <div className="flex flex-1 flex-col justify-end gap-3 pt-6">
            <p className="text-sm text-gray-600 dark:text-gray-300">Think through your answer out loud, then reveal the model answer.</p>
            <button type="button" className={`${btnPrimary} w-full`} onClick={() => setRevealed(true)}>
              <Eye className="h-4 w-4" aria-hidden /> Reveal answer <kbd className="rounded bg-white/20 px-1.5 text-xs">Space</kbd>
            </button>
          </div>
        )}
      </section>

      {revealed && (
        <div role="group" aria-label="How did you do?">
          <div className="grid grid-cols-3 gap-2">
            {RATINGS.map((r, i) => (
              <button
                key={r.id} type="button" onClick={() => onRate(r.id)}
                className={`${r.cls} rounded-xl px-3 py-3 text-sm font-semibold text-white shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900`}
              >
                {r.label} <span className="opacity-75">({i + 1})</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Summary({ results, scope, onAgain, onPractise }: {
  results: AnswerResult[]; scope: string; onAgain: () => void;
  onPractise: (t: ReturnType<typeof weakTopics>) => void;
}) {
  const pct = scorePercent(results);
  const t = tally(results);
  const weak = weakTopics(results);
  return (
    <div className="space-y-5">
      <section className={`${cardCls} p-6 text-center sm:p-10`} role="status">
        <p className="text-sm text-gray-600 dark:text-gray-300">{scope}</p>
        <p className="mt-2 text-6xl font-extrabold text-orange-600 dark:text-orange-400">{pct}%</p>
        <h2 className="mt-1 text-xl font-bold">{verdict(pct)}</h2>
        <dl className="mx-auto mt-6 grid max-w-sm grid-cols-3 gap-2">
          {RATINGS.map(r => (
            <div key={r.id} className="rounded-xl bg-gray-100 p-3 dark:bg-gray-700">
              <dd className="text-xl font-bold">{t[r.id]}</dd>
              <dt className="text-xs text-gray-600 dark:text-gray-300">{r.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <section className={`${cardCls} p-5`} aria-labelledby="weak-h">
        <h3 id="weak-h" className="font-bold">Weakest topics</h3>
        {weak.length === 0 ? (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">No weak spots this round. Nicely done.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {weak.map(w => (
              <li key={`${w.courseId}/${w.topicId}`} className="flex items-center justify-between gap-3 text-sm">
                <Link to={`/course/${slugify(w.courseId)}/${slugify(w.topicId)}`} className="min-w-0 truncate font-medium text-orange-700 hover:underline dark:text-orange-300">
                  {w.topicName} <span className="text-xs font-normal text-gray-500 dark:text-gray-400">({courseName(w.courseId)})</span>
                </Link>
                <span className="shrink-0 font-semibold tabular-nums">{w.percent}%</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        {weak.length > 0 && (
          <button type="button" className={btnPrimary} onClick={() => onPractise(weak)}>Practise these again</button>
        )}
        <button type="button" className={btnSecondary} onClick={onAgain}>New round</button>
        <Link to="/flashcards" className={btnSecondary}>Flashcards</Link>
      </div>
    </div>
  );
}
