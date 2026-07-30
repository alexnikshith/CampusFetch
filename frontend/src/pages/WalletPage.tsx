import React, { useState, useEffect } from 'react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, ShieldCheck, Sparkles, RefreshCw, CreditCard } from 'lucide-react';
import { Transaction } from '../types';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const WalletPage: React.FC = () => {
  const { user, updateUserLocal } = useAuth();
  const [walletBalance, setWalletBalance] = useState<number>(user?.walletBalance || 0);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmt, setWithdrawAmt] = useState('100');
  const [upiId, setUpiId] = useState(user?.phone ? `${user.phone}@upi` : '');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchWallet = async () => {
    try {
      const res = await api.get('/wallet');
      if (res.data.success) {
        setWalletBalance(res.data.walletBalance);
        setTotalEarnings(res.data.totalEarnings);
        setTransactions(res.data.transactions);
        updateUserLocal({ walletBalance: res.data.walletBalance });
      }
    } catch (err) {
      console.error('Failed to fetch wallet:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, [user?.id]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/wallet/withdraw', { amount: withdrawAmt, upiId });
      if (res.data.success) {
        alert(res.data.message);
        setShowWithdrawModal(false);
        fetchWallet();
      } else {
        alert(res.data.error || 'Withdrawal failed');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Withdrawal request failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 bg-slate-50">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[#8c182b] tracking-tight">Student Campus Wallet</h2>
          <p className="text-xs text-slate-600 font-medium">Track delivery earnings, cashback & instant payouts</p>
        </div>
        <button
          onClick={fetchWallet}
          className="text-xs text-[#8c182b] font-bold hover:underline flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Main Wallet Card */}
      <div className="bg-[#8c182b] text-white border border-rose-950 rounded-3xl p-5 shadow-lg space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs text-rose-100 font-bold tracking-wider uppercase">
            Available Wallet Balance
          </span>
          <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/30">
            UPI Ready
          </span>
        </div>

        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            ₹{walletBalance.toFixed(2)}
          </h1>
          <p className="text-xs text-rose-100 mt-1">
            Total Lifetime Delivery Earnings: <strong className="text-amber-300">₹{totalEarnings.toFixed(2)}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="flex-1 bg-white text-[#8c182b] hover:bg-slate-100 font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md"
          >
            <ArrowUpRight className="w-4 h-4" /> Withdraw to UPI
          </button>
        </div>
      </div>

      {/* Transactions History */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-black text-[#8c182b] uppercase tracking-wider">
          Recent Wallet Transactions ({transactions.length})
        </h3>

        {transactions.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500 shadow-sm">
            No transactions yet. Complete deliveries to earn cash!
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-white border border-slate-200 rounded-2xl p-3 flex items-center justify-between text-xs shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
                      tx.type === 'EARNING' || tx.type === 'CASHBACK'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {tx.type === 'EARNING' || tx.type === 'CASHBACK' ? '+' : '-'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 leading-tight">{tx.description}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(tx.createdAt).toLocaleDateString()} • {tx.type}
                    </p>
                  </div>
                </div>

                <span
                  className={`font-black text-sm ${
                    tx.type === 'EARNING' || tx.type === 'CASHBACK' ? 'text-emerald-700' : 'text-[#8c182b]'
                  }`}
                >
                  {tx.type === 'EARNING' || tx.type === 'CASHBACK' ? '+' : '-'}₹{tx.amount.toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-black text-[#8c182b]">Withdraw Earnings to UPI</h3>

            <form onSubmit={handleWithdraw} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Withdrawal Amount (₹)</label>
                <input
                  type="number"
                  required
                  min={10}
                  max={walletBalance}
                  value={withdrawAmt}
                  onChange={(e) => setWithdrawAmt(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8c182b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">UPI VPA Address</label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="student@upi / 9876543210@paytm"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8c182b]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#8c182b] hover:bg-[#731222] text-white font-black py-2.5 rounded-xl text-xs shadow-md"
                >
                  {submitting ? 'Processing...' : 'Confirm Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
