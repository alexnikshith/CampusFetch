import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Navigation, Clock, ShieldCheck, ArrowRight, Zap, ShoppingBag, Flame, Star, Coffee, Printer, Pill, ChevronRight } from 'lucide-react';
import { Store, Order } from '../types';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface HomePageProps {
  onSelectStore: (store: Store) => void;
  onNavigateTab: (tab: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectStore, onNavigateTab }) => {
  const { user } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storeRes = await api.get('/stores');
        if (storeRes.data.success) {
          setStores(storeRes.data.stores);
        }

        if (user) {
          const orderRes = await api.get('/orders?role=CUSTOMER');
          if (orderRes.data.success) {
            setActiveOrders(orderRes.data.orders.filter((o: Order) => !['DELIVERED', 'CANCELLED', 'EXPIRED'].includes(o.status)));
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  const filteredStores = stores.filter((s) => {
    const matchesCat = selectedCategory === 'ALL' || s.category === selectedCategory;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-20 bg-slate-50">
      {/* Search & Greeting Hero Card */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-[#8c182b] tracking-tight">
              Welcome! {user?.fullName || 'GURRAM NIKSHITH'} 👋
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Amrita Peer-to-Peer Campus Logistics Network
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('runner')}
            className="flex items-center gap-1.5 bg-[#8c182b] hover:bg-[#731222] text-white px-3 py-1.5 rounded-full text-xs font-extrabold shadow-md hover:scale-105 transition"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>I'm Going To Store</span>
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Main Canteen, IT Canteen, Stationery..."
            className="w-full bg-white border border-slate-300 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8c182b] shadow-sm"
          />
        </div>
      </div>

      {/* Live Active Order Banner */}
      {activeOrders.length > 0 && (
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-[#8c182b] border border-rose-950 text-white rounded-2xl p-3.5 cursor-pointer shadow-lg flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#8c182b] flex items-center justify-center font-bold shadow">
              <ShoppingBag className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs text-white">Active Order #{activeOrders[0].orderNumber}</span>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                  {activeOrders[0].status}
                </span>
              </div>
              <p className="text-[11px] text-rose-100 mt-0.5">
                {activeOrders[0].store.name} • {activeOrders[0].runner ? `Runner: ${activeOrders[0].runner.fullName}` : 'Finding Runner...'}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Quick Campus Actions */}
      <div>
        <h3 className="text-xs font-black text-[#8c182b] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#8c182b]" /> Quick Campus Actions
        </h3>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setSelectedCategory('CANTEEN')}
            className="bg-white border border-slate-200 hover:border-[#8c182b] p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-sm transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-[#8c182b] flex items-center justify-center group-hover:scale-110 transition">
              <Coffee className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-700">Canteens</span>
          </button>

          <button
            onClick={() => setSelectedCategory('STATIONERY')}
            className="bg-white border border-slate-200 hover:border-[#8c182b] p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-sm transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition">
              <Printer className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-700">Printouts</span>
          </button>

          <button
            onClick={() => setSelectedCategory('PHARMACY')}
            className="bg-white border border-slate-200 hover:border-[#8c182b] p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-sm transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition">
              <Pill className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-700">Pharmacy</span>
          </button>

          <button
            onClick={() => setSelectedCategory('GENERAL')}
            className="bg-white border border-slate-200 hover:border-[#8c182b] p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-sm transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-110 transition">
              <Flame className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-700">General</span>
          </button>
        </div>
      </div>

      {/* Live Runner Trips Broadcast */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="text-xs font-black text-[#8c182b]">Live Student Movement</h3>
          </div>
          <span className="text-[10px] text-slate-500 font-bold">Amrita Campus</span>
        </div>
        <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#8c182b] text-white font-bold text-[10px] flex items-center justify-center">
              RS
            </div>
            <div>
              <p className="font-bold text-slate-900 text-[11px]">Rahul Sharma is going to Main Canteen</p>
              <p className="text-[10px] text-slate-500">ETA: 10 mins • Available for 2 more orders</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('stores')}
            className="bg-[#8c182b] hover:bg-[#731222] text-white font-bold px-2.5 py-1 rounded-lg text-[10px] shadow-sm"
          >
            Request
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {['ALL', 'CANTEEN', 'GENERAL', 'STATIONERY', 'PHARMACY'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-[#8c182b] text-white shadow-md'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            {cat === 'ALL' ? 'All Stores' : cat}
          </button>
        ))}
      </div>

      {/* Stores List */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-black text-[#8c182b] uppercase tracking-wider">
            Amrita Campus Stores ({filteredStores.length})
          </h3>
          <span className="text-[10px] text-slate-500 font-semibold">Dynamic Admin Management</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 bg-white rounded-2xl animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredStores.map((store) => (
              <div
                key={store.id}
                onClick={() => onSelectStore(store)}
                className="bg-white border border-slate-200 hover:border-[#8c182b] rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] shadow-sm group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden relative flex-shrink-0 border border-slate-200">
                    <img
                      src={store.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500'}
                      alt={store.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    />
                    <span className="absolute top-1 left-1 bg-white/90 text-amber-600 text-[10px] font-bold px-1 rounded flex items-center gap-0.5 shadow-sm">
                      <Star className="w-2.5 h-2.5 fill-amber-500" /> {store.rating || 4.8}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-[#8c182b] transition">
                      {store.name}
                    </h4>
                    <p className="text-[11px] text-slate-500">{store.location}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-[#8c182b] font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                        Base Fee: ₹{store.deliveryFeeBase}
                      </span>
                      <span className="text-[10px] text-slate-500">{store.operatingHours}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-slate-400 group-hover:text-[#8c182b]">
                  <span className="text-[11px] font-bold hidden sm:inline">Request Items</span>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
