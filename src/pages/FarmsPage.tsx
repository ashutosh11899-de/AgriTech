import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Farm } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Plus, Tractor, MapPin, Ruler, Trash2, Pencil, X, Check } from 'lucide-react';

type FarmForm = Omit<Farm, 'id' | 'user_id' | 'created_at'>;

const emptyForm: FarmForm = {
  name: '', size_acres: 0, location: '', soil_type: 'Loamy',
  irrigation_type: 'Drip', established_date: null, description: '',
};

const soilTypes = ['Loamy', 'Sandy', 'Clay', 'Silty', 'Peaty', 'Chalky', 'Black Cotton'];
const irrigationTypes = ['Drip', 'Sprinkler', 'Flood', 'Furrow', 'Rain-fed', 'Subsurface'];

export default function FarmsPage() {
  const { user } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FarmForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const { data } = await supabase.from('farms').select('*').order('created_at', { ascending: false });
    setFarms(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setForm(emptyForm);
    setEditId(null);
    setError('');
    setShowForm(true);
  }

  function openEdit(farm: Farm) {
    setForm({
      name: farm.name, size_acres: farm.size_acres, location: farm.location,
      soil_type: farm.soil_type, irrigation_type: farm.irrigation_type,
      established_date: farm.established_date, description: farm.description,
    });
    setEditId(farm.id);
    setError('');
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Farm name is required.'); return; }
    if (!form.location.trim()) { setError('Location is required.'); return; }
    setSaving(true);
    setError('');
    if (editId) {
      const { error } = await supabase.from('farms').update(form).eq('id', editId);
      if (error) { setError(error.message); setSaving(false); return; }
    } else {
      const { error } = await supabase.from('farms').insert({ ...form });
      if (error) { setError(error.message); setSaving(false); return; }
    }
    setSaving(false);
    setShowForm(false);
    load();
  }

  async function deleteFarm(id: string) {
    if (!confirm('Delete this farm and all its data?')) return;
    await supabase.from('farms').delete().eq('id', id);
    setFarms(prev => prev.filter(f => f.id !== id));
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Farms</h1>
          <p className="text-sm text-gray-500 mt-0.5">{farms.length} farm{farms.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Farm
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent" /></div>
      ) : farms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Tractor className="w-14 h-14 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-700 mb-1">No farms yet</h3>
          <p className="text-sm text-gray-500 mb-4">Add your first farm to start managing crops and soil data.</p>
          <button onClick={openNew} className="bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-green-700 transition-colors">
            Add Your First Farm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {farms.map(farm => (
            <div key={farm.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-400" />
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{farm.name}</h3>
                    <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                      <MapPin className="w-3 h-3" /> {farm.location}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(farm)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteFarm(farm.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-500">Size</div>
                    <div className="font-semibold text-gray-800 mt-0.5 flex items-center gap-1">
                      <Ruler className="w-3.5 h-3.5 text-green-600" />{farm.size_acres} acres
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-500">Soil Type</div>
                    <div className="font-semibold text-gray-800 mt-0.5">{farm.soil_type}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-500">Irrigation</div>
                    <div className="font-semibold text-gray-800 mt-0.5">{farm.irrigation_type}</div>
                  </div>
                  {farm.established_date && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="text-xs text-gray-500">Since</div>
                      <div className="font-semibold text-gray-800 mt-0.5">{new Date(farm.established_date).getFullYear()}</div>
                    </div>
                  )}
                </div>
                {farm.description && (
                  <p className="text-xs text-gray-500 mt-3 line-clamp-2">{farm.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{editId ? 'Edit Farm' : 'Add New Farm'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. Green Valley Farm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Village, District" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Size (acres)</label>
                  <input type="number" min={0} value={form.size_acres} onChange={e => setForm(f => ({ ...f, size_acres: parseFloat(e.target.value) || 0 }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
                  <select value={form.soil_type} onChange={e => setForm(f => ({ ...f, soil_type: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    {soilTypes.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Irrigation</label>
                  <select value={form.irrigation_type} onChange={e => setForm(f => ({ ...f, irrigation_type: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    {irrigationTypes.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Established Date</label>
                <input type="date" value={form.established_date || ''} onChange={e => setForm(f => ({ ...f, established_date: e.target.value || null }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" placeholder="Describe your farm..." />
              </div>
              {error && <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</div>}
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                {saving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Check className="w-4 h-4" />}
                {editId ? 'Save Changes' : 'Add Farm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
