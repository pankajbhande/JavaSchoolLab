import { useState, useRef, useEffect } from 'react';

interface ScrollDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  minYear?: number;
  maxYear?: number;
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const ITEM_H = 38;

function Column({ items, selected, onSelect, label }: {
  items: string[];
  selected: number;
  onSelect: (i: number) => void;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const settling = useRef(false);

  // Scroll to selected on mount & when selected changes externally
  useEffect(() => {
    if (ref.current && !settling.current) {
      ref.current.scrollTop = selected * ITEM_H;
    }
  }, [selected]);

  const snapToNearest = () => {
    if (!ref.current) return;
    const top = ref.current.scrollTop;
    const idx = Math.round(top / ITEM_H);
    const clamped = Math.max(0, Math.min(idx, items.length - 1));
    settling.current = true;
    ref.current.scrollTo({ top: clamped * ITEM_H, behavior: 'smooth' });
    onSelect(clamped);
    setTimeout(() => { settling.current = false; }, 200);
  };

  // Use a timeout to detect scroll-end
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const handleScroll = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(snapToNearest, 120);
  };

  const move = (delta: number) => {
    const next = Math.max(0, Math.min(selected + delta, items.length - 1));
    onSelect(next);
    ref.current?.scrollTo({ top: next * ITEM_H, behavior: 'smooth' });
  };

  return (
    <div className="flex-1 flex flex-col items-center min-w-0">
      <span className="text-[9px] text-gray-400 mb-1 font-semibold uppercase tracking-wider">{label}</span>
      <div className="relative w-full" style={{ height: ITEM_H * 5 }}>
        {/* Center highlight — sits behind the list text (z-0) so the selected value stays visible */}
        <div className="absolute left-1 right-1 rounded-lg bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-400 dark:border-orange-500 pointer-events-none z-0"
          style={{ top: ITEM_H * 2, height: ITEM_H }} />

        <div
          ref={ref}
          onScroll={handleScroll}
          role="listbox"
          aria-label={label}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
            else if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
          }}
          className="relative z-10 h-full overflow-y-scroll scrollbar-hide focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded-lg"
          style={{ scrollBehavior: 'auto' }}
        >
          {/* Top spacer (2 items) */}
          <div style={{ height: ITEM_H * 2 }} />

          {items.map((item, i) => {
            const distance = Math.abs(i - selected);
            const isSelected = i === selected;
            return (
              <div
                key={`${item}-${i}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => move(i - selected)}
                className={`flex items-center justify-center cursor-pointer select-none transition-all duration-150 ${
                  isSelected
                    ? 'text-orange-600 dark:text-orange-400 font-bold'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
                style={{
                  height: ITEM_H,
                  fontSize: isSelected ? '16px' : '13px',
                  opacity: isSelected ? 1 : Math.max(0.35, 1 - distance * 0.3),
                  transform: `scale(${isSelected ? 1 : Math.max(0.85, 1 - distance * 0.06)})`,
                }}
              >
                {item}
              </div>
            );
          })}

          {/* Bottom spacer (2 items) */}
          <div style={{ height: ITEM_H * 2 }} />
        </div>

        {/* Top/bottom fade — above the list but doesn't reach the center row */}
        <div className="absolute top-0 left-0 right-0 h-[76px] bg-gradient-to-b from-white dark:from-gray-800 via-white/80 dark:via-gray-800/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-[76px] bg-gradient-to-t from-white dark:from-gray-800 via-white/80 dark:via-gray-800/80 to-transparent z-20 pointer-events-none" />
      </div>
    </div>
  );
}

export function ScrollDatePicker({ value, onChange, minYear = 1930, maxYear }: ScrollDatePickerProps) {
  const max = maxYear || new Date().getFullYear();
  const years = Array.from({ length: max - minYear + 1 }, (_, i) => String(minYear + i));

  const parsed = value ? new Date(value + 'T00:00:00') : new Date(2000, 0, 1);
  const [month, setMonth] = useState(parsed.getMonth());
  const [day, setDay] = useState(parsed.getDate() - 1);
  const [yearIdx, setYearIdx] = useState(Math.max(0, years.indexOf(String(parsed.getFullYear()))));

  const year = parseInt(years[yearIdx] || '2000');
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, '0'));

  // Clamp day if month/year changes
  const clampedDay = Math.min(day, daysInMonth - 1);

  useEffect(() => {
    if (day !== clampedDay) setDay(clampedDay);
    const m = String(month + 1).padStart(2, '0');
    const d = String(clampedDay + 1).padStart(2, '0');
    onChange(`${year}-${m}-${d}`);
  }, [month, clampedDay, yearIdx]);

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 p-2">
      <div className="flex gap-1">
        <Column items={MONTHS} selected={month} onSelect={setMonth} label="Month" />
        <Column items={days} selected={clampedDay} onSelect={setDay} label="Day" />
        <Column items={years} selected={yearIdx} onSelect={setYearIdx} label="Year" />
      </div>
      <div className="text-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Selected: <span className="font-semibold text-orange-600 dark:text-orange-400">
            {MONTHS[month]} {String(clampedDay + 1).padStart(2, '0')}, {year}
          </span>
        </span>
      </div>
    </div>
  );
}
