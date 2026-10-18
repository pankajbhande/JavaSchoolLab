import { Bell, Plus, Trash2, AlarmClockOff, AlarmClock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import alarmSound from "./sounds/loud_alarm_sound.mp3";
import { useState, useEffect, useRef } from "react";
import { localDay, alarmIsDue } from "../lib/localDate";

interface AlarmType {
  id: string;
  time: string;
  label: string;
  active: boolean;
  lastRungDate: string | null;
  /** Epoch ms a snoozed alarm rings again. Separate from `time`, so snoozing never moves the daily alarm. */
  snoozeUntil?: number | null;
}

interface AlarmProps {
  isOpen: boolean;
}

const todayStr = () => localDay();

export function Alarm({ isOpen }: AlarmProps) {
  const [alarms, setAlarms] = useState<AlarmType[]>([]);
  const [newAlarmTime, setNewAlarmTime] = useState('');
  const [newAlarmLabel, setNewAlarmLabel] = useState('');
  const [ringingAlarm, setRingingAlarm] = useState<AlarmType | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    const audio = new Audio(alarmSound);
    audio.loop = true;
    audioRef.current = audio;
    return () => { audio.pause(); };
  }, []);

  // Load alarms when component mounts (migrate legacy hasRang field if present)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("alarms");
      if (saved) {
        const parsed = JSON.parse(saved);
        const migrated: AlarmType[] = (Array.isArray(parsed) ? parsed : []).map((a: any) => ({
          id: String(a.id),
          time: String(a.time),
          label: a.label || 'Study Reminder',
          active: a.active !== false,
          lastRungDate: a.lastRungDate ?? (a.hasRang ? todayStr() : null),
          snoozeUntil: typeof a.snoozeUntil === 'number' ? a.snoozeUntil : null,
        }));
        setAlarms(migrated);
      }
    } catch { /* corrupted saved alarms: start with none rather than crash the header */ }
  }, []);

  // Save alarms whenever they change
  useEffect(() => {
    try { localStorage.setItem("alarms", JSON.stringify(alarms)); } catch { /* quota or private mode */ }
  }, [alarms]);

  // Check every second whether any active alarm should ring (repeats daily)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const today = todayStr();

      setAlarms(prev => {
        let didRing = false;
        const next = prev.map(a => {
          // daily time reached (with a short grace for throttled background tabs), or a snooze ran out
          const dailyDue = alarmIsDue(a.time, now) && a.lastRungDate !== today;
          const snoozeDue = a.snoozeUntil != null && now.getTime() >= a.snoozeUntil;
          if (a.active && (dailyDue || snoozeDue)) {
            didRing = true;
            audioRef.current?.play().catch(() => {});
            setRingingAlarm(a);
            return { ...a, lastRungDate: today, snoozeUntil: null };
          }
          return a;
        });
        return didRing ? next : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const stopRinging = () => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setRingingAlarm(null);
  };

  const snoozeAlarm = () => {
    if (!ringingAlarm) return;
    // Ring again in 5 minutes without touching the alarm's own daily time
    const until = Date.now() + 5 * 60 * 1000;
    setAlarms(prev => prev.map(a =>
      a.id === ringingAlarm.id ? { ...a, snoozeUntil: until } : a
    ));
    toast('Snoozed for 5 minutes');
    stopRinging();
  };

  const addAlarm = () => {
    if (newAlarmTime) {
      const alarm: AlarmType = {
        id: Date.now().toString(),
        time: newAlarmTime,
        label: newAlarmLabel || 'Study Reminder',
        active: true,
        lastRungDate: null,
      };
      setAlarms([...alarms, alarm]);
      setNewAlarmTime('');
      setNewAlarmLabel('');
      toast.success(`Alarm set for ${newAlarmTime}`);
    }
  };

  const removeAlarm = (id: string) => {
    setAlarms(alarms.filter(a => a.id !== id));
    toast('Alarm removed');
  };

  const toggleAlarm = (id: string) => {
    setAlarms(alarms.map(a =>
      a.id === id ? { ...a, active: !a.active, snoozeUntil: null } : a
    ));
  };

  return (
    <>
      {/* Full-screen ringing alert so it can't be missed while reading */}
      <AnimatePresence>
        {ringingAlarm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            role="alertdialog"
            aria-modal="true"
            aria-label={`Alarm: ${ringingAlarm.label}`}
          >
            <motion.div
              initial={{ scale: 0.85, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-4 border-purple-500 p-8 max-w-sm w-full text-center"
            >
              <motion.div
                animate={{ rotate: [0, -15, 15, -15, 15, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center"
              >
                <AlarmClock className="w-9 h-9 text-purple-600 dark:text-purple-400" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">{ringingAlarm.label}</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">It's {ringingAlarm.time} — time for a break!</p>
              <div className="flex gap-3">
                <button
                  onClick={snoozeAlarm}
                  className="flex-1 px-4 py-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                >
                  Snooze 5 min
                </button>
                <button
                  onClick={stopRinging}
                  autoFocus
                  className="flex-1 px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <AlarmClockOff className="w-4 h-4" /> Dismiss
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl shadow-md border border-purple-200 dark:border-purple-700"
        >
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Alarms</h3>
          </div>

          <div className="space-y-2 mb-3">
            <input
              type="time"
              value={newAlarmTime}
              onChange={(e) => setNewAlarmTime(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-purple-300 dark:border-purple-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            />
            <input
              type="text"
              placeholder="Label (optional)"
              value={newAlarmLabel}
              onChange={(e) => setNewAlarmLabel(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-purple-300 dark:border-purple-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={addAlarm}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Alarm
            </motion.button>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {alarms.map((alarm) => (
              <motion.div
                key={alarm.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`flex items-center justify-between p-2 rounded-lg ${alarm.active
                  ? 'bg-white dark:bg-gray-800 border border-purple-300 dark:border-purple-600'
                  : 'bg-gray-200 dark:bg-gray-700 opacity-50'
                  }`}
              >
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 dark:text-gray-200">{alarm.time}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{alarm.label}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAlarm(alarm.id)}
                    className={`px-3 py-1 rounded text-sm ${alarm.active
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-400 text-white'
                      }`}
                  >
                    {alarm.active ? 'ON' : 'OFF'}
                  </button>
                  <button
                    onClick={() => removeAlarm(alarm.id)}
                    className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {alarms.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-4">
              No alarms set
            </div>
          )}
        </motion.div>
      )}
    </>
  );
}
