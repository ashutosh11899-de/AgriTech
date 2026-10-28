import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Farm, Crop, Order, Consultation } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import {
  Settings, Users, Tractor, Sprout, ShoppingBag, MessageSquare,
  TrendingUp, BarChart3, AlertTriangle, CheckCircle
} from 'lucide-react';

type AdminStats = {
  totalFarms: number;
  totalCrops: number;
  totalOrders: number;
  totalConsultations: number;
  pendingOrders: number;
  activeAlerts: number;
};

export default function AdminPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<AdminStats>({ totalFarms: 0, totalCrops: 0, totalOrders: 0, totalConsultations: 0, pendingOrders: 0, activeAlerts: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role !== 'admin') return;
    async function load() {
      const [farmsRes, cropsRes, ordersRes, consultRes, alertsRes] = await Promise.all([
        supabase.from('farms').select('id', { count: 'exact', head: true }),
        supabase.from('crops').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('consultations').select('id', { count: 'exact', head: true }),
        supabase.from('pest_alerts').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      ]);
      const orders: Order[] = ordersRes.data || [];
      setRecentOrders(orders.slice(0, 8));
      setStats({
        totalFarms: farmsRes.count || 0,
        totalCrops: cropsRes.count || 0,
        totalOrders: orders.length,
        totalConsultations: consultRes.count || 0,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        activeAlerts: alertsRes.count || 0,
      });
      setLoading(false);
    }
    load();
  }, [profile]);

  if (profile?.role !== 'admin') {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-64">
        <AlertTriangle className="w-12 h-12 text-red-400 mb-3" />
        <h2 className="font-bold text-gray-800 text-lg">Access Restricted</h2>
        <p className="text-gray-500 text-sm mt-1">This section is only available to administrators.</p>
      </div>
    );
  }

  async function updateOrderStatus(id: string, status: Order['status']) {
    await supabase.from('orders').update({ status }).eq('id', id);
    setRecentOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  }

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Platform overview and management.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent" /></div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Total Farms', value: stats.totalFarms, icon: <Tractor className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Crops', value: stats.totalCrops, icon: <Sprout className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Total Orders', value: stats.totalOrders, icon: <ShoppingBag className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Pending Orders', value: stats.pendingOrders, icon: <TrendingUp className="w-5 h-5" />, color: 'text-orange-600', bg: 'bg-orange-50' },
              { label: 'Consultations', value: stats.totalConsultations, icon: <MessageSquare className="w-5 h-5" />, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Active Alerts', value: stats.activeAlerts, icon: <AlertTriangle className="w-5 h-5" />, color: 'text-red-600', bg: 'bg-red-50' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className={`${s.bg} ${s.color} w-9 h-9 rounded-xl flex items-center justify-center mb-2`}>{s.icon}</div>
                <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Orders management */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-5 border-b border-gray-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Order Management</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Order ID</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-gray-600">#{order.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-5 py-3 font-semibold text-gray-900">₹{order.total_amount.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${statusColor[order.status]}`}>{order.status}</span>
                      </td>
                      <td className="px-5 py-3">
                        <select
                          value={order.status}
                          onChange={e => updateOrderStatus(order.id, e.target.value as Order['status'])}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500"
                        >
                          {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-500">No orders yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
