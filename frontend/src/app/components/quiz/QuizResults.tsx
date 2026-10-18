import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Award, BookOpen, ChevronDown, Clock, RotateCcw, Target } from 'lucide-react';
import type { PreparedQuestion } from '../../services/quizEngine';
import {
  deriveConcept, formatDuration, groupByConcept, lessonLinkForConcept, missedIndexes,
  type LessonIndexCourse, type LessonLink,
} from '../../lib/quizReview';

interface QuizResultsProps {
  moduleName: string;
  courseId?: string;
  moduleId?: string;
  bankLabel: string;
  questions: PreparedQuestion[];
  answers: number[];
  durationMs: number;
  passPercentage: number;
  onCertificate: () => void;
  onRetryFull: () => void;
  onPractice: () => void;
  onOpenLesson: (href: string) => void;
}

function ScoreRing({ percentage, passed, passMark }: { percentage: number; passed: boolean; passMark: number }) {
  const reduce = useReducedMotion();
  const r = 52;
  const c = 2 * Math.PI * r;
  const color = passed ? 'text-emerald-500' : 'text-amber-500';
  return (
    <div className="relative w-36 h-36 mx-auto" aria-hidden="true">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className="stroke-gray-200 dark:stroke-gray-700" />
        <motion.circle
          cx="60" cy="60" r={r} fill="none" strokeWidth="10" strokeLinecap="round"
          className={`stroke-current ${color}`}
          strokeDasharray={c}
          initial={{ strokeDashoffset: reduce ? c * (1 - percentage / 100) : c }}
          animate={{ strokeDashoffset: c * (1 - percentage / 100) }}
          transition={{ duration: reduce ? 0 : 1, delay: reduce ? 0 : 0.2, ease: 'easeOut' }}
        />
        {/* pass-mark tick */}
        <line
          x1="60" y1="2" x2="60" y2="16" strokeWidth="3" className="stroke-orange-500"
          transform={`rotate(${(passMark / 100) * 360} 60 60)`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{percentage}%</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">pass at {passMark}%</span>
      </div>
    </div>
  );
}

/** A few soft rising dots; skipped entirely for reduced-motion users. */
function Celebration() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  const dots = Array.from({ length: 14 }, (_, i) => i);
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-40 overflow-hidden" aria-hidden="true">
      {dots.map(i => (
        <motion.span
          key={i}
          className={`absolute bottom-0 w-2 h-2 rounded-full ${i % 3 === 0 ? 'bg-emerald-400' : i % 3 === 1 ? 'bg-amber-400' : 'bg-orange-400'}`}
          style={{ left: `${8 + i * 6.5}%` }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: -120 - (i % 4) * 14, opacity: [0, 0.9, 0] }}
          transition={{ duration: 2.2, delay: 0.3 + (i % 5) * 0.12, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

function ReviewItem({ q, index, chosen }: { q: PreparedQuestion; index: number; chosen: number }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const right = chosen === q.answerIndex;
  return (
    <li className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full flex items-start gap-3 p-3 sm:p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-900/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-600"
      >
        <span className={`mt-0.5 shrink-0 text-xs font-semibold rounded-full px-2 py-0.5 ${right ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'}`}>
          {right ? 'Correct' : 'Missed'}
        </span>
        <span className="flex-1 min-w-0 text-sm font-medium text-gray-800 dark:text-gray-200">
          <span className="sr-only">Question {index + 1}: </span>{q.question}
        </span>
        <ChevronDown className={`w-4 h-4 mt-1 shrink-0 text-gray-500 transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <div id={panelId} className="px-3 sm:px-4 pb-4 space-y-2 text-sm">
          {!right && (
            <p className="rounded-lg bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-2">
              <span className="font-semibold">Your answer: </span>{chosen === -1 ? 'No answer' : q.options[chosen]}
            </p>
          )}
          <p className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 p-2">
            <span className="font-semibold">Correct answer: </span>{q.options[q.answerIndex]}
          </p>
          {q.explanation && <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{q.explanation}</p>}
        </div>
      )}
    </li>
  );
}

export function QuizResults(p: QuizResultsProps) {
  const { questions, answers, passPercentage } = p;
  const total = questions.length;
  const score = total - missedIndexes(questions, answers).length;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = percentage >= passPercentage;
  const passScore = Math.ceil((total * passPercentage) / 100);

  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headingRef.current?.focus({ preventScroll: false }); }, []);

  const [showCorrect, setShowCorrect] = useState(false);
  const [courses, setCourses] = useState<LessonIndexCourse[] | null>(null);

  const concepts = useMemo(
    () => groupByConcept(questions.map((q, i) => ({
      concept: deriveConcept(q, p.bankLabel || p.moduleName),
      correct: answers[i] === q.answerIndex,
    }))),
    [questions, answers, p.bankLabel, p.moduleName],
  );
  const weak = concepts.filter(c => c.correct < c.total);
  const missedCount = total - score;

  // The course index is large; only fetch it when there is something to link to.
  useEffect(() => {
    if (weak.length === 0) return;
    let live = true;
    import('../../data/courseIndex')
      .then(m => { if (live) setCourses(m.courseIndex as LessonIndexCourse[]); })
      .catch(() => { /* links are an enhancement */ });
    return () => { live = false; };
  }, [weak.length]);

  const links = useMemo(() => {
    const out: { concept: string; link: LessonLink }[] = [];
    if (!courses) return out;
    const seen = new Set<string>();
    for (const c of weak) {
      const link = lessonLinkForConcept(c.concept, p.courseId, p.moduleId, courses);
      if (link && !seen.has(link.href)) {
        seen.add(link.href);
        out.push({ concept: c.concept, link });
      }
    }
    return out;
  }, [courses, weak, p.courseId, p.moduleId]);

  const headline = passed
    ? (percentage === 100 ? 'Flawless - well done!' : 'You passed - nicely done!')
    : 'Not quite there yet - you are closer than you think';
  const sub = passed
    ? `You answered ${score} of ${total} correctly and earned the certificate.`
    : `You got ${score} of ${total}. ${passScore} are needed to pass, so ${passScore - score} more would do it. Review below, then try again.`;

  const reviewItems = questions
    .map((q, i) => ({ q, i, right: answers[i] === q.answerIndex }))
    .filter(x => showCorrect || !x.right);

  return (
    <div className="relative text-left">
      {passed && <Celebration />}

      <div className="relative text-center">
        <ScoreRing percentage={percentage} passed={passed} passMark={passPercentage} />
        <h3
          ref={headingRef}
          tabIndex={-1}
          className="mt-4 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 focus:outline-none"
        >
          {headline}
        </h3>
        <p role="status" aria-live="polite" className="mt-1 text-gray-600 dark:text-gray-400">
          {sub}
        </p>
        <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <Clock className="w-4 h-4" aria-hidden="true" />
          Time taken: {formatDuration(p.durationMs)}
          <span aria-hidden="true">&middot;</span>
          <span>{p.moduleName}</span>
        </p>
      </div>

      {/* Concept breakdown */}
      <section aria-labelledby="quiz-concepts" className="mt-6 rounded-xl bg-gray-50 dark:bg-gray-900 p-4">
        <h4 id="quiz-concepts" className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
          By concept <span className="font-normal text-gray-500 dark:text-gray-400">(weakest first)</span>
        </h4>
        <ul className="space-y-3">
          {concepts.map(c => {
            const pct = Math.round((c.correct / c.total) * 100);
            const full = c.correct === c.total;
            return (
              <li key={c.concept}>
                <div className="flex justify-between gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="min-w-0 truncate">{c.concept}</span>
                  <span className="shrink-0 tabular-nums font-medium">{c.correct}/{c.total}</span>
                </div>
                <div
                  role="progressbar" aria-label={`${c.concept}: ${c.correct} of ${c.total} correct`}
                  aria-valuemin={0} aria-valuemax={c.total} aria-valuenow={c.correct}
                  className="mt-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden"
                >
                  <div
                    className={`h-full rounded-full ${full ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.max(pct, 4)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Study weak topics */}
      {weak.length > 0 && links.length > 0 && (
        <section aria-labelledby="quiz-study" className="mt-4 rounded-xl border border-orange-200 dark:border-orange-900/50 bg-orange-50/60 dark:bg-orange-900/10 p-4">
          <h4 id="quiz-study" className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-orange-600" aria-hidden="true" /> Study weak topics
          </h4>
          <ul className="space-y-1.5">
            {links.map(({ concept, link }) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={e => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                    e.preventDefault();
                    p.onOpenLesson(link.href);
                  }}
                  className="text-sm text-orange-700 dark:text-orange-300 underline underline-offset-2 hover:text-orange-900 dark:hover:text-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 rounded"
                >
                  {concept}: {link.kind === 'topic' ? `open "${link.label}"` : `start of ${link.label}`}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Review */}
      <section aria-labelledby="quiz-review" className="mt-6">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h4 id="quiz-review" className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {missedCount > 0 ? `Review: ${missedCount} missed question${missedCount === 1 ? '' : 's'}` : 'Review'}
          </h4>
          <button
            type="button"
            onClick={() => setShowCorrect(v => !v)}
            aria-pressed={showCorrect}
            className="text-xs text-gray-600 dark:text-gray-400 underline underline-offset-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600"
          >
            {showCorrect ? 'Hide correct answers' : 'Also show correct answers'}
          </button>
        </div>
        {reviewItems.length === 0 ? (
          <p className="text-sm text-emerald-700 dark:text-emerald-400">Nothing to review - every answer was correct.</p>
        ) : (
          <ul className="space-y-2">
            {reviewItems.map(x => <ReviewItem key={x.q.id} q={x.q} index={x.i} chosen={answers[x.i]} />)}
          </ul>
        )}
      </section>

      {/* Actions */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-center">
        {passed && (
          <button
            type="button" onClick={p.onCertificate}
            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-600"
          >
            <Award className="w-5 h-5" aria-hidden="true" /> Get Your Certificate
          </button>
        )}
        {missedCount > 0 && (
          <button
            type="button" onClick={p.onPractice}
            className="px-6 py-3 border-2 border-orange-500 text-orange-700 dark:text-orange-300 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600"
          >
            <Target className="w-5 h-5" aria-hidden="true" /> Retake missed questions (practice)
          </button>
        )}
        <button
          type="button" onClick={p.onRetryFull}
          className={`px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 ${
            passed ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200' : 'bg-gradient-to-r from-orange-600 to-amber-500 text-white'
          }`}
        >
          <RotateCcw className="w-5 h-5" aria-hidden="true" /> Try the full test again
        </button>
      </div>
      {missedCount > 0 && (
        <p className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
          Practice is not scored and does not change your result. Only the full test counts{passed ? '' : ` toward the certificate (${passPercentage}% to pass)`}.
        </p>
      )}
    </div>
  );
}
