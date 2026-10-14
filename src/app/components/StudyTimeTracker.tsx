import { useState, useEffect, useRef } from 'react';
import { GraduationCap } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';

const todayKey = () => `jsl_study_seconds_${new Date().toISOString().slice(0, 10)}`;

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return hours > 0
    ? `${hours}h ${minutes}m`
    : `${minutes.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
}

// Automatically tracks time spent on the site today (pauses when the tab isn't visible).
export function StudyTimeTracker() {
  const { addStudySeconds, summary } = useProgress();
  const [seconds, setSeconds] = useState(() => {
    const saved = localStorage.getItem(todayKey());
    return saved ? parseInt(saved, 10) : 0;
  });
  const secondsRef = useRef(seconds);
  secondsRef.current = seconds;

  // The server is the source of truth for a signed-in student, so that time studied on
  // a phone shows up on a laptop. Adopt its count whenever it is ahead of this tab.
  useEffect(() => {
    const serverSeconds = summary?.studySecondsToday;
    if (typeof serverSeconds === 'number' && serverSeconds > secondsRef.current) {
      setSeconds(serverSeconds);
      localStorage.setItem(todayKey(), String(serverSeconds));
    }
  }, [summary?.studySecondsToday]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        setSeconds(s => {
          const next = s + 1;
          localStorage.setItem(todayKey(), String(next));
          return next;
        });
        // Batched by ProgressContext and flushed about once a minute.
        addStudySeconds(1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [addStudySeconds]);

  // Rendered inside the LiveClock panel, so it shares one frame with the time.
  return (
    <div
      className="hidden xl:flex items-center gap-2 border-l border-cyan-400/30 pl-2.5"
      title="Time spent studying today (auto-tracked)"
    >
      <GraduationCap className="w-4 h-4 shrink-0 text-cyan-300" />
      <div className="leading-tight min-w-0">
        <div
          className="font-['Orbitron',monospace] font-bold text-[12px] tabular-nums whitespace-nowrap text-cyan-200"
          style={{ textShadow: '0 0 6px rgba(103,232,249,.7)' }}
        >
          {formatDuration(seconds)}
        </div>
        <div className="text-[9px] font-medium text-cyan-100/80 whitespace-nowrap">Study time today</div>
      </div>
    </div>
  );
}
