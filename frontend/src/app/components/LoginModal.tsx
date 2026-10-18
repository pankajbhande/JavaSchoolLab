import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { X, Mail, Phone, User, Lock, Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { registerWithOtp, loginUser, loginWithOtp, sendOtp, verifyOtp } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ScrollDatePicker } from './ScrollDatePicker';
import { GoogleSignInButton } from './GoogleSignInButton';

const FIELD = 'w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 outline-none aria-[invalid=true]:border-red-500 disabled:opacity-60';
const FOCUS = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600';

interface LoginModalProps {
  onClose: () => void;
  message?: string;
}

export function LoginModal({ onClose, message }: LoginModalProps) {
  const { login, loginAsGuest } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');
  const [loginType] = useState<'email' | 'mobile'>('email');   // email only; see the note above the form
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
  const dialogRef = useRef<HTMLDivElement>(null);
  const [touched, setTouched] = useState({ identifier: false, password: false, name: false });

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Esc closes the modal; Tab is kept inside it; focus returns to the opener on close.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const first = dialogRef.current?.querySelector<HTMLElement>('input');
    first?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'))
        .filter(el => el.offsetParent !== null);
      if (items.length === 0) return;
      const firstEl = items[0], lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
      else if (!dialogRef.current.contains(document.activeElement)) { e.preventDefault(); firstEl.focus(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => { window.removeEventListener('keydown', handleKeyDown); opener?.focus?.(); };
  }, [onClose]);

  const identifier = loginType === 'email' ? email.trim() : mobile.trim();

  // Inline validation messages (shown after a field is touched).
  const identifierError = !identifier
    ? `Enter your ${loginType === 'email' ? 'email address' : 'mobile number'}`
    : loginType === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)
      ? 'Enter a valid email address, like name@example.com'
      : loginType === 'mobile' && identifier.replace(/\D/g, '').length < 7
        ? 'Enter a valid mobile number'
        : '';
  const passwordError = password.length === 0 ? 'Enter your password' : password.length < 4 ? 'Password must be at least 4 characters' : '';
  const nameError = fullName.trim() ? '' : 'Full name is required';
  const touch = (k: keyof typeof touched) => setTouched(t => ({ ...t, [k]: true }));

  const handleSendOtp = async () => {
    if (identifierError) {
      touch('identifier');
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
    if (mode === 'login' && (identifierError || passwordError)) {
      setTouched(t => ({ ...t, identifier: true, password: true }));
      return;
    }
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!fullName.trim() || password.length < 4) { setTouched(t => ({ ...t, name: true, password: true })); setLoading(false); return; }
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
    <MotionConfig reducedMotion="user">
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
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-modal-title"
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto overscroll-contain"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-6 relative">
            <button type="button" aria-label="Close" onClick={onClose} className={`absolute top-3 right-3 p-2 rounded-full text-white/90 hover:text-white hover:bg-white/20 ${FOCUS} focus-visible:outline-white`}>
              <X className="w-5 h-5" />
            </button>
            <h2 id="login-modal-title" className="text-2xl font-bold text-white pr-8">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-white/95 text-sm mt-1">
              {message || (mode === 'login' ? 'Login to access all features' : 'Register with OTP verification')}
            </p>
          </div>

          <div className="p-6">
            {/* Sign-up and sign-in are email only (the server rejects mobile numbers), so there is no Email/Mobile switch. */}

            {/* OTP Verify Screen */}
            {otpStep === 'verify' && !otpVerified && (
              <div className="space-y-4">
                <button type="button" onClick={resetOtp} className={`${FOCUS} flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded`}>
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-3">
                    <ShieldCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Enter OTP</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
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
                      autoComplete={i === 0 ? 'one-time-code' : 'off'}
                      aria-label={`OTP digit ${i + 1} of 6`}
                      aria-invalid={!!error}
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      onPaste={e => {
                        e.preventDefault();
                        const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                        handleOtpChange(0, paste);
                      }}
                      className="w-10 sm:w-11 h-12 text-center text-xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 outline-none transition-all"
                    />
                  ))}
                </div>

                {/* Timer */}
                {countdown > 0 && (
                  <p className="text-center text-sm text-gray-600 dark:text-gray-300">
                    Expires in <span className="font-medium text-orange-700 dark:text-orange-300">{Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</span>
                  </p>
                )}

                {/* Resend */}
                {countdown <= 0 && otpSent && (
                  <button type="button" onClick={handleSendOtp} className={`${FOCUS} w-full text-center text-sm text-orange-700 dark:text-orange-300 font-medium hover:underline rounded`}>
                    Resend OTP
                  </button>
                )}

                {error && <p role="alert" className="text-red-700 dark:text-red-300 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-2.5 rounded-lg">{error}</p>}

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.join('').length !== 6}
                  className={`w-full py-3 bg-gradient-to-r from-green-700 to-emerald-700 text-white font-semibold rounded-lg hover:from-green-800 hover:to-emerald-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${FOCUS}`}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            )}

            {/* OTP Verified + Complete Registration */}
            {otpVerified && mode === 'register' && (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-700 dark:text-green-300 font-medium">OTP Verified Successfully</span>
                </div>

                <div>
                  <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Full name</label>
                  <div className="relative">
                    <User aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <input id="reg-name" type="text" placeholder="Your full name" autoComplete="name" value={fullName}
                      onChange={e => setFullName(e.target.value)} onBlur={() => touch('name')}
                      aria-invalid={touched.name && !!nameError} aria-describedby={touched.name && nameError ? 'reg-name-err' : undefined}
                      className={`${FIELD} pl-10 pr-4 py-3`} required />
                  </div>
                  {touched.name && nameError && <p id="reg-name-err" className="mt-1 text-xs text-red-700 dark:text-red-300">{nameError}</p>}
                </div>

                <div>
                  <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Password</label>
                  <div className="relative">
                    <Lock aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <input id="reg-password" type={showPassword ? 'text' : 'password'} placeholder="At least 4 characters" autoComplete="new-password" value={password}
                      onChange={e => setPassword(e.target.value)} onBlur={() => touch('password')}
                      aria-invalid={touched.password && !!passwordError} aria-describedby={touched.password && passwordError ? 'reg-password-err' : undefined}
                      className={`${FIELD} pl-10 pr-12 py-3`} required minLength={4} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}
                      className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white ${FOCUS}`}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {touched.password && passwordError && <p id="reg-password-err" className="mt-1 text-xs text-red-700 dark:text-red-300">{passwordError}</p>}
                </div>

                {/* Gender */}
                <div>
                  <span id="reg-gender" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Gender <span className="font-normal text-gray-600 dark:text-gray-400">(optional)</span></span>
                  <div role="group" aria-labelledby="reg-gender" className="flex gap-2">
                    {(['male', 'female', 'other'] as const).map(g => (
                      <button key={g} type="button" aria-pressed={gender === g} onClick={() => setGender(g)}
                        className={`${FOCUS} flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                          gender === g
                            ? 'bg-orange-600 text-white border-orange-600'
                            : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}>
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Date of birth</span>
                  <ScrollDatePicker value={dob || '2000-01-01'} onChange={setDob} minYear={1930} maxYear={new Date().getFullYear()} />
                </div>

                {/* College / Company */}
                <div>
                  <label htmlFor="reg-org" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">College / Company name <span className="font-normal text-gray-600 dark:text-gray-400">(optional)</span></label>
                  <input id="reg-org" type="text" autoComplete="organization" placeholder="Enter your college or company" value={organization} onChange={e => setOrganization(e.target.value)}
                    className={`${FIELD} px-4 py-3`} />
                </div>

                {error && <p role="alert" className="text-red-700 dark:text-red-300 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-2.5 rounded-lg">{error}</p>}

                <button type="submit" disabled={loading}
                  className={`w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-amber-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${FOCUS}`}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            )}

            {/* Main Input Form (not in OTP verify step) */}
            {otpStep === 'input' && !otpVerified && (
              <>
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  {/* Email or Mobile */}
                  <div>
                    <label htmlFor="auth-identifier" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      {loginType === 'email' ? 'Email address' : 'Mobile number'}
                    </label>
                    <div className="relative">
                      {loginType === 'email' ? (
                        <Mail aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <Phone aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                      )}
                      <input
                        id="auth-identifier"
                        type={loginType === 'email' ? 'email' : 'tel'}
                        autoComplete={loginType === 'email' ? 'email' : 'tel'}
                        placeholder={loginType === 'email' ? 'name@example.com' : 'e.g. 9876543210'}
                        value={loginType === 'email' ? email : mobile}
                        onChange={e => loginType === 'email' ? setEmail(e.target.value) : setMobile(e.target.value)}
                        onBlur={() => touch('identifier')}
                        aria-invalid={touched.identifier && !!identifierError}
                        aria-describedby={touched.identifier && identifierError ? 'auth-identifier-err' : undefined}
                        className={`${FIELD} pl-10 pr-4 py-3`}
                        required
                      />
                    </div>
                    {touched.identifier && identifierError && <p id="auth-identifier-err" className="mt-1 text-xs text-red-700 dark:text-red-300">{identifierError}</p>}
                  </div>

                  {/* Login mode: show password + OTP option */}
                  {mode === 'login' && authMethod === 'password' && (
                  <div>
                    <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Password</label>
                    <div className="relative">
                      <Lock aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <input id="login-password" type={showPassword ? 'text' : 'password'} placeholder="Your password" autoComplete="current-password" value={password}
                        onChange={e => setPassword(e.target.value)} onBlur={() => touch('password')}
                        aria-invalid={touched.password && !!passwordError} aria-describedby={touched.password && passwordError ? 'login-password-err' : undefined}
                        className={`${FIELD} pl-10 pr-12 py-3`} required minLength={4} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}
                        className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white ${FOCUS}`}>
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {touched.password && passwordError && <p id="login-password-err" className="mt-1 text-xs text-red-700 dark:text-red-300">{passwordError}</p>}
                  </div>
                  )}

                  {error && <p role="alert" className="text-red-700 dark:text-red-300 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-2.5 rounded-lg">{error}</p>}

                  {/* Submit button */}
                  {mode === 'login' && authMethod === 'password' && (
                    <button type="submit" disabled={loading}
                      className={`w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-amber-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${FOCUS}`}>
                      {loading ? 'Please wait...' : 'Login with Password'}
                    </button>
                  )}

                  {/* OTP button for login */}
                  {mode === 'login' && authMethod === 'otp' && (
                    <button type="button" onClick={handleSendOtp} disabled={loading}
                      className={`w-full py-3 bg-gradient-to-r from-green-700 to-emerald-700 text-white font-semibold rounded-lg hover:from-green-800 hover:to-emerald-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${FOCUS}`}>
                      {loading ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                  )}

                  {/* Register: always send OTP first */}
                  {mode === 'register' && (
                    <button type="button" onClick={handleSendOtp} disabled={loading}
                      className={`w-full py-3 bg-gradient-to-r from-green-700 to-emerald-700 text-white font-semibold rounded-lg hover:from-green-800 hover:to-emerald-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${FOCUS} flex items-center justify-center gap-2`}>
                      <ShieldCheck className="w-5 h-5" />
                      {loading ? 'Sending OTP...' : 'Send OTP to Verify'}
                    </button>
                  )}
                </form>

                {/* Login method toggle */}
                {mode === 'login' && (
                  <button type="button"
                    onClick={() => { setAuthMethod(authMethod === 'password' ? 'otp' : 'password'); setError(''); }}
                    className={`w-full text-center text-sm text-orange-700 dark:text-orange-300 font-medium hover:underline mt-3 rounded ${FOCUS}`}
                  >
                    {authMethod === 'password' ? 'Login with OTP instead' : 'Login with Password instead'}
                  </button>
                )}

                {/* Toggle Login/Register */}
                <GoogleSignInButton
                  onSuccess={res => {
                    login(res.token, res.user);
                    toast.success(`Welcome, ${res.user.fullName?.split(' ')[0] || 'there'}!`);
                    onClose();
                  }}
                  onError={msg => { setError(msg); toast.error(msg); }}
                />

                <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-4">
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button type="button" onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                    className={`text-orange-700 dark:text-orange-300 font-semibold hover:underline rounded ${FOCUS}`}>
                    {mode === 'login' ? 'Register' : 'Login'}
                  </button>
                </p>

                {/* Guest */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button type="button" onClick={handleGuest}
                    className={`w-full py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all ${FOCUS}`}>
                    Continue as Guest
                  </button>
                  <p className="text-xs text-center text-gray-600 dark:text-gray-400 mt-2">Guest users cannot download certificates</p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
    </MotionConfig>
  );
}
