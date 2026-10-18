import { useMemo } from 'react';
import { Check, Map as MapIcon, ArrowRight } from 'lucide-react';
import { learningPaths } from '../../data/learningPaths';
import { courseStats } from '../../data/courseStats';
import { effortLabel, pathProgress } from '../../lib/pathProgress';

interface Props {
  seenByCourse: Record<string, number>;
  courseNames: Record<string, string>;
  onCourseSelect: (courseId: string) => void;
}

const totals = Object.fromEntries(Object.entries(courseStats).map(([id, s]) => [id, s.topics]));

export function LearningPaths({ seenByCourse, courseNames, onCourseSelect }: Props) {
  const paths = useMemo(
    () => learningPaths.map(p => ({ path: p, prog: pathProgress(p, seenByCourse, totals) })),
    [seenByCourse],
  );

  return (
    <section aria-labelledby="paths-title" className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
          <MapIcon className="w-4 h-4 text-white" aria-hidden="true" />
        </div>
        <h2 id="paths-title" className="font-display text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Choose your path</h2>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">Curated roadmaps built from the courses below. Progress counts the topics you have opened.</p>

      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {paths.map(({ path, prog }) => {
          const next = prog.nextIndex >= 0 ? path.steps[prog.nextIndex].courseId : null;
          const complete = prog.nextIndex === -1;
          const label = complete ? 'Review' : prog.started ? 'Continue' : 'Start';
          const target = next ?? path.steps[0].courseId;
          return (
            <li key={path.id} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 flex flex-col">
              <h3 className="font-display font-bold text-gray-900 dark:text-gray-100">{path.title}</h3>
              <p className="text-xs text-gray-700 dark:text-gray-300 mt-1 mb-3">{path.tagline}</p>

              <ol className="space-y-1.5 mb-3 flex-1">
                {prog.steps.map((s, i) => {
                  const pct = s.total > 0 ? Math.round((s.seen / s.total) * 100) : 0;
                  const current = i === prog.nextIndex;
                  return (
                    <li key={s.courseId} className="flex items-center gap-2 text-xs">
                      <span
                        aria-hidden="true"
                        className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold ${
                          s.done ? 'bg-emerald-500 text-white' : current ? 'bg-orange-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                        }`}
                      >
                        {s.done ? <Check className="w-3 h-3" /> : i + 1}
                      </span>
                      <span className={`flex-1 min-w-0 truncate ${current ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>
                        {courseNames[s.courseId] ?? s.courseId}
                      </span>
                      <span className="tabular-nums text-gray-600 dark:text-gray-400 shrink-0">
                        <span className="sr-only">{s.seen} of {s.total} topics, </span>
                        <span aria-hidden="true">{s.seen}/{s.total}</span>
                        <span className="sr-only">{pct} percent</span>
                      </span>
                    </li>
                  );
                })}
              </ol>

              <div className="flex justify-between text-[11px] text-gray-600 dark:text-gray-300 mb-1 tabular-nums">
                <span>{prog.steps.length} courses &middot; {prog.total} topics &middot; {effortLabel(prog.total)} reading</span>
                <span>{prog.percent}%</span>
              </div>
              <div
                role="progressbar"
                aria-label={`${path.title} progress`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={prog.percent}
                className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mb-3"
              >
                <div className={`h-1.5 rounded-full ${complete ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-orange-500 to-amber-400'}`} style={{ width: `${prog.percent}%` }} />
              </div>

              <button
                type="button"
                onClick={() => onCourseSelect(target)}
                aria-label={`${label} ${path.title}: open ${courseNames[target] ?? target}`}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-4 py-2 min-h-[40px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
              >
                {label} <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
