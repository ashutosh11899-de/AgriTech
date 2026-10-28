import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Resource } from '@/lib/supabase';
import { ShoppingBag, Search, Filter, ShoppingCart, Plus, Minus, X, Check, Package } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type CartItem = { resource: Resource; qty: number };

const categories = ['All', 'Fertilizer', 'Pesticide', 'Seeds', 'Equipment', 'Tools', 'Other'] as const;
const categoryColors: Record<string, string> = {
  Fertilizer: 'bg-green-100 text-green-700',
  Pesticide: 'bg-red-100 text-red-700',
  Seeds: 'bg-amber-100 text-amber-700',
  Equipment: 'bg-blue-100 text-blue-700',
  Tools: 'bg-gray-100 text-gray-700',
  Other: 'bg-purple-100 text-purple-700',
};

export default function MarketplacePage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');

  useEffect(() => {
    supabase.from('resources').select('*').eq('is_available', true).then(({ data }) => {
      setResources(data || []);
      setLoading(false);
    });
  }, []);

  const filtered = resources.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.brand.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || r.category === category;
    return matchSearch && matchCat;
  });

  function addToCart(resource: Resource) {
    setCart(prev => {
      const existing = prev.find(c => c.resource.id === resource.id);
      if (existing) return prev.map(c => c.resource.id === resource.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { resource, qty: 1 }];
    });
  }

  function updateQty(id: string, delta: number) {
    setCart(prev => prev
      .map(c => c.resource.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c)
      .filter(c => c.qty > 0)
    );
  }

  const cartTotal = cart.reduce((s, c) => s + c.resource.price * c.qty, 0);
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  async function placeOrder() {
    if (cart.length === 0) return;
    setOrdering(true);
    const { data: order } = await supabase.from('orders').insert({
      total_amount: cartTotal,
      shipping_address: shippingAddress,
    }).select().single();
    if (order) {
      await supabase.from('order_items').insert(
        cart.map(c => ({ order_id: order.id, resource_id: c.resource.id, quantity: c.qty, unit_price: c.resource.price }))
      );
    }
    setOrdering(false);
    setCart([]);
    setOrderSuccess(true);
    setTimeout(() => { setOrderSuccess(false); setShowCart(false); }, 3000);
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Resource Marketplace</h1>
          <p className="text-sm text-gray-500 mt-0.5">Shop fertilizers, pesticides, seeds, and equipment.</p>
        </div>
        <button
          onClick={() => setShowCart(true)}
          className="relative flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <ShoppingCart className="w-4 h-4" />
          Cart
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products, brands..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${category === c ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filtered.map(r => {
            const inCart = cart.find(c => c.resource.id === r.id);
            return (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                <div className={`h-32 flex items-center justify-center ${categoryColors[r.category] || 'bg-gray-100'}`}>
                  <Package className="w-12 h-12 opacity-30" />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight">{r.name}</h3>
                      <div className="text-xs text-gray-400 mt-0.5">{r.brand}</div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-lg flex-shrink-0 ${categoryColors[r.category]}`}>{r.category}</span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 flex-1">{r.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-gray-900">₹{r.price.toLocaleString('en-IN')}</div>
                      <div className="text-xs text-gray-400">per {r.unit}</div>
                    </div>
                    <div className="text-xs text-gray-400">{r.stock_quantity} in stock</div>
                  </div>
                  {inCart ? (
                    <div className="mt-3 flex items-center justify-between bg-green-50 rounded-xl px-3 py-2">
                      <button onClick={() => updateQty(r.id, -1)} className="text-green-700 hover:text-green-800"><Minus className="w-4 h-4" /></button>
                      <span className="font-semibold text-green-700">{inCart.qty}</span>
                      <button onClick={() => updateQty(r.id, 1)} className="text-green-700 hover:text-green-800"><Plus className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <button onClick={() => addToCart(r)} className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5">
                      <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cart drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setShowCart(false)} />
          <div className="bg-white w-full max-w-md shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> Your Cart ({cartCount})</h3>
              <button onClick={() => setShowCart(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            {orderSuccess ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Order Placed!</h3>
                <p className="text-gray-500 text-sm mt-2">Your order has been confirmed and will be delivered soon.</p>
              </div>
            ) : cart.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Your cart is empty</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {cart.map(c => (
                    <div key={c.resource.id} className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${categoryColors[c.resource.category]}`}>
                        <Package className="w-5 h-5 opacity-50" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">{c.resource.name}</div>
                        <div className="text-xs text-gray-500">₹{c.resource.price.toLocaleString('en-IN')} / {c.resource.unit}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(c.resource.id, -1)} className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"><Minus className="w-3 h-3" /></button>
                        <span className="text-sm font-semibold w-4 text-center">{c.qty}</span>
                        <button onClick={() => updateQty(c.resource.id, 1)} className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"><Plus className="w-3 h-3" /></button>
                      </div>
                      <div className="text-sm font-semibold text-gray-900 w-20 text-right">₹{(c.resource.price * c.qty).toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
                    <textarea value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" placeholder="Village, District, State, PIN" />
                  </div>
                </div>
                <div className="p-5 border-t border-gray-100">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-gray-600">Delivery</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="flex justify-between font-bold text-base mb-4">
                    <span>Total</span>
                    <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <button onClick={placeOrder} disabled={ordering} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                    {ordering ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Check className="w-4 h-4" />}
                    Place Order
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
