import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { headerBox, headerBadge } from './headerStyles';

export function LiveClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const time = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  const [clock, meridiem] = time.toUpperCase().split(' ');
  const date = now.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });

  return (
    <div
      className={`hidden lg:flex ${headerBox}`}
      title="Current Time"
    >
      <span className={headerBadge}><Clock className="w-4 h-4" /></span>
      <div className="leading-tight min-w-0">
        <div className="text-sm font-bold tabular-nums whitespace-nowrap">
          {clock} <span className="text-[10px] font-semibold opacity-90">{meridiem}</span>
        </div>
        <div className="text-[11px] font-medium text-white/90 whitespace-nowrap">{date}</div>
      </div>
    </div>
  );
}
