import { X, PlayCircle } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { SHORTCUT_LIST } from '../../lib/shortcuts';

interface Props {
  open: boolean;
  onClose: () => void;
  onReplayTour: () => void;
}

function Sheet({ onClose, onReplayTour }: Omit<Props, 'open'>) {
  const ref = useFocusTrap<HTMLDivElement>(true);
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center px-3"
      onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } }}
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        className="relative max-h-[88vh] w-full max-w-md overflow-y-auto rounded-2xl border border-orange-200 bg-white p-5 shadow-2xl dark:border-gray-700 dark:bg-gray-900"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 id="shortcuts-title" className="text-lg font-bold text-gray-900 dark:text-gray-100">Keyboard shortcuts</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-lg text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:text-gray-400 dark:hover:bg-gray-800">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {SHORTCUT_LIST.map(s => (
            <li key={s.label + s.keys.join('')} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span className="text-gray-700 dark:text-gray-200">{s.label}</span>
              <span className="flex shrink-0 gap-1">{s.keys.map(k => <kbd key={k} className="kbd">{k}</kbd>)}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => { onClose(); onReplayTour(); }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
        >
          <PlayCircle className="h-4 w-4" aria-hidden="true" /> Replay tour
        </button>
      </div>
    </div>
  );
}

export function ShortcutsSheet(props: Props) {
  if (!props.open) return null;
  return <Sheet onClose={props.onClose} onReplayTour={props.onReplayTour} />;
}
