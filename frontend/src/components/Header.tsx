import React from 'react';
import { Bell, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNotifications }) => {
  const { user } = useAuth();

  return (
    <header className="bg-[#8c182b] text-white px-4 py-3 flex items-center justify-between z-20 shadow-md">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-white p-0.5 shadow-md">
            <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center font-black text-[#8c182b] text-sm overflow-hidden border border-slate-200">
              {user?.profilePic ? (
                <img src={user.profilePic} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                user?.fullName.charAt(0) || 'U'
              )}
            </div>
          </div>
          <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#8c182b] absolute bottom-0 right-0" />
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-extrabold text-sm text-white leading-tight">{user?.fullName || 'Guest Student'}</h3>
            {user?.trustScore && user.trustScore >= 90 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded flex items-center gap-0.5 shadow-sm">
                <Sparkles className="w-2.5 h-2.5" /> Hero
              </span>
            )}
          </div>
          <p className="text-[11px] text-rose-100 font-medium">
            {user?.hostel ? `${user.hostel} • ${user.roomNumber}` : 'Amrita Vishwa Vidyapeetham'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Trust Score Pill */}
        <div className="flex items-center gap-1 bg-white/10 border border-white/20 px-2.5 py-1 rounded-full text-xs text-white">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
          <span className="text-rose-100 text-[11px]">Trust:</span>
          <span className="font-extrabold text-emerald-300">{user?.trustScore || 85}%</span>
        </div>

        {/* Notification Icon */}
        <button
          onClick={onOpenNotifications}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition relative"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1 right-1" />
        </button>
      </div>
    </header>
  );
};
