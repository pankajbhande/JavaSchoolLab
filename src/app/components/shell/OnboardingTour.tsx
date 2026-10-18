import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

export const TOUR_KEY = 'jsl_tour_done';

interface Step { selector: string; title: string; body: string; }

const STEPS: Step[] = [
  { selector: 'aside[aria-label="Course contents"]', title: 'Topic list', body: 'Browse modules and topics here. A tick marks the ones you have visited.' },
  { selector: '[data-tour="notes"]', title: 'Lesson notes', body: 'The lesson lives here. Use the Aa button for text size, width, sepia or high-contrast, and focus mode.' },
  { selector: '[role="tablist"][aria-label="Study panel sections"]', title: 'Study panel', body: 'Switch between your notes, interview Q&A and quick quizzes for this topic.' },
  { selector: '[data-tour="search"]', title: 'Search everything', body: 'Press Ctrl K (or /) to jump to any course, topic or phrase inside the lessons. Press ? for all shortcuts.' },
];

export function isTourDone(): boolean {
  try { return localStorage.getItem(TOUR_KEY) === '1'; } catch { return true; }
}
function markDone() { try { localStorage.setItem(TOUR_KEY, '1'); } catch { /* ignore */ } }

function findTarget(step: Step): HTMLElement | null {
  const el = document.querySelector<HTMLElement>(step.selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 4 || r.height < 4) return null;
  return el;
}

/** Index of the next step in `dir` whose target exists, or -1. */
function nextAvailable(from: number, dir: 1 | -1): number {
  for (let i = from + dir; i >= 0 && i < STEPS.length; i += dir) if (findTarget(STEPS[i])) return i;
  return -1;
}

interface Props { run: boolean; onDone: () => void; }

function Tour({ onDone }: { onDone: () => void }) {
  const [idx, setIdx] = useState(() => nextAvailable(-1, 1));
  const [rect, setRect] = useState<DOMRect | null>(null);
  const ref = useFocusTrap<HTMLDivElement>(true);
  const reduce = useRef(typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

  const finish = useCallback(() => { markDone(); onDone(); }, [onDone]);

  const measure = useCallback(() => {
    if (idx < 0) return;
    const el = findTarget(STEPS[idx]);
    if (!el) { const n = nextAvailable(idx, 1); if (n < 0) finish(); else setIdx(n); return; }
    setRect(el.getBoundingClientRect());
  }, [idx, finish]);

  useEffect(() => { if (idx < 0) finish(); }, [idx, finish]);

  useLayoutEffect(() => {
    if (idx < 0) return;
    const el = findTarget(STEPS[idx]);
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduce.current ? 'auto' : 'smooth' });
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    const t = window.setTimeout(measure, 350);
    return () => { window.removeEventListener('resize', measure); window.removeEventListener('scroll', measure, true); window.clearTimeout(t); };
  }, [idx, measure]);

  if (idx < 0 || !rect) return null;

  const step = STEPS[idx];
  const prev = nextAvailable(idx, -1);
  const next = nextAvailable(idx, 1);
  const pad = 6;
  const vw = window.innerWidth, vh = window.innerHeight;
  const cardW = Math.min(320, vw - 24);
  const spotTop = Math.max(0, rect.top - pad), spotLeft = Math.max(0, rect.left - pad);
  const spotW = Math.min(vw - spotLeft, rect.width + pad * 2), spotH = Math.min(vh - spotTop, rect.height + pad * 2);
  // Prefer below the target, else above, else beside; always clamp inside the viewport.
  let top = spotTop + spotH + 12;
  if (top + 190 > vh) top = spotTop - 190 - 12;
  if (top < 12) top = Math.max(12, Math.min(vh - 200, spotTop + 16));
  let left = Math.min(Math.max(12, spotLeft), vw - cardW - 12);
  if (spotW < vw * 0.5 && spotTop + spotH + 12 + 190 > vh && top > spotTop - 190) left = Math.min(vw - cardW - 12, spotLeft + spotW + 12);
  const trans = reduce.current ? 'none' : 'all 250ms ease';

  return (
    <div className="fixed inset-0 z-[80]" onKeyDown={e => {
      if (e.key === 'Escape') { e.stopPropagation(); finish(); }
      else if (e.key === 'ArrowRight' && next >= 0) setIdx(next);
      else if (e.key === 'ArrowLeft' && prev >= 0) setIdx(prev);
    }}>
      <div className="absolute inset-0" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-xl ring-2 ring-orange-400"
        style={{ top: spotTop, left: spotLeft, width: spotW, height: spotH, boxShadow: '0 0 0 9999px rgba(0,0,0,0.62)', transition: trans }}
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-body"
        className="absolute rounded-xl border border-orange-200 bg-white p-4 shadow-2xl dark:border-gray-700 dark:bg-gray-900"
        style={{ top, left, width: cardW, transition: trans }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">Step {idx + 1} of {STEPS.length}</p>
        <h2 id="tour-title" className="mt-1 text-base font-bold text-gray-900 dark:text-gray-100">{step.title}</h2>
        <p id="tour-body" className="mt-1 text-sm text-gray-600 dark:text-gray-300">{step.body}</p>
        <div className="mt-3 flex items-center gap-2">
          <button type="button" onClick={finish} className="rounded-lg px-2 py-1.5 text-sm text-gray-500 hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:text-gray-400 dark:hover:text-gray-100">Skip</button>
          <div className="ml-auto flex gap-2">
            {prev >= 0 && (
              <button type="button" onClick={() => setIdx(prev)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800">Back</button>
            )}
            <button type="button" onClick={() => (next >= 0 ? setIdx(next) : finish())} className="rounded-lg bg-orange-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">
              {next >= 0 ? 'Next' : 'Done'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OnboardingTour({ run, onDone }: Props) {
  if (!run) return null;
  return <Tour onDone={onDone} />;
}
