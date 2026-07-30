import React, { useState, useEffect } from 'react';
import { Trophy, Award, Sparkles, ShieldCheck, Flame, Star } from 'lucide-react';
import api from '../services/api';

export const LeaderboardPage: React.FC = () => {
  const [runners, setRunners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/leaderboard');
        if (res.data.success) {
          setRunners(res.data.topRunners || []);
        }
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 bg-slate-50">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#8c182b] text-white font-black text-xl shadow-md mb-1">
          <Trophy className="w-6 h-6 text-amber-300" />
        </div>
        <h2 className="text-xl font-black text-[#8c182b] tracking-tight">Campus Heroes Leaderboard</h2>
        <p className="text-xs text-slate-600 font-medium">
          Recognizing the top student runners of Amrita Vishwa Vidyapeetham!
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 bg-white border border-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {runners.map((runner, index) => {
            const isTop3 = index < 3;
            const trophyColor = index === 0 ? 'text-amber-500' : index === 1 ? 'text-slate-400' : 'text-amber-700';

            return (
              <div
                key={runner.id}
                className={`bg-white border rounded-2xl p-3.5 flex items-center justify-between shadow-sm transition ${
                  index === 0 ? 'border-amber-400 bg-gradient-to-r from-amber-50/40 via-white to-white' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center ${isTop3 ? 'bg-amber-100 ' + trophyColor : 'bg-slate-100 text-slate-500'}`}>
                    #{index + 1}
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                      {runner.fullName}
                      {isTop3 && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {runner.department} • {runner.hostel}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-black text-xs text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Trust {runner.trustScore}%
                  </span>
                  <span className="text-[10px] bg-rose-50 text-[#8c182b] font-bold px-2 py-0.5 rounded-full border border-rose-200">
                    Hero Runner
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
