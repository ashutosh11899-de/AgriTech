import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Leaf, Eye, EyeOff, Mail, Lock, User, ArrowLeft, KeyRound, CheckCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-700/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-2xl mb-4 shadow-lg">
            <Leaf className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">AgriTech</h1>
          <p className="text-green-300 mt-1 text-sm">Empowering Farmers with Digital Technology</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
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
    </div>
  );
}
