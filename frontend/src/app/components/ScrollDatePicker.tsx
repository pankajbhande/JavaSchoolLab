import { useEffect, useId, useMemo, useState } from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { ageOn, clampDob, daysInMonth, formatYmd, parseYmd, todayYmd, type Ymd } from '../lib/dob';

// Date-of-birth picker: three native dropdowns (Month / Day / Year) with a live "you are N years old" line.
// Native selects give the right mobile picker, full keyboard and screen-reader support, and nothing to mis-scroll.
// The old name is kept so callers do not change. Dates after today cannot be chosen.

interface ScrollDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  minYear?: number;
  maxYear?: number;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const SELECT =
  'w-full appearance-none h-12 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 ' +
  'text-gray-900 dark:text-white text-[15px] font-medium pl-3.5 pr-9 cursor-pointer shadow-sm ' +
  'hover:border-orange-400 dark:hover:border-orange-500 transition-colors ' +
  'focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 outline-none';

function Field({ label, htmlFor, className = '', children }: { label: string; htmlFor: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
        {label}
      </label>
      <div className="relative">
        {children}
        <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
      </div>
    </div>
  );
}

export function ScrollDatePicker({ value, onChange, minYear = 1930, maxYear }: ScrollDatePickerProps) {
  const id = useId();
  const today = useMemo(() => todayYmd(), []);
  const lastYear = Math.min(maxYear ?? today.y, today.y);

  const [dob, setDob] = useState<Ymd>(() => clampDob(parseYmd(value) ?? { y: 2000, m: 1, d: 1 }, today));

  const set = (patch: Partial<Ymd>) => setDob(prev => clampDob({ ...prev, ...patch }, today));

  // Tell the parent the (always valid) date, on mount and after every change.
  useEffect(() => { onChange(formatYmd(dob)); }, [dob]); // eslint-disable-line react-hooks/exhaustive-deps

  const years = useMemo(() => Array.from({ length: lastYear - minYear + 1 }, (_, i) => lastYear - i), [lastYear, minYear]);
  const monthCount = dob.y === today.y ? today.m : 12;
  const dayCount = dob.y === today.y && dob.m === today.m ? today.d : daysInMonth(dob.y, dob.m);
  const age = ageOn(dob, today);

  return (
    <div role="group" aria-label="Date of birth" className="rounded-2xl border border-gray-200 dark:border-gray-600 bg-gray-50/70 dark:bg-gray-700/40 p-3.5">
      <div className="grid grid-cols-[1.6fr_1fr_1.2fr] gap-2.5">
        <Field label="Month" htmlFor={`${id}-m`}>
          <select id={`${id}-m`} className={SELECT} value={dob.m} onChange={e => set({ m: Number(e.target.value) })}>
            {MONTHS.slice(0, monthCount).map((name, i) => <option key={name} value={i + 1}>{name}</option>)}
          </select>
        </Field>
        <Field label="Day" htmlFor={`${id}-d`}>
          <select id={`${id}-d`} className={SELECT} value={dob.d} onChange={e => set({ d: Number(e.target.value) })}>
            {Array.from({ length: dayCount }, (_, i) => <option key={i + 1} value={i + 1}>{String(i + 1).padStart(2, '0')}</option>)}
          </select>
        </Field>
        <Field label="Year" htmlFor={`${id}-y`}>
          <select id={`${id}-y`} className={SELECT} value={dob.y} onChange={e => set({ y: Number(e.target.value) })}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </Field>
      </div>

      <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-900/50 px-3.5 py-2.5" aria-live="polite">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 shrink-0">
          <CalendarDays aria-hidden="true" className="w-4 h-4" />
        </span>
        <div className="min-w-0 leading-tight">
          <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {dob.d} {MONTHS[dob.m - 1]} {dob.y}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {age === 0 ? 'Born this year' : `${age} ${age === 1 ? 'year' : 'years'} old`}
          </div>
        </div>
      </div>
    </div>
  );
}
