import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Target } from 'lucide-react';
import type { PreparedQuestion } from '../../services/quizEngine';
import { buildRetakeSet } from '../../lib/quizReview';

interface PracticeRetakeProps {
  /** The questions to practise (only the ones previously missed). */
  questions: PreparedQuestion[];
  onBack: () => void;
}

/**
 * Practice-only follow-up on missed questions. Deliberately self-contained: it receives no
 * save/certificate callbacks, so it cannot record an attempt or unlock anything.
 */
export function PracticeRetake({ questions: initial, onBack }: PracticeRetakeProps) {
  const [round, setRound] = useState(0);
  const [questions, setQuestions] = useState(initial);
  const [answers, setAnswers] = useState<number[]>(() => new Array(initial.length).fill(-1));
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => { headingRef.current?.focus(); }, [done, round]);

  const total = questions.length;
  const q = questions[index];
  const correctCount = questions.filter((x, i) => answers[i] === x.answerIndex).length;

  const startAgain = (qs: PreparedQuestion[]) => {
    setQuestions(qs);
    setAnswers(new Array(qs.length).fill(-1));
    setIndex(0);
    setDone(false);
    setRound(r => r + 1);
  };

  const Badge = (
    <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-300 text-xs font-semibold px-2.5 py-1">
      <Target className="w-3.5 h-3.5" aria-hidden="true" /> Practice - not scored
    </span>
  );

  if (done) {
    const stillMissed = total - correctCount;
    return (
      <div className="text-left">
        {Badge}
        <h3 ref={headingRef} tabIndex={-1} className="mt-3 text-2xl font-bold text-gray-900 dark:text-gray-100 focus:outline-none">
          {stillMissed === 0 ? 'All of those are fixed!' : `${correctCount} of ${total} right this time`}
        </h3>
        <p role="status" aria-live="polite" className="mt-1 text-gray-600 dark:text-gray-400">
          {stillMissed === 0
            ? 'Nice work. This practice does not change your official score - take the full test to put it on record.'
            : 'Good progress. This was practice only and does not change your official score.'}
        </p>
        <ul className="mt-4 space-y-2">
          {questions.map((x, i) => {
            const right = answers[i] === x.answerIndex;
            return (
              <li key={x.id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-sm">
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  <span className={right ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                    {right ? 'Correct' : 'Missed'}
                  </span>{' '}- {x.question}
                </p>
                {!right && (
                  <p className="mt-1 text-gray-700 dark:text-gray-300">
                    Correct answer: <span className="font-semibold">{x.options[x.answerIndex]}</span>
                  </p>
                )}
              </li>
            );
          })}
        </ul>
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          {stillMissed > 0 && (
            <button
              type="button"
              onClick={() => startAgain(buildRetakeSet(questions, answers, Date.now()))}
              className="px-5 py-3 border-2 border-orange-500 text-orange-700 dark:text-orange-300 rounded-lg font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600"
            >
              Practise the {stillMissed} still missed
            </button>
          )}
          <button
            type="button" onClick={onBack}
            className="px-5 py-3 bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to my results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-left">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {Badge}
        <span className="text-sm text-gray-600 dark:text-gray-400">Question {index + 1} of {total}</span>
      </div>
      <h3 ref={headingRef} tabIndex={-1} className="mt-4 text-lg font-semibold text-gray-800 dark:text-gray-200 focus:outline-none">
        {q.question}
      </h3>
      <div className="mt-4 space-y-3" role="group" aria-label="Answer options">
        {q.options.map((option, i) => {
          const selected = answers[index] === i;
          return (
            <button
              key={`${round}-${index}-${i}`}
              type="button"
              aria-pressed={selected}
              onClick={() => setAnswers(a => a.map((v, k) => (k === index ? i : v)))}
              className={`w-full text-left p-4 rounded-lg border-2 text-sm text-gray-800 dark:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 ${
                selected ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-orange-300'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
      <div className="mt-5 flex justify-between gap-3">
        <button
          type="button"
          onClick={() => (index === 0 ? onBack() : setIndex(index - 1))}
          className="px-5 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600"
        >
          {index === 0 ? 'Back to results' : 'Previous'}
        </button>
        {index < total - 1 ? (
          <button
            type="button" onClick={() => setIndex(index + 1)} disabled={answers[index] === -1}
            className="px-5 py-3 bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600"
          >
            Next
          </button>
        ) : (
          <button
            type="button" onClick={() => setDone(true)} disabled={answers.includes(-1)}
            className="px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
          >
            Check practice answers
          </button>
        )}
      </div>
    </div>
  );
}
