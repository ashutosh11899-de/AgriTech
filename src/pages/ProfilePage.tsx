import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { User, Phone, MapPin, Save, CheckCircle, Lock, Eye, EyeOff, KeyRound } from 'lucide-react';

export default function ProfilePage() {
  const { profile, refreshProfile, updatePassword } = useAuth();
  const [form, setForm] = useState({ full_name: profile?.full_name || '', phone: profile?.phone || '', location: profile?.location || '' });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name.trim()) { setError('Name is required.'); return; }
    setSaving(true); setError('');
    const { error } = await supabase.from('profiles').update(form).eq('id', profile!.id);
    if (error) { setError(error.message); setSaving(false); return; }
    await refreshProfile();
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError('');
    if (password.length < 6) { setPasswordError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setPasswordError('Passwords do not match.'); return; }
    setPasswordSaving(true);
    const result = await updatePassword(password);
    if (result.error) {
      setPasswordError(result.error);
    } else {
      setPassword('');
      setConfirmPassword('');
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 2500);
    }
    setPasswordSaving(false);
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your personal information and account security.</p>
      </div>

      <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-green-700 to-emerald-500" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-8 mb-6">
            <div className="w-16 h-16 bg-white border-4 border-white rounded-2xl shadow flex items-center justify-center text-green-600 font-bold text-2xl">
              {profile?.full_name?.[0]?.toUpperCase() || 'F'}
            </div>
            <div className="pb-1">
              <div className="font-bold text-gray-900 text-lg">{profile?.full_name || 'Farmer'}</div>
              <div className="text-sm text-gray-500 capitalize">{profile?.role}</div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="+91 9876543210" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Village, District, State" />
                </div>
              </div>
            </div>
            {error && <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</div>}
            <button type="submit" disabled={saving} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
              {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center"><KeyRound className="w-5 h-5 text-green-600" /></div>
          <div>
            <h2 className="font-semibold text-gray-900">Change password</h2>
            <p className="text-xs text-gray-500 mt-0.5">Use a password you do not use anywhere else.</p>
          </div>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" minLength={6} required className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat your new password" minLength={6} required className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          {passwordError && <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{passwordError}</div>}
          <button type="submit" disabled={passwordSaving} className="flex items-center gap-2 border border-green-600 text-green-700 hover:bg-green-50 disabled:opacity-50 font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
            {passwordSaved ? <CheckCircle className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {passwordSaved ? 'Password updated' : passwordSaving ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}
