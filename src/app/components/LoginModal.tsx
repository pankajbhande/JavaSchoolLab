import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Phone, User, Lock, Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { registerWithOtp, loginUser, loginWithOtp, sendOtp, verifyOtp } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ScrollDatePicker } from './ScrollDatePicker';

interface LoginModalProps {
  onClose: () => void;
  message?: string;
}

export function LoginModal({ onClose, message }: LoginModalProps) {
  const { login, loginAsGuest } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');
  const [loginType, setLoginType] = useState<'email' | 'mobile'>('email');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [organization, setOrganization] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP state
  const [otpStep, setOtpStep] = useState<'input' | 'verify'>('input');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [devOtp, setDevOtp] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Esc closes the modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const identifier = loginType === 'email' ? email.trim() : mobile.trim();

  const handleSendOtp = async () => {
    if (!identifier) {
      setError(`Please enter your ${loginType}`);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const purpose = mode === 'register' ? 'register' : 'login';
      const res = await sendOtp({ identifier, identifierType: loginType, purpose });
      setOtpSent(true);
      setOtpStep('verify');
      setCountdown(300); // 5 minutes
      if (res._dev_otp) setDevOtp(res._dev_otp);
      toast.success(`OTP sent to your ${loginType}`);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => { if (index + i < 6) newOtp[index + i] = d; });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      otpRefs.current[nextIndex]?.focus();
      return;
    }

    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const purpose = mode === 'register' ? 'register' : 'login';
      await verifyOtp({ identifier, identifierType: loginType, otp: otpCode, purpose });
      setOtpVerified(true);

      // For OTP login (passwordless), auto-login after verification
      if (mode === 'login' && authMethod === 'otp') {
        const res = await loginWithOtp({
          email: loginType === 'email' ? email.trim() : undefined,
          mobile: loginType === 'mobile' ? mobile.trim() : undefined,
          loginType,
          otp: otpCode
        });
        login(res.token, res.user);
        toast.success(`Welcome back, ${res.user.fullName?.split(' ')[0] || 'there'}!`);
        onClose();
        return;
      }
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
      toast.error(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!fullName.trim()) { setError('Full name is required'); setLoading(false); return; }
        if (!otpVerified) { setError('Please verify OTP first'); setLoading(false); return; }
        const otpCode = otp.join('');
        const res = await registerWithOtp({
          fullName: fullName.trim(),
          email: loginType === 'email' ? email.trim() : undefined,
          mobile: loginType === 'mobile' ? mobile.trim() : undefined,
          password,
          loginType,
          otp: otpCode,
          gender: gender || undefined,
          dob: dob || undefined,
          organization: organization.trim() || undefined
        });
        login(res.token, res.user);
        toast.success(`Account created — welcome, ${res.user.fullName?.split(' ')[0] || 'there'}!`);
        onClose();
      } else {
        // Password-based login
        const res = await loginUser({
          email: loginType === 'email' ? email.trim() : undefined,
          mobile: loginType === 'mobile' ? mobile.trim() : undefined,
          password,
          loginType
        });
        login(res.token, res.user);
        toast.success(`Welcome back, ${res.user.fullName?.split(' ')[0] || 'there'}!`);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    loginAsGuest();
    toast('Continuing as guest — sign up anytime to save your progress.');
    onClose();
  };

  const resetOtp = () => {
    setOtpStep('input');
    setOtp(['', '', '', '', '', '']);
    setOtpSent(false);
    setOtpVerified(false);
    setDevOtp('');
    setCountdown(0);
    setError('');
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError('');
    resetOtp();
    setAuthMethod('password');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-white">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-white/80 text-sm mt-1">
              {message || (mode === 'login' ? 'Login to access all features' : 'Register with OTP verification')}
            </p>
          </div>

          <div className="p-6">
            {/* Login Type Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-4">
              <button
                onClick={() => { setLoginType('email'); resetOtp(); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                  loginType === 'email'
                    ? 'bg-white dark:bg-gray-600 shadow text-orange-600 dark:text-orange-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <Mail className="w-4 h-4" /> Email
              </button>
              <button
                onClick={() => { setLoginType('mobile'); resetOtp(); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                  loginType === 'mobile'
                    ? 'bg-white dark:bg-gray-600 shadow text-orange-600 dark:text-orange-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <Phone className="w-4 h-4" /> Mobile
              </button>
            </div>

            {/* OTP Verify Screen */}
            {otpStep === 'verify' && !otpVerified && (
              <div className="space-y-4">
                <button onClick={resetOtp} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-3">
                    <ShieldCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Enter OTP</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    OTP sent to <span className="font-medium text-gray-700 dark:text-gray-300">{identifier}</span>
                  </p>
                </div>

                {/* Dev OTP display */}
                {devOtp && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-center">
                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Development Mode - Your OTP:</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 tracking-[0.3em]">{devOtp}</p>
                  </div>
                )}

                {/* OTP Input */}
                <div className="flex justify-center gap-2">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      onPaste={e => {
                        e.preventDefault();
                        const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                        handleOtpChange(0, paste);
                      }}
                      className="w-11 h-12 text-center text-xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    />
                  ))}
                </div>

                {/* Timer */}
                {countdown > 0 && (
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Expires in <span className="font-medium text-orange-600">{Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</span>
                  </p>
                )}

                {/* Resend */}
                {countdown <= 0 && otpSent && (
                  <button onClick={handleSendOtp} className="w-full text-center text-sm text-orange-600 dark:text-orange-400 font-medium hover:underline">
                    Resend OTP
                  </button>
                )}

                {error && <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">{error}</p>}

                <button
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.join('').length !== 6}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            )}

            {/* OTP Verified + Complete Registration */}
            {otpVerified && mode === 'register' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-700 dark:text-green-300 font-medium">OTP Verified Successfully</span>
                </div>

                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" required />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showPassword ? 'text' : 'password'} placeholder="Create Password" value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" required minLength={4} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Gender</label>
                  <div className="flex gap-2">
                    {(['male', 'female', 'other'] as const).map(g => (
                      <button key={g} type="button" onClick={() => setGender(g)}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                          gender === g
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}>
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Date of Birth</label>
                  <ScrollDatePicker value={dob || '2000-01-01'} onChange={setDob} minYear={1930} maxYear={new Date().getFullYear()} />
                </div>

                {/* College / Company */}
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5 ml-1">College / Company Name</label>
                  <input type="text" placeholder="Enter your college or company" value={organization} onChange={e => setOrganization(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                </div>

                {error && <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">{error}</p>}

                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50">
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            )}

            {/* Main Input Form (not in OTP verify step) */}
            {otpStep === 'input' && !otpVerified && (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email or Mobile */}
                  <div className="relative">
                    {loginType === 'email' ? (
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    ) : (
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    )}
                    <input
                      type={loginType === 'email' ? 'email' : 'tel'}
                      placeholder={loginType === 'email' ? 'Email Address' : 'Mobile Number'}
                      value={loginType === 'email' ? email : mobile}
                      onChange={e => loginType === 'email' ? setEmail(e.target.value) : setMobile(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  {/* Login mode: show password + OTP option */}
                  {mode === 'login' && authMethod === 'password' && (
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" required minLength={4} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  )}

                  {error && <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">{error}</p>}

                  {/* Submit button */}
                  {mode === 'login' && authMethod === 'password' && (
                    <button type="submit" disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50">
                      {loading ? 'Please wait...' : 'Login with Password'}
                    </button>
                  )}

                  {/* OTP button for login */}
                  {mode === 'login' && authMethod === 'otp' && (
                    <button type="button" onClick={handleSendOtp} disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50">
                      {loading ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                  )}

                  {/* Register: always send OTP first */}
                  {mode === 'register' && (
                    <button type="button" onClick={handleSendOtp} disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      <ShieldCheck className="w-5 h-5" />
                      {loading ? 'Sending OTP...' : 'Send OTP to Verify'}
                    </button>
                  )}
                </form>

                {/* Login method toggle */}
                {mode === 'login' && (
                  <button
                    onClick={() => { setAuthMethod(authMethod === 'password' ? 'otp' : 'password'); setError(''); }}
                    className="w-full text-center text-sm text-orange-600 dark:text-orange-400 font-medium hover:underline mt-3"
                  >
                    {authMethod === 'password' ? 'Login with OTP instead' : 'Login with Password instead'}
                  </button>
                )}

                {/* Toggle Login/Register */}
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                    className="text-orange-600 dark:text-orange-400 font-semibold hover:underline">
                    {mode === 'login' ? 'Register' : 'Login'}
                  </button>
                </p>

                {/* Guest */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button onClick={handleGuest}
                    className="w-full py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                    Continue as Guest
                  </button>
                  <p className="text-xs text-center text-gray-400 mt-2">Guest users cannot download certificates</p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
