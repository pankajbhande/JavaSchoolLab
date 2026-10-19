import { Search, Moon, Sun, LogIn, LogOut, User, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import logo from '../../assets/logo1.jpg';
import { Alarm } from './Alarm';
import { Timer, useStudyTimer, formatTimer } from './Timer';
import { LiveClock } from './LiveClock';
import { StudyTimeTracker } from './StudyTimeTracker';
import { useTheme } from './ThemeProvider';
import { headerBox, headerBadge, headerIconBtn } from './headerStyles';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Avatar';
import { LoginModal } from './LoginModal';
import { motion } from 'motion/react';
import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { Timer as TimerIcon } from "lucide-react";

interface HeaderProps {
  onToggleSpeech: () => void;
  isSpeaking: boolean;
  onSearch?: (query: string) => void;
  showSearch?: boolean;
  voiceGender: 'male' | 'female';
  onVoiceChange: (gender: 'male' | 'female') => void;
  /** Opens the command palette; when given, the header shows the Search button. */
  onOpenSearch?: () => void;
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);

export function Header({ onToggleSpeech, isSpeaking, onSearch, showSearch = true, voiceGender, onVoiceChange, onOpenSearch }: HeaderProps) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, isLoggedIn, isGuest, logout } = useAuth();
  const [showAlarm, setShowAlarm] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  // Owned here, not by the panel, so the timer keeps running while the panel is closed.
  const studyTimer = useStudyTimer();
  const timerActive = studyTimer.isRunning || studyTimer.seconds > 0;
  const alarmRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<HTMLDivElement>(null);

  // Close the alarm / timer panels when the user clicks anywhere else or presses Escape.
  useEffect(() => {
    if (!showAlarm && !showTimer) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (showAlarm && !alarmRef.current?.contains(target)) setShowAlarm(false);
      if (showTimer && !timerRef.current?.contains(target)) setShowTimer(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setShowAlarm(false); setShowTimer(false); }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [showAlarm, showTimer]);

  return (
    <>
      <header className="bg-gradient-to-r from-[#ff5500] to-[#ff9a0a] dark:from-orange-800 dark:to-amber-700 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto max-w-[1200px] px-3 sm:px-4 py-3 sm:py-3.5 flex flex-wrap items-center justify-between gap-y-2">
          <motion.div
            className="flex items-center gap-2 sm:gap-4 min-w-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <img src={logo} alt="JavaSchoolLab Logo" className="h-9 w-9 sm:h-12 sm:w-12 object-contain rounded-xl bg-white/90 p-0.5 shadow-md shadow-black/15 ring-1 ring-white/40" />
            <div className="min-w-0 leading-tight">
              <h1 className="font-bold text-lg sm:text-2xl tracking-tight truncate drop-shadow-sm">JavaSchoolLab</h1>
              <p className="hidden sm:block text-[13px] text-white/90 truncate">Learn Java, Python, React & More</p>
            </div>
          </motion.div>

          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            {showSearch && <label className={`hidden md:flex w-56 cursor-text focus-within:bg-white/25 focus-within:ring-white/60 ${headerBox}`}>
              <span className={headerBadge}><Search className="w-4 h-4" /></span>
              <input
                id="global-search-input"
                type="text"
                placeholder="Search topics... (Press /)"
                className="bg-transparent border-none outline-none text-sm text-white placeholder-white/80 w-full min-w-0"
                aria-label="Search topics"
                onChange={(e) => onSearch?.(e.target.value)}
              />
            </label>}

            {/* Command palette trigger: replaces the old inline search box. One button so the
                tour has a single target; the label collapses to an icon on phones. */}
            {onOpenSearch && (
              <button
                type="button"
                data-tour="search"
                onClick={onOpenSearch}
                aria-label="Search courses and lessons"
                aria-keyshortcuts="Control+K Meta+K"
                title="Search (Ctrl K)"
                className={`${headerBox} !px-0 w-10 justify-center md:!px-3 md:w-auto md:min-w-[11rem] md:justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white`}
              >
                <span className="flex items-center gap-2">
                  <Search className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden md:inline text-sm text-white/90">Search</span>
                </span>
                <kbd className="hidden md:inline rounded-md bg-white/20 px-1.5 py-0.5 text-[11px] font-semibold text-white/95">{isMac ? '⌘ K' : 'Ctrl K'}</kbd>
              </button>
            )}

            {/* Live current time */}
            <LiveClock />

            {/* Auto-tracked study time, own frame */}
            <StudyTimeTracker />

            {/* Alarm — kept mounted so reminders still ring while the panel is closed */}
            <div className="relative" ref={alarmRef}>
              <button
                onClick={() => setShowAlarm(!showAlarm)}
                className={headerIconBtn}
                title="Alarms"
                aria-label="Alarms"
                aria-expanded={showAlarm}
              >
                <Bell className="w-5 h-5" />
              </button>
              <div className={showAlarm ? 'absolute right-0 mt-3 w-72 z-50' : ''}>
                <Alarm isOpen={showAlarm} />
              </div>
            </div>

            {/* Timer */}
            <div className="relative" ref={timerRef}>
              <button
                onClick={() => setShowTimer(!showTimer)}
                className={`${headerIconBtn} relative`}
                title={timerActive ? `Timer ${studyTimer.isRunning ? 'running' : 'paused'}: ${formatTimer(studyTimer.seconds)}` : 'Timer'}
                aria-label={timerActive ? `Timer, ${studyTimer.isRunning ? 'running' : 'paused'} at ${formatTimer(studyTimer.seconds)}` : 'Timer'}
                aria-expanded={showTimer}
              >
                <TimerIcon className="w-5 h-5" />
                {/* A running timer is visible even with the panel closed */}
                {timerActive && (
                  <span
                    aria-hidden="true"
                    className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-full px-1.5 py-px font-mono text-[9px] font-bold leading-none shadow ring-1 ring-black/10 ${studyTimer.isRunning ? 'bg-emerald-500 text-white' : 'bg-white text-orange-700'}`}
                  >
                    {formatTimer(studyTimer.seconds).replace(/^00:/, '')}
                  </span>
                )}
              </button>
              {showTimer && (
                <div className="absolute right-0 mt-3 w-72">
                  <Timer timer={studyTimer} />
                </div>
              )}
            </div>

            {/* Robo Guru (speak / stop, voice choice and the speaking state) lives in the reading pane, not in this bar. */}

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className={headerIconBtn}
              title="Toggle Theme"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>

            {/* User / Login Button */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 h-11 bg-white/15 ring-1 ring-white/25 backdrop-blur-md rounded-xl px-3 hover:bg-white/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  aria-label="Account menu"
                  aria-haspopup="menu"
                  aria-expanded={showUserMenu}
                >
                  <Avatar src={user?.avatar} name={user?.fullName ?? ''} className="w-7 h-7 text-sm" />
                  <span className="text-sm font-medium hidden lg:block">{user?.fullName?.split(' ')[0]}</span>
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                      <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{user?.fullName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || user?.mobile}</p>
                      </div>
                      <button
                        onClick={() => { navigate('/account'); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-gray-700 transition-all text-sm"
                      >
                        <User className="w-4 h-4" /> My Account
                      </button>
                      <button
                        onClick={() => { logout(); setShowUserMenu(false); toast('Logged out'); }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-sm"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : isGuest ? (
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center gap-2 h-11 bg-white/15 ring-1 ring-white/25 backdrop-blur-md rounded-xl px-3 hover:bg-white/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <User className="w-5 h-5" />
                <span className="text-sm font-medium hidden lg:block">Guest</span>
              </button>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center gap-2 bg-white text-orange-600 rounded-xl px-4 h-11 font-semibold shadow-sm hover:bg-orange-50 transition-all text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-orange-600"
              >
                <LogIn className="w-4 h-4" /> Login
              </button>
            )}
          </div>
        </div>
      </header>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
