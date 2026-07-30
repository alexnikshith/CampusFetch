import React, { useState } from 'react';
import { Mail, Key, User, Phone, Building, Home, BookOpen, Send, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthPage: React.FC = () => {
  const { requestOtp, verifyAndRegister, loginWithOtp } = useAuth();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('REGISTER');
  const [step, setStep] = useState<'FORM' | 'OTP'>('FORM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState('nikshith@cb.amrita.edu');
  const [otp, setOtp] = useState('');
  const [username, setUsername] = useState('nikshith_g');
  const [fullName, setFullName] = useState('Nikshith Gurram');
  const [phone, setPhone] = useState('9988776655');
  const [gender, setGender] = useState('Male');
  const [department, setDepartment] = useState('Computer Science & Eng');
  const [year, setYear] = useState('3rd Year');
  const [hostel, setHostel] = useState('Vashishta Hostel');
  const [roomNumber, setRoomNumber] = useState('304');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await requestOtp(email || 'student@cb.amrita.edu');
      if (res && res.success !== false) {
        const code = res.devOtp || '123456';
        setDevOtpCode(code);
        setOtp(code);
        setStep('OTP');
      } else {
        const fallbackCode = '123456';
        setDevOtpCode(fallbackCode);
        setOtp(fallbackCode);
        setStep('OTP');
      }
    } catch (err: any) {
      const fallbackCode = '123456';
      setDevOtpCode(fallbackCode);
      setOtp(fallbackCode);
      setStep('OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'REGISTER') {
        const res = await verifyAndRegister({
          username,
          fullName,
          email,
          phone,
          gender,
          department,
          year,
          hostel,
          roomNumber,
          otp,
        });
        if (!res.success) setError(res.error || 'Verification failed');
      } else {
        const res = await loginWithOtp(email, otp);
        if (!res.success) setError(res.error || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto bg-slate-100">
      <div className="w-full max-w-md bg-white border border-slate-300 rounded-3xl p-6 shadow-2xl relative">
        {/* Top Amrita Brand Hero */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#8c182b] text-white font-black text-2xl shadow-lg mb-3">
            CF
          </div>
          <h1 className="text-2xl font-black text-[#8c182b] tracking-tight">CampusFetch</h1>
          <p className="text-xs text-slate-600 font-bold mt-1">
            Students helping students, one trip at a time.
          </p>
          <div className="mt-2 inline-block bg-rose-50 border border-rose-200 px-3 py-0.5 rounded-full text-[11px] font-black text-[#8c182b]">
            Amrita Vishwa Vidyapeetham
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Registration / Email Form */}
        {step === 'FORM' ? (
          <form onSubmit={handleSendOtp} className="space-y-3">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-300 mb-4">
              <button
                type="button"
                onClick={() => setMode('REGISTER')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === 'REGISTER' ? 'bg-[#8c182b] text-white shadow' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                New Registration
              </button>
              <button
                type="button"
                onClick={() => setMode('LOGIN')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === 'LOGIN' ? 'bg-[#8c182b] text-white shadow' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Student Login
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Amrita College Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@cb.amrita.edu"
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8c182b]"
                />
              </div>
            </div>

            {mode === 'REGISTER' && (
              <>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Username</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="username"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8c182b]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8c182b]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Mobile Number</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8c182b]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8c182b]"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Department</label>
                    <input
                      type="text"
                      required
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="CSE / ECE / AI"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8c182b]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Academic Year</label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8c182b]"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="PG / PhD">PG / PhD</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Hostel Block</label>
                    <input
                      type="text"
                      required
                      value={hostel}
                      onChange={(e) => setHostel(e.target.value)}
                      placeholder="Vashishta / Gargi"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8c182b]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Room Number</label>
                    <input
                      type="text"
                      required
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      placeholder="304"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8c182b]"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-[#8c182b] hover:bg-[#731222] text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              {loading ? 'Sending OTP Code...' : 'Generate 6-Digit Email OTP ✉️'}
            </button>
          </form>
        ) : (
          /* Step 2: Verification Code Input */
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-center">
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl">
              <p className="text-xs text-slate-700">
                Verification OTP dispatched to: <br />
                <span className="font-bold text-[#8c182b]">{email}</span>
              </p>
              {devOtpCode && (
                <div className="mt-2 bg-amber-100 border border-amber-300 p-1.5 rounded-lg text-[11px] text-amber-900 flex items-center justify-center gap-2 font-bold">
                  <span>Dev Mock OTP: {devOtpCode}</span>
                  <button
                    type="button"
                    onClick={() => setOtp(devOtpCode)}
                    className="underline text-[#8c182b] font-black"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Enter 6-Digit Verification Code</label>
              <input
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full text-center tracking-[10px] text-2xl font-black bg-white border border-[#8c182b] rounded-2xl py-3 text-[#8c182b] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#8c182b] hover:bg-[#731222] text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              {loading ? 'Verifying...' : 'Verify OTP & Enter CampusFetch 🚀'}
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => setStep('FORM')}
                className="text-slate-600 hover:text-slate-900 font-bold"
              >
                ← Back to Edit Details
              </button>
              <button
                type="button"
                onClick={handleSendOtp}
                className="text-[#8c182b] font-extrabold hover:underline"
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
