import { CalendarCheck, CheckCircle2, XCircle } from 'lucide-react';
import type { DailyAnswer, DailyQuestion } from '../../lib/dailyChallenge';
import { formatCountdown } from '../../lib/dailyChallenge';

interface Props {
  question: DailyQuestion | null;
  ready: boolean;
  answered: DailyAnswer | undefined;
  onAnswer: (choice: number) => void;
  msLeft: number;
}

export function DailyChallenge({ question, ready, answered, onAnswer, msLeft }: Props) {
  const done = !!answered && !!question && answered.qid === question.id;

  return (
    <section aria-labelledby="daily-title" className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-5 flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
          <CalendarCheck className="w-4 h-4 text-white" aria-hidden="true" />
        </div>
        <h2 id="daily-title" className="font-display text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">Daily challenge</h2>
        <span className="ml-auto text-[11px] text-gray-600 dark:text-gray-400 tabular-nums">New question in {formatCountdown(msLeft)}</span>
      </div>

      {!ready && <div className="h-40 rounded-xl bg-gray-100 dark:bg-gray-700/50 animate-pulse" aria-hidden="true" />}
      {ready && !question && <p className="text-sm text-gray-700 dark:text-gray-300">No challenge is available right now.</p>}

      {question && (
        <>
          <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 whitespace-pre-wrap break-words">{question.question}</p>
          <div role="group" aria-label="Answer options" className="space-y-2">
            {question.options.map((opt, i) => {
              const isCorrect = i === question.answerIndex;
              const isChosen = done && answered!.choice === i;
              let tone = 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900/40 text-gray-800 dark:text-gray-100 hover:border-orange-400 dark:hover:border-orange-500';
              if (done && isCorrect) tone = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100';
              else if (isChosen) tone = 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-100';
              else if (done) tone = 'border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400';
              return (
                <button
                  key={i}
                  type="button"
                  disabled={done}
                  aria-pressed={isChosen}
                  onClick={() => onAnswer(i)}
                  className={`w-full text-left rounded-xl border px-3 py-2.5 text-sm flex items-start gap-2 transition-colors disabled:cursor-default focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 ${tone}`}
                >
                  <span className="shrink-0 font-semibold tabular-nums" aria-hidden="true">{String.fromCharCode(65 + i)}.</span>
                  <span className="flex-1 min-w-0 break-words">{opt}</span>
                  {done && isCorrect && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" aria-label="Correct answer" />}
                  {isChosen && !isCorrect && <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" aria-label="Your answer, incorrect" />}
                </button>
              );
            })}
          </div>

          <div role="status" aria-live="polite" className="mt-3">
            {done && (
              <div className={`rounded-xl px-3 py-2.5 text-sm ${answered!.correct ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100' : 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-100'}`}>
                <p className="font-semibold mb-1">{answered!.correct ? 'Correct! +15 XP' : 'Not quite. +5 XP for trying.'}</p>
                <p className="break-words">{question.explanation}</p>
              </div>
            )}
          </div>
          <p className="mt-2 text-[11px] text-gray-600 dark:text-gray-400">
            {done ? 'Come back tomorrow for a new question.' : 'Pick an answer to see the explanation.'} Source: {question.source}
          </p>
        </>
      )}
    </section>
  );
}
