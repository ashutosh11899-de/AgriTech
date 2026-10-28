import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Crop, Farm } from '@/lib/supabase';
import { Plus, Sprout, X, Check, Trash2, Pencil, Droplets, FlaskConical } from 'lucide-react';

type CropForm = Omit<Crop, 'id' | 'user_id' | 'created_at'>;

const emptyForm: CropForm = {
  farm_id: '', name: '', variety: '', status: 'planted',
  planted_date: null, expected_harvest: null, area_acres: 0,
  soil_ph: 7.0, nitrogen_level: 0, phosphorus_level: 0, potassium_level: 0,
  moisture_percent: 0, notes: '',
};

const statusOpts = ['planted', 'growing', 'harvested', 'failed'] as const;
const statusColor: Record<string, string> = {
  planted: 'bg-blue-100 text-blue-700',
  growing: 'bg-green-100 text-green-700',
  harvested: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-700',
};

function SoilBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-800">{value}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function CropsPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [farms, setFarms] = useState<Pick<Farm, 'id' | 'name'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CropForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function load() {
    const [cropsRes, farmsRes] = await Promise.all([
      supabase.from('crops').select('*').order('created_at', { ascending: false }),
      supabase.from('farms').select('id, name'),
    ]);
    setCrops(cropsRes.data || []);
    setFarms(farmsRes.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setForm({ ...emptyForm, farm_id: farms[0]?.id || '' });
    setEditId(null); setError(''); setShowForm(true);
  }

  function openEdit(c: Crop) {
    setForm({ farm_id: c.farm_id, name: c.name, variety: c.variety, status: c.status, planted_date: c.planted_date, expected_harvest: c.expected_harvest, area_acres: c.area_acres, soil_ph: c.soil_ph, nitrogen_level: c.nitrogen_level, phosphorus_level: c.phosphorus_level, potassium_level: c.potassium_level, moisture_percent: c.moisture_percent, notes: c.notes });
    setEditId(c.id); setError(''); setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Crop name is required.'); return; }
    if (!form.farm_id) { setError('Please select a farm.'); return; }
    setSaving(true); setError('');
    if (editId) {
      const { error } = await supabase.from('crops').update(form).eq('id', editId);
      if (error) { setError(error.message); setSaving(false); return; }
    } else {
      const { error } = await supabase.from('crops').insert({ ...form });
      if (error) { setError(error.message); setSaving(false); return; }
    }
    setSaving(false); setShowForm(false); load();
  }

  async function deleteCrop(id: string) {
    if (!confirm('Delete this crop record?')) return;
    await supabase.from('crops').delete().eq('id', id);
    setCrops(prev => prev.filter(c => c.id !== id));
  }

  const filtered = filterStatus === 'all' ? crops : crops.filter(c => c.status === filterStatus);
  const farmName = (id: string) => farms.find(f => f.id === id)?.name || 'Unknown Farm';

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Crop Monitoring</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track crop health, soil nutrients, and growth stages.</p>
        </div>
        <button onClick={openNew} disabled={farms.length === 0} title={farms.length === 0 ? 'Add a farm first' : ''} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Add Crop
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['all', ...statusOpts].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors ${filterStatus === s ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {s === 'all' ? `All (${crops.length})` : `${s} (${crops.filter(c => c.status === s).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Sprout className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">{farms.length === 0 ? 'Add a farm before adding crops.' : 'No crops found.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(crop => (
            <div key={crop.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className={`h-1.5 ${crop.status === 'growing' ? 'bg-green-500' : crop.status === 'planted' ? 'bg-blue-500' : crop.status === 'harvested' ? 'bg-amber-500' : 'bg-red-500'}`} />
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{crop.name}</h3>
                    {crop.variety && <div className="text-xs text-gray-500 mt-0.5">{crop.variety}</div>}
                    <div className="text-xs text-gray-400 mt-0.5">{farmName(crop.farm_id)}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${statusColor[crop.status]}`}>{crop.status}</span>
                    <button onClick={() => openEdit(crop)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteCrop(crop.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-gray-500">Area</div>
                    <div className="font-semibold text-gray-800">{crop.area_acres} ac</div>
                  </div>
                  {crop.planted_date && (
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-gray-500">Planted</div>
                      <div className="font-semibold text-gray-800">{new Date(crop.planted_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                    </div>
                  )}
                </div>

                <button onClick={() => setExpandedId(expandedId === crop.id ? null : crop.id)} className="mt-3 text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                  <FlaskConical className="w-3.5 h-3.5" />
                  {expandedId === crop.id ? 'Hide' : 'View'} Soil Data
                </button>

                {expandedId === crop.id && (
                  <div className="mt-3 bg-gray-50 rounded-xl p-3 space-y-2">
                    <SoilBar label="Soil pH" value={crop.soil_ph} max={14} color="bg-purple-400" />
                    <SoilBar label="Nitrogen (mg/kg)" value={crop.nitrogen_level} max={500} color="bg-blue-400" />
                    <SoilBar label="Phosphorus (mg/kg)" value={crop.phosphorus_level} max={200} color="bg-orange-400" />
                    <SoilBar label="Potassium (mg/kg)" value={crop.potassium_level} max={600} color="bg-green-400" />
                    <SoilBar label="Moisture (%)" value={crop.moisture_percent} max={100} color="bg-sky-400" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{editId ? 'Edit Crop' : 'Add Crop'}</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Crop Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Wheat, Rice..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Variety</label>
                  <input value={form.variety} onChange={e => setForm(f => ({ ...f, variety: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="HD-2967..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Farm</label>
                  <select value={form.farm_id} onChange={e => setForm(f => ({ ...f, farm_id: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Crop['status'] }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    {statusOpts.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Area (acres)</label>
                  <input type="number" min={0} step={0.1} value={form.area_acres} onChange={e => setForm(f => ({ ...f, area_acres: parseFloat(e.target.value) || 0 }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Planted</label>
                  <input type="date" value={form.planted_date || ''} onChange={e => setForm(f => ({ ...f, planted_date: e.target.value || null }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Harvest</label>
                  <input type="date" value={form.expected_harvest || ''} onChange={e => setForm(f => ({ ...f, expected_harvest: e.target.value || null }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 space-y-3">
                <div className="text-xs font-semibold text-green-800 flex items-center gap-1"><Droplets className="w-3.5 h-3.5" /> Soil Health Data</div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Soil pH', key: 'soil_ph', step: 0.1 },
                    { label: 'Nitrogen (mg/kg)', key: 'nitrogen_level', step: 1 },
                    { label: 'Phosphorus (mg/kg)', key: 'phosphorus_level', step: 1 },
                    { label: 'Potassium (mg/kg)', key: 'potassium_level', step: 1 },
                    { label: 'Moisture (%)', key: 'moisture_percent', step: 0.1 },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{field.label}</label>
                      <input type="number" min={0} step={field.step} value={(form as Record<string, unknown>)[field.key] as number} onChange={e => setForm(f => ({ ...f, [field.key]: parseFloat(e.target.value) || 0 }))} className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white" />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
              </div>
              {error && <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</div>}
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-50 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
                {saving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Check className="w-4 h-4" />}
                {editId ? 'Save' : 'Add Crop'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
