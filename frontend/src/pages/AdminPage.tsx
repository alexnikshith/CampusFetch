import React, { useState, useEffect } from 'react';
import { Shield, Users, Store as StoreIcon, BarChart3, Download, Search, Plus, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { User, Store, Order, PlatformAnalytics } from '../types';
import api from '../services/api';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'USERS' | 'STORES' | 'ORDERS'>('ANALYTICS');
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchUser, setSearchUser] = useState('');
  const [loading, setLoading] = useState(true);

  // New Store Form State
  const [showAddStore, setShowAddStore] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreCategory, setNewStoreCategory] = useState('CANTEEN');
  const [newStoreLocation, setNewStoreLocation] = useState('');
  const [newStoreFee, setNewStoreFee] = useState('10');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const analyticsRes = await api.get('/admin/analytics');
      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.analytics);

      const usersRes = await api.get('/admin/users');
      if (usersRes.data.success) setUsers(usersRes.data.users);

      const storesRes = await api.get('/stores');
      if (storesRes.data.success) setStores(storesRes.data.stores);

      const ordersRes = await api.get('/orders');
      if (ordersRes.data.success) setOrders(ordersRes.data.orders);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleStoreStatus = async (storeId: string, currentOpen: boolean) => {
    try {
      const res = await api.put(`/stores/${storeId}`, { isOpen: !currentOpen });
      if (res.data.success) {
        setStores((prev) => prev.map((s) => (s.id === storeId ? { ...s, isOpen: !currentOpen } : s)));
      }
    } catch (err) {
      alert('Failed to update store status');
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/stores', {
        name: newStoreName,
        category: newStoreCategory,
        location: newStoreLocation,
        deliveryFeeBase: newStoreFee,
      });
      if (res.data.success) {
        setShowAddStore(false);
        setNewStoreName('');
        setNewStoreLocation('');
        fetchAdminData();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create store');
    }
  };

  const handleSuspendUser = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await api.patch(`/admin/users/${userId}`, { status: newStatus });
      if (res.data.success) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: newStatus as any } : u)));
      }
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  const handleExportCsv = (type: 'orders' | 'users') => {
    window.open(`/api/admin/export?type=${type}`, '_blank');
  };

  const filteredUsers = users.filter((u) =>
    u.fullName.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.username.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 bg-slate-50">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[#8c182b] tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#8c182b]" /> Platform Admin Dashboard
          </h2>
          <p className="text-xs text-slate-600 font-medium">Full governance for Amrita Vishwa Vidyapeetham</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleExportCsv('orders')}
            className="bg-white hover:bg-slate-50 text-[#8c182b] font-bold px-2.5 py-1.5 rounded-xl text-[11px] border border-slate-300 flex items-center gap-1 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Orders CSV
          </button>
          <button
            onClick={() => handleExportCsv('users')}
            className="bg-white hover:bg-slate-50 text-[#8c182b] font-bold px-2.5 py-1.5 rounded-xl text-[11px] border border-slate-300 flex items-center gap-1 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Users CSV
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex bg-white p-1 rounded-2xl border border-slate-200 text-xs font-bold shadow-sm">
        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={`flex-1 py-2 rounded-xl transition ${activeTab === 'ANALYTICS' ? 'bg-[#8c182b] text-white shadow' : 'text-slate-600'}`}
        >
          Analytics 📊
        </button>
        <button
          onClick={() => setActiveTab('USERS')}
          className={`flex-1 py-2 rounded-xl transition ${activeTab === 'USERS' ? 'bg-[#8c182b] text-white shadow' : 'text-slate-600'}`}
        >
          Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('STORES')}
          className={`flex-1 py-2 rounded-xl transition ${activeTab === 'STORES' ? 'bg-[#8c182b] text-white shadow' : 'text-slate-600'}`}
        >
          Stores ({stores.length})
        </button>
        <button
          onClick={() => setActiveTab('ORDERS')}
          className={`flex-1 py-2 rounded-xl transition ${activeTab === 'ORDERS' ? 'bg-[#8c182b] text-white shadow' : 'text-slate-600'}`}
        >
          Orders ({orders.length})
        </button>
      </div>

      {/* Tab 1: Platform Analytics */}
      {activeTab === 'ANALYTICS' && analytics && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-sm">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Total Registered</span>
              <h3 className="text-xl font-black text-slate-900">{analytics.totalUsers} Students</h3>
            </div>
            <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-sm">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Total Orders</span>
              <h3 className="text-xl font-black text-slate-900">{analytics.totalOrders} Placed</h3>
            </div>
            <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-sm">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Platform Delivery Revenue</span>
              <h3 className="text-xl font-black text-emerald-700">₹{analytics.totalRevenue.toFixed(1)}</h3>
            </div>
            <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-sm">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Total GMV Volume</span>
              <h3 className="text-xl font-black text-[#8c182b]">₹{analytics.totalGMV.toFixed(1)}</h3>
            </div>
          </div>

          {/* Store Breakdown List */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 space-y-3 shadow-sm">
            <h3 className="text-xs font-black text-[#8c182b] uppercase tracking-wider">
              Store Order Distribution
            </h3>
            <div className="space-y-2">
              {analytics.storeAnalytics.map((st) => (
                <div key={st.id} className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-900">{st.name}</span>
                    <span className="text-[10px] text-slate-500 ml-2">({st.category})</span>
                  </div>
                  <span className="font-black text-[#8c182b]">{st.orderCount} Orders</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: User Moderation */}
      {activeTab === 'USERS' && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              placeholder="Search users by name, email, or hostel..."
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8c182b]"
            />
          </div>

          <div className="space-y-2">
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between text-xs shadow-sm"
              >
                <div>
                  <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    {u.fullName} ({u.username})
                    <span className="text-[9px] bg-rose-50 text-[#8c182b] font-bold px-1.5 py-0.2 rounded border border-rose-200">
                      {u.role}
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {u.email} • {u.hostel} Room {u.roomNumber}
                  </p>
                  <p className="text-[10px] text-emerald-700 font-bold mt-0.5">
                    Trust Score: {u.trustScore}%
                  </p>
                </div>

                <button
                  onClick={() => handleSuspendUser(u.id, u.status)}
                  className={`px-3 py-1.5 rounded-xl font-extrabold text-[10px] transition ${
                    u.status === 'ACTIVE'
                      ? 'bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  {u.status === 'ACTIVE' ? 'Suspend User' : 'Reactivate'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Dynamic Store Manager */}
      {activeTab === 'STORES' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-[#8c182b] uppercase">Dynamic Store Management</h3>
            <button
              onClick={() => setShowAddStore(true)}
              className="bg-[#8c182b] hover:bg-[#731222] text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add New Campus Store
            </button>
          </div>

          {showAddStore && (
            <form onSubmit={handleCreateStore} className="bg-white border border-[#8c182b] p-4 rounded-2xl space-y-3 shadow-md">
              <h4 className="text-xs font-bold text-[#8c182b]">Create New Campus Store</h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Store Name"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
                <select
                  value={newStoreCategory}
                  onChange={(e) => setNewStoreCategory(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                >
                  <option value="CANTEEN">CANTEEN</option>
                  <option value="GENERAL">GENERAL</option>
                  <option value="STATIONERY">STATIONERY</option>
                  <option value="PHARMACY">PHARMACY</option>
                </select>
              </div>
              <input
                type="text"
                required
                placeholder="Campus Location (e.g. Academic Block 3)"
                value={newStoreLocation}
                onChange={(e) => setNewStoreLocation(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStore(false)}
                  className="flex-1 bg-slate-100 text-slate-700 font-bold py-2 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#8c182b] text-white font-bold py-2 rounded-xl text-xs shadow-sm"
                >
                  Save Store
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {stores.map((st) => (
              <div key={st.id} className="bg-white border border-slate-200 p-3 rounded-2xl flex items-center justify-between text-xs shadow-sm">
                <div>
                  <h4 className="font-extrabold text-slate-900">{st.name}</h4>
                  <p className="text-[10px] text-slate-500">{st.location} • Base Fee: ₹{st.deliveryFeeBase}</p>
                </div>
                <button
                  onClick={() => handleToggleStoreStatus(st.id, st.isOpen)}
                  className={`px-3 py-1 rounded-xl text-[10px] font-bold border transition ${
                    st.isOpen
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  {st.isOpen ? 'Store Open ✓' : 'Store Closed ✕'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Live Orders Monitor */}
      {activeTab === 'ORDERS' && (
        <div className="space-y-2">
          {orders.map((o) => (
            <div key={o.id} className="bg-white border border-slate-200 p-3 rounded-2xl flex items-center justify-between text-xs shadow-sm">
              <div>
                <span className="font-extrabold text-slate-900">Order #{o.orderNumber}</span>
                <p className="text-[10px] text-slate-500">{o.store.name} • Customer: {o.customer.fullName}</p>
              </div>
              <span className="text-[10px] bg-rose-50 text-[#8c182b] font-bold px-2 py-0.5 rounded-full border border-rose-200">
                {o.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
