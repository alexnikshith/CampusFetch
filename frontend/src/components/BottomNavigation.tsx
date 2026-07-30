import React from 'react';
import { Home, Store, Navigation, ShoppingBag, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface BottomNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'stores', label: 'Stores', icon: Store },
    { id: 'runner', label: "I'm Going", icon: Navigation, highlight: true },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    ...(user?.role === 'ADMIN' ? [{ id: 'admin', label: 'Admin', icon: Shield }] : []),
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around z-30 shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        if (item.highlight) {
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-center -mt-5 relative group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-[#8c182b] flex items-center justify-center shadow-lg shadow-rose-900/20 group-hover:scale-105 transition-all ring-4 ring-white">
                <Icon className="w-6 h-6 text-white animate-pulse" />
              </div>
              <span className="text-[10px] font-extrabold text-[#8c182b] mt-0.5">{item.label}</span>
            </button>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              isActive
                ? 'text-[#8c182b] font-black bg-rose-50 scale-105'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
