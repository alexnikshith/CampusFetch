import React, { useState } from 'react';
import { Smartphone, Monitor, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const [frameMode, setFrameMode] = useState<'iphone' | 'android' | 'full'>('iphone');
  const { user, switchDemoUser } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-start selection:bg-rose-700 selection:text-white">
      {/* Official Amrita Crimson Red Top Header */}
      <header className="w-full bg-[#8c182b] text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs z-40 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white text-[#8c182b] flex items-center justify-center font-black text-sm shadow">
            CF
          </div>
          <div>
            <span className="font-black text-sm tracking-tight">CampusFetch</span>
            <span className="ml-2 text-[10px] bg-white/20 text-white font-bold px-2 py-0.5 rounded-full border border-white/30">
              Amrita Vishwa Vidyapeetham
            </span>
          </div>
        </div>

        {/* Viewport Switcher */}
        <div className="flex items-center bg-black/20 rounded-lg p-1 border border-white/10 shadow-inner">
          <button
            onClick={() => setFrameMode('iphone')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              frameMode === 'iphone'
                ? 'bg-white text-[#8c182b] font-bold shadow'
                : 'text-rose-100 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>iPhone 15</span>
          </button>
          <button
            onClick={() => setFrameMode('android')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              frameMode === 'android'
                ? 'bg-white text-[#8c182b] font-bold shadow'
                : 'text-rose-100 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android</span>
          </button>
          <button
            onClick={() => setFrameMode('full')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              frameMode === 'full'
                ? 'bg-white text-[#8c182b] font-bold shadow'
                : 'text-rose-100 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Full Desktop View</span>
          </button>
        </div>

        {/* Demo Role Account Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-rose-100 hidden sm:inline flex items-center gap-1 font-semibold">
            <UserCheck className="w-3 h-3 text-amber-300" /> Switch Demo Role:
          </span>
          <button
            onClick={() => switchDemoUser('nikshith@cb.amrita.edu')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition ${
              user?.role === 'CUSTOMER'
                ? 'bg-white text-[#8c182b] border-white shadow'
                : 'bg-black/20 text-white border-white/20 hover:bg-black/30'
            }`}
          >
            Customer
          </button>
          <button
            onClick={() => switchDemoUser('rahul@cb.amrita.edu')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition ${
              user?.role === 'RUNNER'
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow'
                : 'bg-black/20 text-white border-white/20 hover:bg-black/30'
            }`}
          >
            Runner
          </button>
          <button
            onClick={() => switchDemoUser('admin@amrita.edu')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition ${
              user?.role === 'ADMIN'
                ? 'bg-purple-200 text-purple-950 border-white shadow'
                : 'bg-black/20 text-white border-white/20 hover:bg-black/30'
            }`}
          >
            Admin
          </button>
        </div>
      </header>

      {/* Main Viewport Container */}
      <main className="flex-1 w-full flex items-center justify-center p-2 sm:p-6 overflow-hidden">
        {frameMode === 'full' ? (
          <div className="w-full max-w-5xl h-[88vh] bg-white rounded-2xl border border-slate-300 shadow-2xl flex flex-col overflow-hidden relative">
            {children}
          </div>
        ) : (
          <div
            className={`relative transition-all duration-300 shadow-2xl overflow-hidden flex flex-col bg-white border border-slate-300 ${
              frameMode === 'iphone'
                ? 'w-[390px] h-[840px] rounded-[48px] border-[10px] border-slate-800 ring-1 ring-black/10'
                : 'w-[400px] h-[830px] rounded-[36px] border-[8px] border-slate-800 ring-1 ring-black/10'
            }`}
          >
            {/* Phone Notch */}
            {frameMode === 'iphone' ? (
              <div className="w-28 h-6 bg-black rounded-b-2xl absolute top-0 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-800 mr-2" />
                <div className="w-2 h-2 rounded-full bg-slate-800" />
              </div>
            ) : (
              <div className="w-4 h-4 bg-black rounded-full absolute top-3 left-1/2 -translate-x-1/2 z-50 border border-slate-800" />
            )}

            {/* Mobile App Viewport */}
            <div className="w-full h-full flex flex-col overflow-hidden pt-4 bg-slate-50">
              {children}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
