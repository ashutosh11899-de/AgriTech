import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Leaf, Eye, EyeOff, Mail, Lock, User, ArrowLeft, KeyRound, CheckCircle, Sun, Droplets, ChartNoAxesCombined } from 'lucide-react';

type Mode = 'signin' | 'signup' | 'forgot';

export default function AuthPage() {
  const { signIn, signUp, resetPassword, updatePassword, passwordRecovery } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const isRecovery = passwordRecovery;

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    setError('');
    setMessage('');
    setPassword('');
    setConfirmPassword('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (isRecovery) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }
      const result = await updatePassword(password);
      if (result.error) setError(result.error);
      setLoading(false);
      return;
    }

    if (mode === 'forgot') {
      const result = await resetPassword(email);
      if (result.error) setError(result.error);
      else setMessage('If an account exists for this email, a password reset link has been sent. Check your inbox.');
      setLoading(false);
      return;
    }

    if (mode === 'signin') {
      const result = await signIn(email, password);
      if (result.error) setError(result.error);
    } else {
      if (!fullName.trim()) {
        setError('Full name is required.');
        setLoading(false);
        return;
      }
      const result = await signUp(email, password, fullName);
      if (result.error) setError(result.error);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#f7f4ef] lg:grid lg:grid-cols-2">
      <section
        className="relative hidden min-h-screen overflow-hidden bg-cover bg-center lg:flex lg:flex-col lg:justify-between p-10 text-white"
        style={{ backgroundImage: 'linear-gradient(180deg, rgba(7, 37, 24, 0.48), rgba(4, 38, 24, 0.97)), url(https://images.pexels.com/photos/39347812/pexels-photo-39347812.jpeg?auto=compress&cs=tinysrgb&h=650&w=940)' }}
      >
        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center shadow-lg"><Leaf className="w-5 h-5" /></div>
          <span className="font-semibold tracking-tight">AgriTech</span>
        </div>
        <div className="relative max-w-lg">
          <div className="text-green-300 text-xs font-semibold uppercase tracking-[0.2em] mb-4">Smart farming, made simple</div>
          <h1 className="text-4xl xl:text-5xl font-semibold leading-[1.08] tracking-tight">Grow smarter,<br />one season at a time.</h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-green-50/80">Everything a modern farm needs in one place: weather, crops, and the resources to keep them thriving.</p>
          <div className="mt-8 space-y-4 text-sm text-green-50/90">
            <div className="flex items-center gap-3"><span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><Sun className="w-4 h-4 text-green-300" /></span>Live forecasts for your exact farm location</div>
            <div className="flex items-center gap-3"><span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><Droplets className="w-4 h-4 text-green-300" /></span>Frost, heat, and storm alerts before they hit</div>
            <div className="flex items-center gap-3"><span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><ChartNoAxesCombined className="w-4 h-4 text-green-300" /></span>Track crops from planting to harvest</div>
          </div>
        </div>
        <div className="relative text-xs text-green-100/60">Built for farmers who work with the land.</div>
      </section>

      <section className="flex min-h-screen items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-7">
            <div className="flex items-center gap-2 text-green-700 lg:hidden mb-8"><span className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center"><Leaf className="w-4 h-4 text-white" /></span><span className="font-bold">AgriTech</span></div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#332b24]">{isRecovery ? 'Create a new password' : mode === 'forgot' ? 'Reset your password' : mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1>
            <p className="mt-2 text-sm text-[#8d8174]">{isRecovery ? 'Choose a strong password for your account.' : mode === 'forgot' ? 'We will send a secure link to your email.' : mode === 'signin' ? 'Sign in to keep your farm growing.' : 'Set up your farm in a few minutes.'}</p>
          </div>

        <div className="bg-white/70 rounded-2xl border border-[#e9e2d8] shadow-[0_18px_50px_rgba(86,68,48,0.08)] p-6 sm:p-8">
          {!isRecovery && mode !== 'forgot' && (
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              <button onClick={() => changeMode('signin')} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === 'signin' ? 'bg-white shadow text-green-700' : 'text-gray-500 hover:text-gray-700'}`}>
                Sign In
              </button>
              <button onClick={() => changeMode('signup')} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === 'signup' ? 'bg-white shadow text-green-700' : 'text-gray-500 hover:text-gray-700'}`}>
                Create Account
              </button>
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center gap-2 text-gray-900">
              {(isRecovery || mode === 'forgot') && <KeyRound className="w-5 h-5 text-green-600" />}
              <h2 className="text-lg font-bold">
                {isRecovery ? 'Create a new password' : mode === 'forgot' ? 'Reset your password' : mode === 'signin' ? 'Welcome back' : 'Create your farmer account'}
              </h2>
            </div>
            {(isRecovery || mode === 'forgot') && (
              <p className="text-sm text-gray-500 mt-1">
                {isRecovery ? 'Choose a strong password for your AgriTech account.' : 'Enter your email and we will send you a secure reset link.'}
              </p>
            )}
          </div>

          {message ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
              <button onClick={() => changeMode('signin')} className="mt-5 text-sm text-green-600 font-semibold hover:underline">
                Return to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isRecovery && mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Rajan Kumar" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" required />
                  </div>
                </div>
              )}

              {!isRecovery && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="farmer@example.com" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" required />
                  </div>
                </div>
              )}

              {(!isRecovery && mode !== 'forgot' || isRecovery) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{isRecovery ? 'New Password' : 'Password'}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" required minLength={6} />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {isRecovery && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat your new password" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" required minLength={6} />
                  </div>
                </div>
              )}

              {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>}

              <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                {loading ? 'Please wait...' : isRecovery ? 'Update Password' : mode === 'forgot' ? 'Send Reset Link' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          )}

          {!isRecovery && !message && (
            <div className="mt-5 text-center">
              {mode === 'signin' || mode === 'forgot' ? (
                <button onClick={() => changeMode(mode === 'forgot' ? 'signin' : 'forgot')} className="text-sm text-green-600 hover:text-green-700 font-medium inline-flex items-center gap-1">
                  {mode === 'forgot' && <ArrowLeft className="w-3.5 h-3.5" />}
                  {mode === 'forgot' ? 'Back to sign in' : 'Forgot your password?'}
                </button>
              ) : null}
            </div>
          )}

          {!isRecovery && !message && mode !== 'forgot' && (
            <p className="text-center text-xs text-gray-500 mt-6">By continuing, you agree to our <span className="text-green-600 cursor-pointer hover:underline">Terms of Service</span></p>
          )}
        </div>
        </div>
      </section>
    </div>
  );
}
