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
  const date = now.toLocaleDateString('en-IN', {
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
        <div className="font-mono font-bold text-xs tabular-nums whitespace-nowrap">{time}</div>
        <div className="text-[11px] text-orange-100">{date}</div>
      </div>
    </div>
  );
}
