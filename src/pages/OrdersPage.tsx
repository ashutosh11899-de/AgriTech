import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Order } from '@/lib/supabase';
import { CreditCard, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: 'Pending', icon: <Clock className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmed', icon: <CheckCircle className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700' },
  shipped: { label: 'Shipped', icon: <Truck className="w-4 h-4" />, color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Delivered', icon: <CheckCircle className="w-4 h-4" />, color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', icon: <XCircle className="w-4 h-4" />, color: 'bg-red-100 text-red-700' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('orders').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setOrders(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track your resource purchases and delivery status.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent" /></div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-700 mb-1">No orders yet</h3>
          <p className="text-sm text-gray-500">Visit the marketplace to order fertilizers, seeds, and more.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const cfg = statusConfig[order.status];
            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Order #{order.id.slice(0, 8).toUpperCase()}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-xl ${cfg.color}`}>
                      {cfg.icon}{cfg.label}
                    </span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-500">Total Amount</div>
                    <div className="font-bold text-gray-900 mt-0.5">₹{order.total_amount.toLocaleString('en-IN')}</div>
                  </div>
                  {order.shipping_address && (
                    <div className="bg-gray-50 rounded-xl p-3 col-span-2 sm:col-span-1">
                      <div className="text-xs text-gray-500">Delivery Address</div>
                      <div className="font-medium text-gray-800 mt-0.5 text-xs line-clamp-2">{order.shipping_address}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
