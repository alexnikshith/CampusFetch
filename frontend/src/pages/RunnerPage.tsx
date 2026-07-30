import React, { useState, useEffect } from 'react';
import { Navigation, Store, Clock, Users, CheckCircle, Phone, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';
import { Store as StoreType, Order, RunnerTrip } from '../types';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

interface RunnerPageProps {
  onOpenChat: (orderId: string) => void;
}

export const RunnerPage: React.FC<RunnerPageProps> = ({ onOpenChat }) => {
  const { user } = useAuth();
  const { socket, showToast } = useSocket();

  const [stores, setStores] = useState<StoreType[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [estimatedArrival, setEstimatedArrival] = useState('10 mins');
  const [availableDuration, setAvailableDuration] = useState('30 mins');
  const [maxOrders, setMaxOrders] = useState(3);

  const [activeTrip, setActiveTrip] = useState<RunnerTrip | null>(null);
  const [matchingOrders, setMatchingOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRunnerState = async () => {
    try {
      const storeRes = await api.get('/stores');
      if (storeRes.data.success) {
        setStores(storeRes.data.stores);
        if (storeRes.data.stores.length > 0 && !selectedStoreId) {
          setSelectedStoreId(storeRes.data.stores[0].id);
        }
      }

      const matchingRes = await api.get('/runner/available-orders');
      if (matchingRes.data.success) {
        setActiveTrip(matchingRes.data.activeTrip);
        setMatchingOrders(matchingRes.data.pendingOrders || []);
      }
    } catch (err) {
      console.error('Failed to load runner state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRunnerState();
  }, []);

  const handleBroadcastTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await api.post('/runner/trip', {
        storeId: selectedStoreId,
        estimatedArrival,
        availableDuration,
        maxOrders,
      });

      if (res.data.success) {
        setActiveTrip(res.data.trip);
        setMatchingOrders(res.data.matchingOrders || []);
        showToast('🚀 Trip Broadcasted!', `Customers notified that you are visiting store!`, 'success');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to broadcast trip');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const res = await api.post(`/orders/${orderId}/accept`);
      if (res.data.success) {
        showToast('✅ Order Accepted!', 'In-app chat enabled with customer.', 'success');
        onOpenChat(orderId);
        loadRunnerState();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to accept order');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 bg-slate-50">
      {/* Top Banner */}
      <div className="bg-[#8c182b] text-white p-4 rounded-3xl shadow-md space-y-1">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-amber-300 animate-bounce" />
          <h2 className="text-lg font-black">Runner Trip Broadcast</h2>
        </div>
        <p className="text-xs text-rose-100 font-medium">
          Going to a campus store? Broadcast your trip to filter and accept matching student requests along your path!
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-medium">
          {error}
        </div>
      )}

      {/* Step 1: Declare Trip Form */}
      <form onSubmit={handleBroadcastTrip} className="bg-white border border-slate-200 rounded-3xl p-4 space-y-3 shadow-sm">
        <h3 className="text-xs font-black text-[#8c182b] uppercase tracking-wider flex items-center gap-1.5">
          <Store className="w-4 h-4 text-[#8c182b]" /> Declare "I'm Going To"
        </h3>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Destination Campus Store</label>
          <select
            value={selectedStoreId}
            onChange={(e) => setSelectedStoreId(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8c182b]"
          >
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.category}) - {s.location}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[10px] font-bold text-slate-700 mb-1">Estimated Arrival</label>
            <select
              value={estimatedArrival}
              onChange={(e) => setEstimatedArrival(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-2 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8c182b]"
            >
              <option value="5 mins">5 mins</option>
              <option value="10 mins">10 mins</option>
              <option value="15 mins">15 mins</option>
              <option value="30 mins">30 mins</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-700 mb-1">Available Duration</label>
            <select
              value={availableDuration}
              onChange={(e) => setAvailableDuration(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-2 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8c182b]"
            >
              <option value="20 mins">20 mins</option>
              <option value="30 mins">30 mins</option>
              <option value="45 mins">45 mins</option>
              <option value="1 hour">1 hour</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-700 mb-1">Max Capacity</label>
            <select
              value={maxOrders}
              onChange={(e) => setMaxOrders(Number(e.target.value))}
              className="w-full bg-white border border-slate-300 rounded-xl px-2 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8c182b]"
            >
              <option value={1}>1 Order</option>
              <option value={2}>2 Orders</option>
              <option value={3}>3 Orders</option>
              <option value={5}>5 Orders</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#8c182b] hover:bg-[#731222] text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
        >
          {submitting ? 'Broadcasting Trip...' : 'Broadcast "I\'m Going" & Find Orders 📢'}
        </button>
      </form>

      {/* Active Trip Status Badge */}
      {activeTrip && (
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between text-xs text-emerald-900 shadow-sm font-bold">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>
              Active Trip: {activeTrip.store.name} (ETA: {activeTrip.estimatedArrival})
            </span>
          </div>
          <span className="text-slate-600 text-[11px]">Cap: {activeTrip.maxOrders} orders</span>
        </div>
      )}

      {/* Step 2: Relevant Pending Orders List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-[#8c182b] uppercase tracking-wider">
            Matching Store Requests ({matchingOrders.length})
          </h3>
          <span className="text-[10px] text-amber-700 font-bold">Priority First</span>
        </div>

        {matchingOrders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500 space-y-2 shadow-sm">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-bold text-slate-700">No pending orders for selected store right now.</p>
            <p className="text-[11px]">Select a different store above or check back in a few minutes!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {matchingOrders.map((order) => {
              const parsedItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;

              return (
                <div
                  key={order.id}
                  className="bg-white border border-slate-200 hover:border-[#8c182b] rounded-2xl p-3.5 space-y-3 shadow-sm transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-sm text-slate-900">{order.customer.fullName}</span>
                      <p className="text-[11px] text-slate-500">
                        {order.customer.hostel} • Room {order.customer.roomNumber}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-sm text-[#8c182b]">+₹{order.deliveryFee} Fee</span>
                      <p className="text-[10px] text-slate-500">Est. Items: ~₹{order.estimatedCost}</p>
                    </div>
                  </div>

                  {/* Priority Tag */}
                  {order.priority === 'URGENT' && (
                    <div className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-300 inline-flex items-center gap-1">
                      ⚡ URGENT DELIVERY REQUEST
                    </div>
                  )}

                  {/* Items List */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1">
                    <span className="text-[10px] text-[#8c182b] font-bold uppercase">Requested Items:</span>
                    {Array.isArray(parsedItems) ? (
                      parsedItems.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-slate-700">
                          <span>• {item.name}</span>
                          <span className="font-bold text-slate-900">x{item.quantity}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-700">{order.items}</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleAcceptOrder(order.id)}
                      className="flex-1 bg-[#8c182b] hover:bg-[#731222] text-white font-black py-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Accept & Pick Up
                    </button>
                    <button
                      onClick={() => onOpenChat(order.id)}
                      className="bg-white hover:bg-slate-50 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs flex items-center justify-center gap-1 border border-slate-300 shadow-sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#8c182b]" /> Chat
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
