import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Farm, PestAlert, WeatherData, ForecastDay } from '@/lib/supabase';
import { CloudSun, Droplets, Wind, Thermometer, Plus, X, Check, AlertTriangle, Trash2, CloudRain, Sun, Cloud } from 'lucide-react';

const severityColors: Record<string, string> = {
  low: 'border-yellow-300 bg-yellow-50',
  medium: 'border-orange-300 bg-orange-50',
  high: 'border-red-300 bg-red-50',
  critical: 'border-red-500 bg-red-100',
};
const severityBadge: Record<string, string> = {
  low: 'bg-yellow-100 text-yellow-700',
  medium: 'bg-orange-100 text-orange-700',
  high: 'bg-red-100 text-red-700',
  critical: 'bg-red-200 text-red-800',
};
const statusBadge: Record<string, string> = {
  active: 'bg-red-100 text-red-700',
  monitoring: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
};

type AlertForm = Omit<PestAlert, 'id' | 'user_id' | 'created_at'>;
const emptyAlert: AlertForm = {
  farm_id: '', pest_name: '', severity: 'medium', affected_crop: '',
  description: '', recommended_action: '', status: 'active', detected_at: new Date().toISOString().slice(0, 16),
};

const conditionIcons: Record<string, React.ReactNode> = {
  Sunny: <Sun className="w-5 h-5 text-amber-500" />,
  Cloudy: <Cloud className="w-5 h-5 text-gray-500" />,
  Rainy: <CloudRain className="w-5 h-5 text-blue-500" />,
  'Partly Cloudy': <CloudSun className="w-5 h-5 text-amber-400" />,
};

const sampleForecast: ForecastDay[] = [
  { day: 'Today', high: 32, low: 22, condition: 'Sunny', rain_chance: 5 },
  { day: 'Tomorrow', high: 29, low: 21, condition: 'Partly Cloudy', rain_chance: 20 },
  { day: 'Wednesday', high: 26, low: 19, condition: 'Rainy', rain_chance: 75 },
  { day: 'Thursday', high: 28, low: 20, condition: 'Cloudy', rain_chance: 40 },
  { day: 'Friday', high: 31, low: 22, condition: 'Sunny', rain_chance: 10 },
];

export default function WeatherPestsPage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [alerts, setAlerts] = useState<PestAlert[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [selectedFarm, setSelectedFarm] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertForm, setAlertForm] = useState<AlertForm>(emptyAlert);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'weather' | 'pests'>('weather');

  async function load(farmId: string) {
    const [alertsRes, weatherRes] = await Promise.all([
      supabase.from('pest_alerts').select('*').eq('farm_id', farmId).order('detected_at', { ascending: false }),
      supabase.from('weather_data').select('*').eq('farm_id', farmId).order('recorded_at', { ascending: false }).limit(1).maybeSingle(),
    ]);
    setAlerts(alertsRes.data || []);
    setWeather(weatherRes.data);
  }

  useEffect(() => {
    supabase.from('farms').select('*').then(({ data }) => {
      const f = data || [];
      setFarms(f);
      if (f.length > 0) {
        setSelectedFarm(f[0].id);
        load(f[0].id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedFarm) load(selectedFarm);
  }, [selectedFarm]);

  async function addWeather() {
    if (!selectedFarm) return;
    const payload = {
      farm_id: selectedFarm,
      temperature_c: 28 + Math.round(Math.random() * 8),
      humidity_percent: 60 + Math.round(Math.random() * 25),
      rainfall_mm: Math.round(Math.random() * 10),
      wind_speed_kmh: 8 + Math.round(Math.random() * 20),
      condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 4)],
      forecast_days: sampleForecast,
    };
    const { data } = await supabase.from('weather_data').insert(payload).select().single();
    if (data) setWeather(data);
  }

  async function saveAlert() {
    if (!alertForm.pest_name.trim()) { setError('Pest name is required.'); return; }
    setSaving(true); setError('');
    const { error } = await supabase.from('pest_alerts').insert({ ...alertForm, farm_id: selectedFarm || farms[0]?.id || '' });
    if (error) { setError(error.message); setSaving(false); return; }
    setSaving(false); setShowAlertForm(false);
    if (selectedFarm) load(selectedFarm);
  }

  async function resolveAlert(id: string) {
    await supabase.from('pest_alerts').update({ status: 'resolved' }).eq('id', id);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved' } : a));
  }

  async function deleteAlert(id: string) {
    if (!confirm('Delete this alert?')) return;
    await supabase.from('pest_alerts').delete().eq('id', id);
    setAlerts(prev => prev.filter(a => a.id !== id));
  }

  const farm = farms.find(f => f.id === selectedFarm);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Weather & Pest Alerts</h1>
          <p className="text-sm text-gray-500 mt-0.5">Monitor real-time conditions and threat alerts.</p>
        </div>
        {farms.length > 1 && (
          <select value={selectedFarm} onChange={e => setSelectedFarm(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
            {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['weather', 'pests'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${activeTab === t ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {t === 'weather' ? 'Weather Forecast' : `Pest Alerts (${alerts.filter(a => a.status === 'active').length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent" /></div>
      ) : farms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <CloudSun className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Add a farm first to track weather and pests.</p>
        </div>
      ) : activeTab === 'weather' ? (
        <div className="space-y-4">
          {!weather ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <CloudSun className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-4">No weather data for {farm?.name}.</p>
              <button onClick={addWeather} className="bg-sky-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-sky-700 transition-colors">
                Fetch Current Weather
              </button>
            </div>
          ) : (
            <>
              {/* Current conditions */}
              <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl p-6 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-sky-200 mb-1">{farm?.name} — Current Conditions</div>
                    <div className="text-5xl font-bold">{weather.temperature_c}°C</div>
                    <div className="text-sky-200 text-sm mt-1">{weather.condition}</div>
                  </div>
                  <div className="text-6xl opacity-90">
                    {weather.condition === 'Sunny' ? '☀️' : weather.condition === 'Rainy' ? '🌧️' : weather.condition === 'Cloudy' ? '☁️' : '⛅'}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-sky-400/40">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-sky-300" />
                    <div>
                      <div className="text-xs text-sky-200">Humidity</div>
                      <div className="font-semibold">{weather.humidity_percent}%</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CloudRain className="w-4 h-4 text-sky-300" />
                    <div>
                      <div className="text-xs text-sky-200">Rainfall</div>
                      <div className="font-semibold">{weather.rainfall_mm} mm</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-sky-300" />
                    <div>
                      <div className="text-xs text-sky-200">Wind</div>
                      <div className="font-semibold">{weather.wind_speed_kmh} km/h</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5-day forecast */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">5-Day Forecast</h3>
                <div className="grid grid-cols-5 gap-2">
                  {(weather.forecast_days as ForecastDay[]).map((day, i) => (
                    <div key={i} className="text-center p-3 bg-gray-50 rounded-xl">
                      <div className="text-xs text-gray-500 mb-2 font-medium">{day.day}</div>
                      <div className="flex justify-center mb-2">
                        {conditionIcons[day.condition] || <CloudSun className="w-5 h-5 text-gray-400" />}
                      </div>
                      <div className="text-sm font-bold text-gray-800">{day.high}°</div>
                      <div className="text-xs text-gray-500">{day.low}°</div>
                      <div className="text-xs text-blue-600 mt-1">{day.rain_chance}%</div>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={addWeather} className="text-xs text-sky-600 hover:text-sky-700 font-medium">
                Refresh weather data
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => { setAlertForm({ ...emptyAlert, farm_id: selectedFarm }); setError(''); setShowAlertForm(true); }} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
              <Plus className="w-4 h-4" /> Report Alert
            </button>
          </div>
          {alerts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No alerts for this farm. Great news!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alerts.map(alert => (
                <div key={alert.id} className={`rounded-2xl border-2 p-5 ${severityColors[alert.severity]}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900">{alert.pest_name}</h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${severityBadge[alert.severity]}`}>{alert.severity}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${statusBadge[alert.status]}`}>{alert.status}</span>
                      </div>
                      {alert.affected_crop && <div className="text-sm text-gray-600 mt-1">Affects: <span className="font-medium">{alert.affected_crop}</span></div>}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {alert.status === 'active' && (
                        <button onClick={() => resolveAlert(alert.id)} title="Mark resolved" className="p-1.5 text-green-700 hover:bg-green-200 rounded-lg"><Check className="w-3.5 h-3.5" /></button>
                      )}
                      <button onClick={() => deleteAlert(alert.id)} className="p-1.5 text-red-700 hover:bg-red-200 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  {alert.description && <p className="text-sm text-gray-700 mt-2">{alert.description}</p>}
                  {alert.recommended_action && (
                    <div className="mt-3 bg-white/60 rounded-xl p-3 text-sm">
                      <div className="text-xs font-semibold text-gray-600 mb-0.5">Recommended Action</div>
                      <div className="text-gray-800">{alert.recommended_action}</div>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-3">
                    Detected: {new Date(alert.detected_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Alert form modal */}
      {showAlertForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Report Pest/Disease Alert</h3>
              <button onClick={() => setShowAlertForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Pest/Disease Name *</label>
                  <input value={alertForm.pest_name} onChange={e => setAlertForm(f => ({ ...f, pest_name: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" placeholder="Aphids, Rust, Blight..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Affected Crop</label>
                  <input value={alertForm.affected_crop} onChange={e => setAlertForm(f => ({ ...f, affected_crop: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" placeholder="Wheat, Tomato..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Severity</label>
                  <select value={alertForm.severity} onChange={e => setAlertForm(f => ({ ...f, severity: e.target.value as PestAlert['severity'] }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400">
                    {['low', 'medium', 'high', 'critical'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select value={alertForm.status} onChange={e => setAlertForm(f => ({ ...f, status: e.target.value as PestAlert['status'] }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400">
                    {['active', 'monitoring', 'resolved'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea value={alertForm.description} onChange={e => setAlertForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Recommended Action</label>
                <textarea value={alertForm.recommended_action} onChange={e => setAlertForm(f => ({ ...f, recommended_action: e.target.value }))} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none" placeholder="Apply neem spray, consult agronomist..." />
              </div>
              {error && <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</div>}
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowAlertForm(false)} className="flex-1 border border-gray-200 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-50 text-sm">Cancel</button>
              <button onClick={saveAlert} disabled={saving} className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
                {saving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <AlertTriangle className="w-4 h-4" />}
                Report Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
