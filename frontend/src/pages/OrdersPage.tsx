import React, { useState, useEffect } from 'react';
import { ShoppingBag, ChevronRight, Clock, CheckCircle2, ShieldCheck, Zap, XCircle } from 'lucide-react';
import { Order } from '../types';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface OrdersPageProps {
  onSelectOrder: (orderId: string) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ onSelectOrder }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.id]);

  const filteredOrders = orders.filter((o) => {
    if (activeFilter === 'ACTIVE') return !['DELIVERED', 'CANCELLED', 'EXPIRED'].includes(o.status);
    if (activeFilter === 'COMPLETED') return ['DELIVERED', 'CANCELLED', 'EXPIRED'].includes(o.status);
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 bg-slate-50">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[#8c182b] tracking-tight">My Orders & Deliveries</h2>
          <p className="text-xs text-slate-600 font-medium">Track live status and chat with student runners</p>
        </div>
        <button
          onClick={fetchOrders}
          className="text-xs text-[#8c182b] font-bold hover:underline"
        >
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
            activeFilter === 'ALL' ? 'bg-[#8c182b] text-white shadow' : 'text-slate-600'
          }`}
        >
          All ({orders.length})
        </button>
        <button
          onClick={() => setActiveFilter('ACTIVE')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
            activeFilter === 'ACTIVE' ? 'bg-[#8c182b] text-white shadow' : 'text-slate-600'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setActiveFilter('COMPLETED')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
            activeFilter === 'COMPLETED' ? 'bg-[#8c182b] text-white shadow' : 'text-slate-600'
          }`}
        >
          Completed
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 bg-white border border-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-500 space-y-2 shadow-sm">
          <ShoppingBag className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="font-bold text-slate-800">No orders found in this category.</p>
          <p>Request food, stationery, or medicines from campus stores!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const isRunner = order.runnerId === user?.id;

            return (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order.id)}
                className="bg-white border border-slate-200 hover:border-[#8c182b] rounded-2xl p-3.5 space-y-2 cursor-pointer transition-all shadow-sm group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-900">#{order.orderNumber}</span>
                    <span className="text-[10px] bg-rose-50 text-[#8c182b] font-bold px-2 py-0.5 rounded border border-rose-200">
                      {order.store.name}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      order.status === 'DELIVERED'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : order.status === 'CANCELLED'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div>
                    <p className="text-slate-700 font-medium">
                      {isRunner
                        ? `Customer: ${order.customer.fullName} (${order.customer.hostel})`
                        : order.runner
                        ? `Runner: ${order.runner.fullName}`
                        : 'Waiting for Student Runner...'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-black text-[#8c182b] text-sm">₹{(order.estimatedCost + order.deliveryFee).toFixed(0)}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#8c182b]" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
