import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Lightbulb, Trophy, Target } from 'lucide-react';
import { predictChallenges, type PredictChallenge } from '../../data/predictOutput';
import { useDataset } from '../../hooks/useDataset';
import { challengesForTopicIn, firstUnansweredIndex, loadState, optionsFor, saveState, scoreFor, type PredictState } from '../../lib/predictOutput';

// ── tiny Java highlighter (same palette as the lesson code blocks, no innerHTML) ──
const KEYWORDS = new Set(
  'abstract assert boolean break byte case catch char class const continue default do double else enum extends final finally float for if implements import instanceof int interface long new package private protected public return short static super switch this throw throws try var void while yield record null true false'.split(' '),
);

function highlight(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re =
    /(\/\*[\s\S]*?\*\/|\/\/[^\n]*)|("""[\s\S]*?"""|"(?:\\.|[^"\\\n])*")|('(?:\\.|[^'\\\n])+')|(@\w+)|(\b\d[\d_]*(?:\.\d+)?[LlFfDd]?\b|\b0x[0-9a-fA-F]+\b)|([A-Za-z_]\w*)/g;
  let last = 0;
  let k = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    if (m.index > last) out.push(code.slice(last, m.index));
    const t = m[0];
    let style: React.CSSProperties | null = null;
    if (m[1]) style = { color: '#6A9955', fontStyle: 'italic' };
    else if (m[2] || m[3]) style = { color: '#CE9178' };
    else if (m[4]) style = { color: '#D4D4AA' };
    else if (m[5]) style = { color: '#B5CEA8' };
    else if (m[6]) {
      if (KEYWORDS.has(t)) style = { color: '#CC7832', fontWeight: 'bold' };
      else if (/^[A-Z]/.test(t)) style = { color: '#4EC9B0' };
    }
    out.push(style ? <span key={k++} style={style}>{t}</span> : t);
    last = m.index + t.length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

export function PredictOutputSection({ topicId }: { topicId: string }) {
  const { data: all } = useDataset<PredictChallenge[]>('predict-output', predictChallenges);
  const challenges = useMemo(() => challengesForTopicIn(all ?? [], topicId), [all, topicId]);
  const uid = useId();
  const headingId = `${uid}-h`;
  const questionId = `${uid}-q`;

  const [state, setState] = useState<PredictState>(() => loadState());
  const [index, setIndex] = useState(() => firstUnansweredIndex(challenges, loadState()));
  const questionRef = useRef<HTMLParagraphElement>(null);
  const focusQuestion = useRef(false);

  // A different topic: restart at its first unanswered challenge.
  useEffect(() => {
    setIndex(firstUnansweredIndex(challenges, loadState()));
    setState(loadState());
  }, [challenges]);

  useEffect(() => {
    if (focusQuestion.current) {
      focusQuestion.current = false;
      questionRef.current?.focus();
    }
  }, [index]);

  const update = useCallback((next: PredictState) => {
    setState(next);
    saveState(next);
  }, []);

  if (challenges.length === 0) return null;

  const safeIndex = Math.min(index, challenges.length - 1);
  const challenge = challenges[safeIndex];
  const options = optionsFor(challenge);
  const picked = state[challenge.id];
  const answered = picked !== undefined;
  const isCorrect = answered && picked === challenge.answer;
  const score = scoreFor(challenges, state);
  const allDone = score.answered === score.total;
  const isLast = safeIndex === challenges.length - 1;

  const choose = (opt: string) => {
    if (answered) return;
    update({ ...state, [challenge.id]: opt });
  };

  const tryAgain = () => {
    const next = { ...state };
    delete next[challenge.id];
    update(next);
  };

  const startOver = () => {
    const next = { ...state };
    for (const c of challenges) delete next[c.id];
    update(next);
    focusQuestion.current = true;
    setIndex(0);
  };

  const goNext = () => {
    focusQuestion.current = true;
    setIndex(safeIndex + 1);
  };

  return (
    <section
      aria-labelledby={headingId}
      className="my-8 rounded-xl border border-orange-200 dark:border-orange-900/50 bg-orange-50/60 dark:bg-orange-950/20 p-4 sm:p-6 shadow-sm"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-4">
        <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-600 text-white shrink-0" aria-hidden="true">
          <Target className="w-5 h-5" />
        </span>
        <h3 id={headingId} className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mr-auto">
          Predict the output
        </h3>
        {challenges.length > 1 && (
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300 tabular-nums">
            {safeIndex + 1} of {challenges.length}
          </span>
        )}
        <span
          className="inline-flex items-center gap-1 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200 text-xs font-semibold px-2.5 py-1 tabular-nums"
          aria-label={`Score: ${score.correct} correct out of ${score.answered} answered`}
        >
          <Trophy className="w-3.5 h-3.5" aria-hidden="true" />
          {score.correct}/{score.answered || 0} correct
        </span>
      </div>

      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">{challenge.title}</p>

      <pre
        tabIndex={0}
        aria-label="Java code"
        className="bg-[#1e1e2e] text-gray-100 p-4 sm:p-5 rounded-lg overflow-x-auto border border-gray-700/50 shadow-lg font-mono text-[12.5px] sm:text-[13px] leading-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
      >
        <code>{highlight(challenge.code)}</code>
      </pre>

      <p
        id={questionId}
        ref={questionRef}
        tabIndex={-1}
        className="mt-5 mb-3 text-base font-semibold text-gray-900 dark:text-gray-100 focus:outline-none"
      >
        What does this print?
      </p>

      <div role="group" aria-labelledby={questionId} className="grid gap-2 sm:grid-cols-2">
        {options.map((opt, i) => {
          const isPicked = picked === opt;
          const isAnswer = opt === challenge.answer;
          let tone =
            'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/40';
          if (answered && isAnswer)
            tone = 'border-green-600 bg-green-50 dark:bg-green-950/40 dark:border-green-500 text-green-950 dark:text-green-100';
          else if (answered && isPicked)
            tone = 'border-red-600 bg-red-50 dark:bg-red-950/40 dark:border-red-500 text-red-950 dark:text-red-100';
          else if (answered) tone = 'border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/60 text-gray-500 dark:text-gray-400';
          return (
            <button
              key={opt}
              type="button"
              aria-pressed={isPicked}
              aria-disabled={answered}
              onClick={() => choose(opt)}
              className={`text-left rounded-lg border-2 px-3 py-2.5 min-h-[48px] flex items-start gap-3 motion-safe:transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 ${
                answered ? 'cursor-default' : 'cursor-pointer'
              } ${tone}`}
            >
              <span
                className="shrink-0 mt-0.5 w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-bold flex items-center justify-center"
                aria-hidden="true"
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-mono text-[13px] leading-5 whitespace-pre-wrap break-words">{opt}</span>
                {answered && isAnswer && (
                  <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-green-800 dark:text-green-300">
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Correct answer
                  </span>
                )}
                {answered && isPicked && !isAnswer && (
                  <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-red-800 dark:text-red-300">
                    <XCircle className="w-4 h-4" aria-hidden="true" /> Your answer
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div role="status" aria-live="polite" className="mt-4">
        {answered && (
          <div
            className={`rounded-lg border-l-4 p-4 ${
              isCorrect
                ? 'border-green-600 bg-green-50 dark:bg-green-950/30'
                : 'border-red-600 bg-red-50 dark:bg-red-950/30'
            }`}
          >
            <p
              className={`flex items-center gap-2 font-bold ${
                isCorrect ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
              }`}
            >
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
              ) : (
                <XCircle className="w-5 h-5" aria-hidden="true" />
              )}
              {isCorrect ? 'Correct!' : 'Not quite.'}
            </p>
            {!isCorrect && (
              <p className="mt-2 text-sm text-gray-800 dark:text-gray-200">
                It prints:
                <span className="block mt-1 font-mono text-[13px] whitespace-pre-wrap rounded bg-white/70 dark:bg-black/30 px-2 py-1">
                  {challenge.answer}
                </span>
              </p>
            )}
            <p className="mt-3 text-sm leading-6 text-gray-800 dark:text-gray-200">
              <span className="font-semibold">Why: </span>
              {challenge.explanation}
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300 flex gap-2">
              <Lightbulb className="w-4 h-4 mt-1 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <span>
                <span className="font-semibold">Common trap: </span>
                {challenge.trap}
              </span>
            </p>
          </div>
        )}
      </div>

      {answered && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {!isLast && (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm px-4 py-2.5 min-h-[44px] motion-safe:transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
            >
              Next challenge <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={tryAgain}
            className="inline-flex items-center gap-1.5 rounded-lg border-2 border-orange-600 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/30 font-semibold text-sm px-4 py-2.5 min-h-[44px] motion-safe:transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" /> Try again
          </button>
          {allDone && challenges.length > 1 && (
            <>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                All done: {score.correct} of {score.total} correct.
              </span>
              <button
                type="button"
                onClick={startOver}
                className="text-sm font-semibold text-orange-700 dark:text-orange-300 underline underline-offset-2 min-h-[44px] px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded"
              >
                Start over
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}

export default PredictOutputSection;
