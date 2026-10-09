import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

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
      className="hidden lg:flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 h-11 min-w-[9.5rem]"
      title="Current Time"
    >
      <Clock className="w-4 h-4 shrink-0" />
      <div className="leading-tight">
        <div className="font-mono font-semibold text-sm tabular-nums">{time}</div>
        <div className="text-[10px] text-orange-100">{date}</div>
      </div>
    </div>
  );
}
