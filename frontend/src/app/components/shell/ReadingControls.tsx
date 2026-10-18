import { useEffect, useRef, useState } from 'react';
import { Maximize2, Minus, Plus } from 'lucide-react';
import { FONT_SCALES, DEFAULT_PREFS, type ReadingPrefs, type RdTheme, type RdWidth } from '../../lib/readingPrefs';

interface Props {
  prefs: ReadingPrefs;
  onChange: (patch: Partial<ReadingPrefs>) => void;
  focusMode: boolean;
  onToggleFocus?: () => void;
}

const THEMES: { id: RdTheme; label: string }[] = [
  { id: 'default', label: 'Default' },
  { id: 'sepia', label: 'Sepia' },
  { id: 'contrast', label: 'High contrast' },
];
const WIDTHS: { id: RdWidth; label: string }[] = [
  { id: 'comfortable', label: 'Comfortable' },
  { id: 'wide', label: 'Wide' },
];

const seg = (on: boolean) =>
  `flex-1 rounded-md px-2 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
    on ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'}`;

export function ReadingControls({ prefs, onChange, focusMode, onToggleFocus }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => { if (!wrapRef.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus(); e.stopPropagation(); } };
    document.addEventListener('pointerdown', down);
    document.addEventListener('keydown', key, true);
    return () => { document.removeEventListener('pointerdown', down); document.removeEventListener('keydown', key, true); };
  }, [open]);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Reading controls"
        aria-label="Reading controls"
        data-tour="reading"
        className="flex h-10 items-center gap-1 rounded-lg border border-orange-300 bg-white px-3 text-sm font-semibold text-orange-700 shadow-sm hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:border-orange-700 dark:bg-gray-800 dark:text-orange-300 dark:hover:bg-orange-900/30"
      >
        <span aria-hidden="true">A<span className="text-xs">a</span></span>
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="Reading controls"
          className="absolute right-0 z-40 mt-2 w-[min(92vw,18rem)] space-y-3 rounded-xl border border-gray-200 bg-white p-3 text-gray-800 shadow-xl dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        >
          <div>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Text size</div>
            <div className="flex items-center gap-2">
              <button type="button" aria-label="Smaller text" disabled={prefs.fontStep <= 0} onClick={() => onChange({ fontStep: prefs.fontStep - 1 })} className={`${seg(false)} flex-none px-3 disabled:opacity-40`}><Minus className="h-4 w-4" aria-hidden="true" /></button>
              <div className="flex flex-1 justify-center gap-1" role="img" aria-label={`Size ${prefs.fontStep + 1} of ${FONT_SCALES.length}`}>
                {FONT_SCALES.map((_, i) => <span key={i} className={`h-2 w-6 rounded-full ${i <= prefs.fontStep ? 'bg-orange-600' : 'bg-gray-200 dark:bg-gray-700'}`} />)}
              </div>
              <button type="button" aria-label="Larger text" disabled={prefs.fontStep >= FONT_SCALES.length - 1} onClick={() => onChange({ fontStep: prefs.fontStep + 1 })} className={`${seg(false)} flex-none px-3 disabled:opacity-40`}><Plus className="h-4 w-4" aria-hidden="true" /></button>
            </div>
          </div>
          <div>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Line width</div>
            <div className="flex gap-1" role="group" aria-label="Line width">
              {WIDTHS.map(w => <button key={w.id} type="button" aria-pressed={prefs.width === w.id} onClick={() => onChange({ width: w.id })} className={seg(prefs.width === w.id)}>{w.label}</button>)}
            </div>
          </div>
          <div>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Theme</div>
            <div className="flex gap-1" role="group" aria-label="Reading theme">
              {THEMES.map(t => <button key={t.id} type="button" aria-pressed={prefs.theme === t.id} onClick={() => onChange({ theme: t.id })} className={seg(prefs.theme === t.id)}>{t.label}</button>)}
            </div>
          </div>
          {onToggleFocus && (
            <button type="button" onClick={() => { onToggleFocus(); setOpen(false); }} aria-pressed={focusMode} className="flex w-full items-center justify-center gap-2 rounded-lg border border-orange-300 px-3 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-900/30">
              <Maximize2 className="h-4 w-4" aria-hidden="true" /> {focusMode ? 'Exit focus mode' : 'Focus mode'}
            </button>
          )}
          <button type="button" onClick={() => onChange(DEFAULT_PREFS)} className="w-full text-center text-xs text-gray-500 underline hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100">Reset to defaults</button>
        </div>
      )}
    </div>
  );
}
