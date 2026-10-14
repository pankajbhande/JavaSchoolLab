import { Volume2, VolumeX, Search, Moon, Sun, LogIn, LogOut, User, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import logo from '../../assets/logo1.jpg';
import { Alarm } from './Alarm';
import { Timer } from './Timer';
import { LiveClock } from './LiveClock';
import { StudyTimeTracker } from './StudyTimeTracker';
import { useTheme } from './ThemeProvider';
import { headerBox, headerBadge, headerIconBtn } from './headerStyles';
import { useAuth } from '../context/AuthContext';
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
}

export function Header({ onToggleSpeech, isSpeaking, onSearch, showSearch = true, voiceGender, onVoiceChange }: HeaderProps) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, isLoggedIn, isGuest, logout } = useAuth();
  const [showAlarm, setShowAlarm] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
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
            <img src={logo} alt="JavaSchoolLab Logo" className="h-9 w-9 sm:h-12 sm:w-12 object-contain" />
            <div>
              <h1 className="font-bold text-lg sm:text-2xl">JavaSchoolLab</h1>
              <p className="text-sm text-orange-100">Learn to code, step by step</p>
            </div>
          </motion.div>

          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            {showSearch && <label className={`hidden md:flex w-56cursor-text focus-within:bg-white/25 focus-within:ring-white/60 ${headerBox}`}>
              <span className={headerBadge}><Search className="w-4 h-4" /></span>
              <input
                id="global-search-input"
                type="text"
                placeholder="Search topics... (Press /)"
                className="bg-transparent border-none outline-none text-sm text-white placeholder-orange-100 w-full min-w-0"
                aria-label="Search topics"
                onChange={(e) => onSearch?.(e.target.value)}
              />
            </label>}

            {/* Live current time */}
            <LiveClock />

            {/* Auto-tracked study time */}
            <StudyTimeTracker />

            {/* Alarm — kept mounted so reminders still ring while the panel is closed */}
            <div className="relative" ref={alarmRef}>
              <button
                onClick={() => setShowAlarm(!showAlarm)}
                className={headerIconBtn}
                title="Alarms"
                aria-label="Alarms"
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
                className={headerIconBtn}
                title="Timer"
                aria-label="Timer"
              >
                <TimerIcon className="w-5 h-5" />
              </button>
              {showTimer && (
                <div className="absolute right-0 mt-3 w-72">
                  <Timer />
                </div>
              )}
            </div>

            {/* Voice Gender Selection. Hidden on phones: it pushed the header to a third
                wrapped row, and the reading pane carries its own voice picker anyway. */}
            <div className="hidden 2xl:flex items-center h-12 bg-white/15 ring-1 ring-white/25 backdrop-blur-md rounded-xl p-1">
              <button
                onClick={() => onVoiceChange('female')}
                className={`px-3 py-1 rounded text-sm transition-all ${voiceGender === 'female'
                  ? 'bg-white text-orange-600 font-semibold'
                  : 'text-white hover:bg-white/10'
                  }`}
                title="Female Voice"
                aria-label="Female Voice"
              >
                Female
              </button>
              <button
                onClick={() => onVoiceChange('male')}
                className={`px-3 py-1 rounded text-sm transition-all ${voiceGender === 'male'
                  ? 'bg-white text-orange-600 font-semibold'
                  : 'text-white hover:bg-white/10'
                  }`}
                title="Male Voice"
                aria-label="Male Voice"
              >
                Male
              </button>
            </div>

            {/* Indian Robo Voice */}
            <div className="relative flex items-center">
              {isSpeaking && (
                <motion.div
                  initial={{ opacity: 0, x: 10, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute right-full mr-2 flex items-center gap-1.5 bg-white rounded-full pl-1 pr-3 py-1 shadow-lg whitespace-nowrap"
                >
                  <div className="relative w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 via-white to-green-600 flex items-center justify-center shrink-0 border-2 border-orange-500">
                    <Bot className="w-4 h-4 text-gray-700" />
                    <motion.span
                      animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.15, 0.6] }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-0 rounded-full bg-orange-400"
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-orange-600">Robo Guru speaking…</span>
                  <div className="flex items-end gap-[2px] h-3">
                    {[0, 1, 2].map(i => (
                      <motion.span
                        key={i}
                        animate={{ height: ['30%', '100%', '30%'] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                        className="w-[3px] bg-green-600 rounded-full"
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onToggleSpeech}
                className={`${headerIconBtn} ${isSpeaking
                  ? '!bg-white text-orange-600 animate-pulse'
                  : ''
                  }`}
                title={isSpeaking ? 'Stop Robo Voice' : 'Listen with Indian Robo Voice'}
                aria-label={isSpeaking ? 'Stop Robo Voice' : 'Listen with Indian Robo Voice'}
              >
                {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </motion.button>
            </div>

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
                  className="flex items-center gap-2 h-12 bg-white/15 ring-1 ring-white/25 backdrop-blur-md rounded-xl px-3 hover:bg-white/25 transition-colors"
                  aria-label="Account menu"
                >
                  <div className="w-7 h-7 bg-white text-orange-600 rounded-full flex items-center justify-center font-bold text-sm">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </div>
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
                className="flex items-center gap-2 h-12 bg-white/15 ring-1 ring-white/25 backdrop-blur-md rounded-xl px-3 hover:bg-white/25 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="text-sm font-medium hidden lg:block">Guest</span>
              </button>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center gap-2 bg-white text-orange-600 rounded-lg px-4 h-10 font-semibold hover:bg-orange-50 transition-all text-sm"
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
