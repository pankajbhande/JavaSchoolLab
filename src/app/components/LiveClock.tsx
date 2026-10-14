import { useState, useEffect } from 'react';
import { headerBox } from './headerStyles';
import { StudyTimeTracker } from './StudyTimeTracker';

const pad = (n: number) => String(n).padStart(2, '0');

// Futuristic digital readout (clock + study time in one frame): a dark HUD panel with neon-cyan digits, a faint scanline
// texture, a live LED and a seconds bar that fills across each minute.
export function LiveClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const h24 = now.getHours();
  const hours = pad(h24 % 12 === 0 ? 12 : h24 % 12);
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());
  const meridiem = h24 >= 12 ? 'PM' : 'AM';
  const date = now.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' });
  const colon = <span className="digital-colon text-cyan-300/80">:</span>;

  return (
    <div
      className={`hidden lg:flex ${headerBox} !px-2`}
      title="Current Time"
      role="timer"
      aria-label={`${hours}:${minutes}:${seconds} ${meridiem}`}
    >
      <div
        className="relative overflow-hidden flex items-center gap-2.5 h-9 rounded-lg px-3 bg-slate-950/90 ring-1 ring-cyan-400/60"
        style={{
          boxShadow: '0 0 12px rgba(34,211,238,.35), inset 0 0 10px rgba(34,211,238,.12)',
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(34,211,238,.06) 0 1px, transparent 1px 3px)',
        }}
        aria-hidden="true"
      >
        <span className="digital-led w-1.5 h-1.5 rounded-full bg-cyan-300 shrink-0" />
        <div
          className="font-['Orbitron',monospace] font-bold text-[18px] leading-none tabular-nums whitespace-nowrap text-cyan-200"
          style={{ textShadow: '0 0 6px rgba(103,232,249,.9), 0 0 16px rgba(34,211,238,.6)' }}
        >
          {hours}{colon}{minutes}{colon}
          <span className="text-fuchsia-300" style={{ textShadow: '0 0 6px rgba(240,171,252,.9), 0 0 14px rgba(217,70,239,.6)' }}>
            {seconds}
          </span>
        </div>
        <div className="leading-tight text-center border-l border-cyan-400/30 pl-2.5">
          <div className="font-['Orbitron',monospace] text-[10px] font-bold text-cyan-300">{meridiem}</div>
          <div className="text-[9px] font-medium text-cyan-100/80 whitespace-nowrap">{date}</div>
        </div>
        <StudyTimeTracker />
        {/* Seconds bar: fills over the minute, then restarts. */}
        <span
          className="absolute left-0 bottom-0 h-[2px] bg-gradient-to-r from-cyan-400 to-fuchsia-400 transition-[width] duration-1000 ease-linear"
          style={{ width: `${((now.getSeconds() + 1) / 60) * 100}%` }}
        />
      </div>
    </div>
  );
}
