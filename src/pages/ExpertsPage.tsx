import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Expert, Consultation } from '@/lib/supabase';
import { Users, Star, Clock, Calendar, X, Check, MessageSquare, Globe } from 'lucide-react';

const availabilityColor: Record<string, string> = {
  Available: 'bg-green-100 text-green-700',
  Busy: 'bg-red-100 text-red-700',
  'On Leave': 'bg-gray-100 text-gray-700',
};

type ConsultForm = {
  expert_id: string;
  topic: string;
  description: string;
  preferred_date: string;
  preferred_time: string;
};

export default function ExpertsPage() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [form, setForm] = useState<ConsultForm>({ expert_id: '', topic: '', description: '', preferred_date: '', preferred_time: '10:00' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'experts' | 'consultations'>('experts');

  async function load() {
    const [expRes, conRes] = await Promise.all([
      supabase.from('experts').select('*'),
      supabase.from('consultations').select('*, expert:experts(*)').order('created_at', { ascending: false }),
    ]);
    setExperts(expRes.data || []);
    setConsultations(conRes.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openBook(expert: Expert) {
    setSelectedExpert(expert);
    setForm({ expert_id: expert.id, topic: '', description: '', preferred_date: '', preferred_time: '10:00' });
    setError('');
    setShowForm(true);
  }

  async function saveConsultation() {
    if (!form.topic.trim()) { setError('Topic is required.'); return; }
    if (!form.preferred_date) { setError('Please select a preferred date.'); return; }
    setSaving(true); setError('');
    const { error } = await supabase.from('consultations').insert({
      expert_id: form.expert_id,
      topic: form.topic,
      description: form.description,
      preferred_date: form.preferred_date,
      preferred_time: form.preferred_time,
    });
    if (error) { setError(error.message); setSaving(false); return; }
    setSaving(false); setShowForm(false); load(); setTab('consultations');
  }

  const statusBadge: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Expert Consultation</h1>
        <p className="text-sm text-gray-500 mt-0.5">Connect with agricultural experts for personalized guidance.</p>
      </div>

      <div className="flex gap-2">
        {(['experts', 'consultations'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${tab === t ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {t === 'experts' ? 'Browse Experts' : `My Consultations (${consultations.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent" /></div>
      ) : tab === 'experts' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5">
          {experts.map(expert => (
            <div key={expert.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {expert.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-gray-900">{expert.name}</h3>
                      <div className="text-sm text-green-700 font-medium mt-0.5">{expert.specialization}</div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-xl flex-shrink-0 ${availabilityColor[expert.availability] || 'bg-gray-100 text-gray-600'}`}>
                      {expert.availability}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="font-semibold text-gray-800">{expert.rating}</span>
                      ({expert.review_count} reviews)
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {expert.years_experience} yrs exp.
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4 line-clamp-2">{expert.bio}</p>
              <div className="flex items-center gap-2 mt-3">
                <Globe className="w-3.5 h-3.5 text-gray-400" />
                <div className="flex gap-1 flex-wrap">
                  {expert.languages.map(lang => (
                    <span key={lang} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg">{lang}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div>
                  <div className="text-lg font-bold text-gray-900">₹{expert.hourly_rate}/hr</div>
                </div>
                <button
                  onClick={() => openBook(expert)}
                  disabled={expert.availability !== 'Available'}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  {expert.availability === 'Available' ? 'Book Session' : 'Unavailable'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {consultations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No consultations booked yet.</p>
            </div>
          ) : consultations.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-gray-900">{c.topic}</div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    with <span className="font-medium text-green-700">{(c.expert as Expert)?.name || 'Expert'}</span>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-xl ${statusBadge[c.status]}`}>{c.status}</span>
              </div>
              {c.description && <p className="text-sm text-gray-600 mt-2">{c.description}</p>}
              <div className="flex gap-4 mt-3 text-xs text-gray-500">
                {c.preferred_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(c.preferred_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {c.preferred_time && ` at ${c.preferred_time}`}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking modal */}
      {showForm && selectedExpert && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900">Book Consultation</h3>
                <div className="text-sm text-green-700 mt-0.5">with {selectedExpert.name}</div>
              </div>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Topic / Issue *</label>
                <input value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. Soil pH imbalance in wheat crop" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" placeholder="Describe your farming challenge in detail..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Preferred Date *</label>
                  <input type="date" min={new Date().toISOString().slice(0, 10)} value={form.preferred_date} onChange={e => setForm(f => ({ ...f, preferred_date: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Preferred Time</label>
                  <select value={form.preferred_time} onChange={e => setForm(f => ({ ...f, preferred_time: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    {['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-xs text-green-800">
                Rate: ₹{selectedExpert.hourly_rate}/hour · {selectedExpert.languages.join(', ')}
              </div>
              {error && <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</div>}
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-50 text-sm">Cancel</button>
              <button onClick={saveConsultation} disabled={saving} className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
                {saving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Check className="w-4 h-4" />}
                Book Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
