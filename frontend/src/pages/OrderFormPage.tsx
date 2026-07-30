import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Zap, CreditCard, Clock, Sparkles, CheckCircle, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Store, OrderItem } from '../types';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface OrderFormPageProps {
  store: Store;
  onBack: () => void;
  onOrderSuccess: () => void;
}

export const OrderFormPage: React.FC<OrderFormPageProps> = ({ store, onBack, onOrderSuccess }) => {
  const { user } = useAuth();

  const [items, setItems] = useState<OrderItem[]>([
    { name: 'Tea / Coffee', quantity: 1, approxPrice: 15 },
    { name: 'Samosa / Puffs', quantity: 2, approxPrice: 20 },
  ]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState(25);

  const [maxBudget, setMaxBudget] = useState('150');
  const [notes, setNotes] = useState('Please ask for extra green chutney if available!');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CASH'>('UPI');
  const [priority, setPriority] = useState<'NORMAL' | 'URGENT'>('NORMAL');
  const [expectedDeliveryTime, setExpectedDeliveryTime] = useState('Within 30 mins');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItem = () => {
    if (!newItemName.trim()) return;
    setItems([...items, { name: newItemName.trim(), quantity: newItemQty, approxPrice: newItemPrice }]);
    setNewItemName('');
    setNewItemQty(1);
    setNewItemPrice(20);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateApproxTotal = () => {
    return items.reduce((sum, item) => sum + item.approxPrice * item.quantity, 0);
  };

  const estTotal = calculateApproxTotal();
  // Delivery Fee calculation: Minimum ₹5, Maximum ₹30, or 10% of order amount, whichever is lower.
  const calcFee = Math.max(5, Math.min(30, estTotal * 0.10));

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('Please add at least one item to your request');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/orders', {
        storeId: store.id,
        items,
        notes,
        maxBudget: parseFloat(maxBudget) || estTotal + 20,
        paymentMethod,
        priority,
        expectedDeliveryTime,
      });

      if (res.data.success) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        onOrderSuccess();
      } else {
        setError(res.data.error || 'Failed to place order');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit order request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 bg-slate-50">
      {/* Header Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-white border border-slate-300 flex items-center justify-center text-slate-700 hover:text-[#8c182b] shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-black text-[#8c182b] tracking-tight">Create Item Request</h2>
          <p className="text-xs text-slate-600 font-bold">{store.name} • {store.location}</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="space-y-4">
        {/* Customer Auto-filled Info Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Delivery Destination:</span>
            <span className="font-extrabold text-[#8c182b]">{user?.hostel} (Room {user?.roomNumber})</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Student Contact:</span>
            <span className="font-bold text-slate-900">{user?.fullName} ({user?.phone})</span>
          </div>
        </div>

        {/* Item List Builder */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-3 shadow-sm">
          <h3 className="text-xs font-black text-[#8c182b] uppercase tracking-wider">
            Items Required ({items.length})
          </h3>

          <div className="space-y-2">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900">{item.name}</span>
                  <span className="text-slate-500 ml-2 font-semibold">x{item.quantity}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-[#8c182b]">~₹{item.approxPrice * item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="text-rose-600 hover:text-rose-800 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Item Input Form */}
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="Item name (e.g. Blue Pen, Milk, Paracetamol)"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8c182b]"
            />
            <input
              type="number"
              min={1}
              value={newItemQty}
              onChange={(e) => setNewItemQty(Number(e.target.value))}
              className="w-12 bg-white border border-slate-300 rounded-xl px-2 py-2 text-xs text-slate-900 text-center focus:outline-none focus:border-[#8c182b]"
            />
            <button
              type="button"
              onClick={addItem}
              className="bg-[#8c182b] hover:bg-[#731222] text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center justify-center shadow-sm"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Priority & Delivery Time */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-600" /> Priority
            </label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPriority('NORMAL')}
                className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition ${
                  priority === 'NORMAL' ? 'bg-[#8c182b] text-white' : 'text-slate-600'
                }`}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setPriority('URGENT')}
                className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition ${
                  priority === 'URGENT' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-600'
                }`}
              >
                Urgent ⚡
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-[#8c182b]" /> Payment
            </label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition ${
                  paymentMethod === 'UPI' ? 'bg-[#8c182b] text-white' : 'text-slate-600'
                }`}
              >
                UPI
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition ${
                  paymentMethod === 'CASH' ? 'bg-emerald-600 text-white' : 'text-slate-600'
                }`}
              >
                Cash
              </button>
            </div>
          </div>
        </div>

        {/* Budget Limit & Notes */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-3 shadow-sm">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Maximum Budget (₹)
            </label>
            <input
              type="number"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8c182b]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Additional Notes / Room Directions
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Please bring extra chutney or leave outside room 304"
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8c182b]"
            />
          </div>
        </div>

        {/* Fee Calculation Breakdown Summary */}
        <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">Estimated Items Cost:</span>
            <span className="font-bold text-slate-900">~₹{estTotal}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">Platform Delivery Fee (Min ₹5, Max ₹30 Rule):</span>
            <span className="font-extrabold text-[#8c182b]">₹{calcFee.toFixed(1)}</span>
          </div>
          <hr className="border-rose-200" />
          <div className="flex items-center justify-between text-xs font-black">
            <span className="text-slate-900">Total Approx Budget:</span>
            <span className="text-[#8c182b] text-sm">~₹{(estTotal + calcFee).toFixed(1)}</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#8c182b] hover:bg-[#731222] text-white font-extrabold py-3.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
        >
          {loading ? 'Submitting Order...' : 'Submit Request to Campus Runners 🚀'}
        </button>
      </form>
    </div>
  );
};
