import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Farm, Crop, PestAlert } from '@/lib/supabase';
import {
  Tractor, Sprout, AlertTriangle, TrendingUp, CloudSun,
  CheckCircle, Clock, BarChart3, Droplets, Thermometer, Wind, Plus
} from 'lucide-react';

type Stats = {
  totalFarms: number;
  totalCrops: number;
  activeCrops: number;
  activeAlerts: number;
  harvestedCrops: number;
};

export default function Dashboard({ onNavigate }: { onNavigate: (p: string) => void }) {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Stats>({ totalFarms: 0, totalCrops: 0, activeCrops: 0, activeAlerts: 0, harvestedCrops: 0 });
  const [recentCrops, setRecentCrops] = useState<Crop[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<PestAlert[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [farmsRes, cropsRes, alertsRes] = await Promise.all([
        supabase.from('farms').select('*').order('created_at', { ascending: false }),
        supabase.from('crops').select('*').order('created_at', { ascending: false }),
        supabase.from('pest_alerts').select('*').order('detected_at', { ascending: false }).limit(5),
      ]);
      const farmsData: Farm[] = farmsRes.data || [];
      const cropsData: Crop[] = cropsRes.data || [];
      const alertsData: PestAlert[] = alertsRes.data || [];
      setFarms(farmsData);
      setRecentCrops(cropsData.slice(0, 5));
      setRecentAlerts(alertsData);
      setStats({
        totalFarms: farmsData.length,
        totalCrops: cropsData.length,
        activeCrops: cropsData.filter(c => c.status === 'growing' || c.status === 'planted').length,
        harvestedCrops: cropsData.filter(c => c.status === 'harvested').length,
        activeAlerts: alertsData.filter(a => a.status === 'active').length,
      });
      setLoading(false);
    }
    load();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const statusColor: Record<string, string> = {
    planted: 'bg-blue-100 text-blue-700',
    growing: 'bg-green-100 text-green-700',
    harvested: 'bg-amber-100 text-amber-700',
    failed: 'bg-red-100 text-red-700',
  };

  const severityColor: Record<string, string> = {
    low: 'bg-yellow-100 text-yellow-700',
    medium: 'bg-orange-100 text-orange-700',
    high: 'bg-red-100 text-red-700',
    critical: 'bg-red-200 text-red-800',
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent" />
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            {greeting()}, {profile?.full_name?.split(' ')[0] || 'Farmer'}!
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Here's what's happening on your farm today.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-xl px-4 py-2">
          <CloudSun className="w-4 h-4 text-amber-500" />
          <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Total Farms', value: stats.totalFarms, icon: <Tractor className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50', action: 'farms' },
          { label: 'Active Crops', value: stats.activeCrops, icon: <Sprout className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50', action: 'crops' },
          { label: 'Harvested', value: stats.harvestedCrops, icon: <CheckCircle className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-50', action: 'crops' },
          { label: 'Active Alerts', value: stats.activeAlerts, icon: <AlertTriangle className="w-5 h-5" />, color: 'text-red-600', bg: 'bg-red-50', action: 'weather' },
        ].map(s => (
          <button
            key={s.label}
            onClick={() => onNavigate(s.action)}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left"
          >
            <div className={`${s.bg} ${s.color} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
              {s.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </button>
        ))}
      </div>

      {/* No farms CTA */}
      {stats.totalFarms === 0 && (
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-white">
          <div>
            <h3 className="font-bold text-lg">Get started with your first farm!</h3>
            <p className="text-green-100 text-sm mt-1">Set up your farm profile to start tracking crops, weather, and more.</p>
          </div>
          <button
            onClick={() => onNavigate('farms')}
            className="flex items-center gap-2 bg-white text-green-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-green-50 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Farm
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Crops */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Sprout className="w-4 h-4 text-green-600" /> Recent Crops
            </h3>
            <button onClick={() => onNavigate('crops')} className="text-xs text-green-600 hover:text-green-700 font-medium">
              View all
            </button>
          </div>
          {recentCrops.length === 0 ? (
            <div className="text-center py-8">
              <Sprout className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No crops added yet</p>
              <button onClick={() => onNavigate('crops')} className="mt-3 text-xs text-green-600 font-medium hover:underline">
                Add your first crop
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentCrops.map(crop => (
                <div key={crop.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{crop.name} {crop.variety && <span className="text-gray-400">({crop.variety})</span>}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{crop.area_acres} acres</div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${statusColor[crop.status]}`}>
                    {crop.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pest Alerts */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" /> Pest & Disease Alerts
            </h3>
            <button onClick={() => onNavigate('weather')} className="text-xs text-green-600 hover:text-green-700 font-medium">
              View all
            </button>
          </div>
          {recentAlerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No active alerts</p>
              <p className="text-xs text-gray-400 mt-1">Your crops are healthy!</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentAlerts.map(alert => (
                <div key={alert.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${alert.severity === 'critical' || alert.severity === 'high' ? 'bg-red-500' : alert.severity === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{alert.pest_name}</div>
                    <div className="text-xs text-gray-500">{alert.affected_crop}</div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-lg flex-shrink-0 ${severityColor[alert.severity]}`}>
                    {alert.severity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Add Crop', icon: <Sprout className="w-5 h-5" />, color: 'bg-green-50 text-green-600 hover:bg-green-100', page: 'crops' },
            { label: 'Check Weather', icon: <CloudSun className="w-5 h-5" />, color: 'bg-sky-50 text-sky-600 hover:bg-sky-100', page: 'weather' },
            { label: 'Shop Resources', icon: <TrendingUp className="w-5 h-5" />, color: 'bg-amber-50 text-amber-600 hover:bg-amber-100', page: 'marketplace' },
            { label: 'Book Expert', icon: <BarChart3 className="w-5 h-5" />, color: 'bg-purple-50 text-purple-600 hover:bg-purple-100', page: 'experts' },
          ].map(a => (
            <button
              key={a.label}
              onClick={() => onNavigate(a.page)}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl p-4 transition-colors ${a.color}`}
            >
              {a.icon}
              <span className="text-xs font-medium">{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
