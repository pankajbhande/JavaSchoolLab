import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Layers, Loader2, RotateCcw } from 'lucide-react';
import { PageShell, btnPrimary, btnSecondary, card as cardCls } from '../components/study/PageShell';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useQuestionBank } from '../hooks/useQuestionBank';
import { courseIndex } from '../data/courseIndex';
import { courseName, type QCard } from '../lib/questionBank';
import {
  GRADES, buildQueue, countDue, newCard, previewWaits, review,
  type CardState, type DueCounts, type Grade,
} from '../lib/spaced';
import { loadFlashcardStore, saveFlashcardStore, type FlashcardStore } from '../lib/studyStore';

const GRADE_META: Record<Grade, { label: string; cls: string }> = {
  again: { label: 'Again', cls: 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-400' },
  hard: { label: 'Hard', cls: 'bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-400' },
  good: { label: 'Good', cls: 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-400' },
  easy: { label: 'Easy', cls: 'bg-sky-600 hover:bg-sky-700 focus-visible:ring-sky-400' },
};
const LIMITS = [5, 10, 20, 50];
const ALL = 'all';

function useStore() {
  const [store, setStore] = useState<FlashcardStore>(() => loadFlashcardStore());
  const update = useCallback((fn: (s: FlashcardStore) => FlashcardStore) => {
    setStore(prev => {
      const next = fn(prev);
      saveFlashcardStore(next);
      return next;
    });
  }, []);
  return [store, update] as const;
}

const opts = (s: FlashcardStore) => ({ newLimit: s.newLimit, newIntroducedToday: s.newToday.count });
const withStates = (cards: QCard[], s: FlashcardStore) =>
  cards.map(c => ({ id: c.id, state: s.cards[c.id] ?? newCard() }));

export default function FlashcardsPage() {
  const { courseId } = useParams();
  useDocumentMeta({
    title: 'Flashcards with spaced repetition',
    description: 'Review key points and interview questions with a spaced-repetition scheduler that brings each card back just before you would forget it.',
    path: courseId ? `/flashcards/${courseId}` : '/flashcards',
  });
  return (
    <PageShell
      title="Flashcards"
      subtitle={courseId ? (courseId === ALL ? 'All courses' : courseName(courseId)) : 'Spaced repetition'}
      wide={!courseId}
    >
      {courseId ? <DeckView courseId={courseId} /> : <DeckPicker />}
    </PageShell>
  );
}

function Counts({ c }: { c: DueCounts }) {
  return (
    <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
      <span className={`rounded-full px-2.5 py-1 ${c.due ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>{c.due} due</span>
      <span className="rounded-full bg-sky-100 px-2.5 py-1 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200">{c.fresh} new</span>
      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600 dark:bg-gray-700 dark:text-gray-300">{c.total} cards</span>
    </div>
  );
}

function DeckPicker() {
  const navigate = useNavigate();
  const bank = useQuestionBank(null);
  const [store] = useStore();
  const now = Date.now();

  const decks = useMemo(() => {
    const by = new Map<string, QCard[]>();
    for (const c of bank.cards) by.set(c.courseId, [...(by.get(c.courseId) ?? []), c]);
    return courseIndex
      .filter(c => by.has(c.id))
      .map(c => ({ id: c.id, name: c.name, counts: countDue(withStates(by.get(c.id)!, store), now, opts(store)) }));
  }, [bank.cards, store, now]);

  const all = countDue(withStates(bank.cards, store), now, opts(store));
  const start = (id: string) => navigate(`/flashcards/${id}`, { state: { autostart: true } });

  return (
    <div className="space-y-6">
      <section className={`${cardCls} flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between`}>
        <div>
          <h2 className="text-lg font-bold">{all.due ? `${all.due} card${all.due === 1 ? '' : 's'} due for review` : 'Nothing due right now'}</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {all.fresh} new cards are available today. Cards come back just before you would forget them.
          </p>
        </div>
        <button type="button" className={btnPrimary} onClick={() => start(ALL)} disabled={all.due + all.fresh === 0}>
          Review due cards
        </button>
      </section>

      <section aria-labelledby="decks-h">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="decks-h" className="text-base font-bold">Decks</h2>
          {bank.loading && (
            <span className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400" role="status">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading question banks {bank.done}/{bank.total}
            </span>
          )}
        </div>
        {decks.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Decks will appear as courses load.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {decks.map(d => (
              <li key={d.id} className={`${cardCls} flex flex-col gap-3 p-4`}>
                <div className="flex items-start gap-3">
                  <Layers className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" aria-hidden />
                  <h3 className="font-semibold leading-snug">{d.name}</h3>
                </div>
                <Counts c={d.counts} />
                <div className="mt-auto flex gap-2">
                  <button type="button" className={`${btnPrimary} flex-1 !py-2`} onClick={() => start(d.id)} disabled={d.counts.due + d.counts.fresh === 0}>
                    Review
                  </button>
                  <Link to={`/flashcards/${d.id}`} className={`${btnSecondary} !py-2`}>Open</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

interface Tally { again: number; hard: number; good: number; easy: number }

function DeckView({ courseId }: { courseId: string }) {
  const location = useLocation();
  const known = courseId === ALL || courseIndex.some(c => c.id === courseId);
  const bank = useQuestionBank(courseId === ALL ? null : known ? courseId : null);
  const [store, update] = useStore();
  const [queue, setQueue] = useState<string[] | null>(null);
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [tally, setTally] = useState<Tally>({ again: 0, hard: 0, good: 0, easy: 0 });
  const autostarted = useRef(false);
  const now = Date.now();

  const byId = useMemo(() => new Map(bank.cards.map(c => [c.id, c])), [bank.cards]);
  const counts = countDue(withStates(bank.cards, store), now, opts(store));

  const start = useCallback(() => {
    const q = buildQueue(withStates(bank.cards, store), Date.now(), opts(store));
    setQueue(q);
    setPos(0);
    setFlipped(false);
    setTally({ again: 0, hard: 0, good: 0, easy: 0 });
  }, [bank.cards, store]);

  // Coming from "Review due cards": begin as soon as the deck has cards
  useEffect(() => {
    const auto = (location.state as { autostart?: boolean } | null)?.autostart;
    if (auto && !autostarted.current && bank.cards.length > 0) {
      autostarted.current = true;
      start();
    }
  }, [bank.cards.length, location.state, start]);

  const currentId = queue ? queue[pos] : undefined;
  const current = currentId ? byId.get(currentId) : undefined;
  const state: CardState = (currentId && store.cards[currentId]) || newCard();

  const grade = useCallback((g: Grade) => {
    if (!queue || !currentId) return;
    const t = Date.now();
    const prev = store.cards[currentId] ?? newCard();
    const next = review(prev, g, t);
    update(s => ({
      ...s,
      cards: { ...s.cards, [currentId]: next },
      newToday: prev.phase === 'new' ? { ...s.newToday, count: s.newToday.count + 1 } : s.newToday,
    }));
    setTally(x => ({ ...x, [g]: x[g] + 1 }));
    // A card still in learning comes back at the end of this session
    if (next.phase === 'learning') setQueue(q => (q ? [...q, currentId] : q));
    setPos(p => p + 1);
    setFlipped(false);
  }, [queue, currentId, store.cards, update]);

  const active = !!queue && pos < queue.length && !!current;
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      if (e.key === ' ' || e.key === 'Enter') {
        if (el && (el.tagName === 'BUTTON' || el.tagName === 'A')) return; // native activation
        e.preventDefault();
        setFlipped(f => !f);
      } else if (flipped && /^[1-4]$/.test(e.key)) {
        e.preventDefault();
        grade(GRADES[Number(e.key) - 1]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, flipped, grade]);

  if (!known) {
    return (
      <div className={`${cardCls} p-6 text-center`}>
        <p className="font-semibold">There is no deck called "{courseId}".</p>
        <Link to="/flashcards" className={`${btnPrimary} mt-4`}>Choose a deck</Link>
      </div>
    );
  }

  // ----- session finished -----
  if (queue && !active) {
    const reviewed = tally.again + tally.hard + tally.good + tally.easy;
    const left = buildQueue(withStates(bank.cards, store), Date.now(), opts(store)).length;
    return (
      <div className={`${cardCls} p-6 text-center sm:p-10`} role="status">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" aria-hidden />
        <h2 className="mt-3 text-2xl font-bold">{reviewed ? 'Session complete' : 'Nothing to review'}</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          {reviewed ? `You reviewed ${reviewed} card${reviewed === 1 ? '' : 's'}.` : 'You are all caught up. Come back later for more.'}
        </p>
        {reviewed > 0 && (
          <dl className="mx-auto mt-6 grid max-w-md grid-cols-4 gap-2">
            {GRADES.map(g => (
              <div key={g} className="rounded-xl bg-gray-100 p-3 dark:bg-gray-700">
                <dd className="text-xl font-bold">{tally[g]}</dd>
                <dt className="text-xs text-gray-600 dark:text-gray-300">{GRADE_META[g].label}</dt>
              </div>
            ))}
          </dl>
        )}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {left > 0 && <button type="button" className={btnPrimary} onClick={start}>Review {left} more</button>}
          <Link to="/flashcards" className={btnSecondary}>All decks</Link>
        </div>
      </div>
    );
  }

  // ----- overview before starting -----
  if (!queue) {
    return (
      <div className="space-y-5">
        <Link to="/flashcards" className="inline-flex items-center gap-1 text-sm font-medium text-orange-700 hover:underline dark:text-orange-300">
          <ArrowLeft className="h-4 w-4" aria-hidden /> All decks
        </Link>
        <section className={`${cardCls} space-y-5 p-6`}>
          <h2 className="text-xl font-bold">{courseId === ALL ? 'All courses' : courseName(courseId)}</h2>
          {bank.loading && bank.cards.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-gray-500" role="status"><Loader2 className="h-4 w-4 animate-spin" /> Loading cards...</p>
          ) : bank.cards.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-300">{bank.error ?? 'This course has no flashcards yet.'}</p>
          ) : (
            <>
              <Counts c={counts} />
              <button type="button" className={btnPrimary} onClick={start} disabled={counts.due + counts.fresh === 0}>
                Review due cards
              </button>
              {counts.due + counts.fresh === 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-300">You are all caught up. New cards unlock tomorrow, or raise the daily limit below.</p>
              )}
            </>
          )}
          <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
            <label className="flex items-center gap-3 text-sm">
              <span className="font-medium">New cards per day</span>
              <select
                value={store.newLimit}
                onChange={e => update(s => ({ ...s, newLimit: Number(e.target.value) }))}
                className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 dark:border-gray-600 dark:bg-gray-900"
              >
                {LIMITS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Progress is saved in this browser only.</p>
          </div>
        </section>
      </div>
    );
  }

  // ----- a card -----
  const waits = previewWaits(state, Date.now());
  const remaining = queue.length - pos;
  const pct = Math.round((pos / queue.length) * 100);
  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1 flex justify-between text-xs font-medium text-gray-600 dark:text-gray-300">
          <span>{courseName(current!.courseId)} &middot; {current!.topicName}</span>
          <span>{remaining} left</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Session progress">
          <div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <section className={`${cardCls} flex min-h-[18rem] flex-col p-5 sm:p-8`} aria-live="polite">
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-300">
          {current!.kind === 'term' ? 'Key point' : 'Interview question'}
          {state.phase === 'new' ? ' - new' : ''}
        </p>
        <h2 className="mt-2 text-lg font-bold leading-snug sm:text-xl">{current!.front}</h2>
        {flipped ? (
          <div className="mt-5 flex-1 whitespace-pre-wrap rounded-xl bg-orange-50 p-4 text-sm leading-relaxed text-gray-800 dark:bg-gray-900 dark:text-gray-100 sm:text-base">
            {current!.back}
          </div>
        ) : (
          <div className="flex flex-1 items-end pt-6">
            <button type="button" className={`${btnPrimary} w-full`} onClick={() => setFlipped(true)}>
              <RotateCcw className="h-4 w-4" aria-hidden /> Show answer <kbd className="rounded bg-white/20 px-1.5 text-xs">Space</kbd>
            </button>
          </div>
        )}
      </section>

      {flipped && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="How well did you remember?">
          {GRADES.map((g, i) => (
            <button
              key={g}
              type="button"
              onClick={() => grade(g)}
              className={`${GRADE_META[g].cls} flex flex-col items-center rounded-xl px-3 py-3 text-white shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900`}
            >
              <span className="text-sm font-semibold">{GRADE_META[g].label} <span className="opacity-75">({i + 1})</span></span>
              <span className="text-xs opacity-90">{waits[g]}</span>
            </button>
          ))}
        </div>
      )}
      <p className="text-center text-xs text-gray-500 dark:text-gray-400">
        Space flips the card, keys 1-4 grade it.
      </p>
    </div>
  );
}
