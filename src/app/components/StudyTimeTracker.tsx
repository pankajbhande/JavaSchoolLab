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

  return (
    <div
      className="hidden xl:flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 h-11 min-w-[9.5rem]"
      title="Time spent studying today (auto-tracked)"
    >
      <GraduationCap className="w-4 h-4 shrink-0" />
      <div className="leading-tight">
        <div className="font-mono font-semibold text-sm tabular-nums">{formatDuration(seconds)}</div>
        <div className="text-[10px] text-orange-100">Study time today</div>
      </div>
    </div>
  );
}
