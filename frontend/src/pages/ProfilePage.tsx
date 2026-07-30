import React, { useState } from 'react';
import { User, ShieldCheck, Award, LogOut, Save, Sparkles, Building, Home, Phone, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const ProfilePage: React.FC = () => {
  const { user, logout, updateUserLocal } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [year, setYear] = useState(user?.year || '');
  const [hostel, setHostel] = useState(user?.hostel || '');
  const [roomNumber, setRoomNumber] = useState(user?.roomNumber || '');
  const [role, setRole] = useState(user?.role || 'CUSTOMER');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await api.put('/auth/profile', {
        fullName,
        phone,
        department,
        year,
        hostel,
        roomNumber,
        role,
      });

      if (res.data.success) {
        updateUserLocal(res.data.user);
        setMessage('Profile updated successfully!');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 bg-slate-50">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[#8c182b] tracking-tight">Student Profile</h2>
          <p className="text-xs text-slate-600 font-medium">Amrita Vishwa Vidyapeetham Student Account</p>
        </div>
        <button
          onClick={logout}
          className="text-xs text-rose-700 font-bold hover:underline flex items-center gap-1"
        >
          <LogOut className="w-3.5 h-3.5" /> Logout
        </button>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold">
          {message}
        </div>
      )}

      {/* Trust Score Breakdown Banner */}
      <div className="bg-[#8c182b] text-white rounded-3xl p-4 shadow-lg flex items-center justify-between">
        <div>
          <span className="text-[10px] text-rose-100 font-bold uppercase tracking-wider">
            Verified Student Trust Score
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
            {user?.trustScore || 85.0} / 100
            <ShieldCheck className="w-6 h-6 text-emerald-300" />
          </h1>
          <p className="text-[11px] text-rose-100 mt-1">
            Factors: On-time delivery rates, rating scores, low cancellation rate.
          </p>
        </div>

        <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center font-black text-[#8c182b] text-xs bg-white shadow">
          {user?.trustScore && user.trustScore >= 90 ? 'Hero ⭐' : 'Trusted'}
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="bg-white border border-slate-200 rounded-3xl p-4 space-y-3 shadow-sm">
        <h3 className="text-xs font-black text-[#8c182b] uppercase tracking-wider">
          Editable Student Information
        </h3>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">College Verified Email (Locked)</label>
          <input
            type="text"
            disabled
            value={user?.email || ''}
            className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-500 cursor-not-allowed font-semibold"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8c182b]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8c182b]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Department</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8c182b]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Year of Study</label>
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8c182b]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Hostel Complex</label>
            <input
              type="text"
              value={hostel}
              onChange={(e) => setHostel(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8c182b]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Room Number</label>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8c182b]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Primary Operational Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8c182b]"
          >
            <option value="CUSTOMER">Customer (Places item requests)</option>
            <option value="RUNNER">Runner (Accepts & delivers items)</option>
            <option value="ADMIN">Admin (Platform management)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[#8c182b] hover:bg-[#731222] text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
        >
          {saving ? 'Saving Profile...' : 'Save Profile Changes 💾'}
        </button>
      </form>
    </div>
  );
};
