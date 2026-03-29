"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabase-client';
import { useParams } from 'next/navigation';
import { 
  Trophy, 
  Plus, 
  Minus, 
  Loader2, 
  Trash2, 
  TrendingUp,
  Award,
  Users,
  BarChart3
} from 'lucide-react';

export default function LeaderboardAdminPage() {
  const params = useParams();
  const appId = params?.appId as string;
  
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    if (!appId) return;
    const { data, error } = await supabase
      .from('event_leaderboard')
      .select('*')
      .eq('event_id', appId)
      .order('score', { ascending: false });

    if (!error && data) setTeams(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();
    
    const channel = supabase
      .channel('leaderboard_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_leaderboard' }, () => {
        fetchLeaderboard();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [appId]);

  const updateScore = async (id: string, currentScore: number, amount: number) => {
    const { error } = await supabase
      .from('event_leaderboard')
      .update({ score: Math.max(0, currentScore + amount) })
      .eq('id', id);
    
    if (error) alert("Update failed: " + error.message);
  };

  const addTeam = async () => {
    const name = prompt("Enter Team Name:");
    if (!name) return;
    const { error } = await supabase.from('event_leaderboard').insert([{
      event_id: appId,
      team_name: name,
      score: 0,
      track: 'General'
    }]);
    if (error) alert("Failed to add team");
  };

  const deleteTeam = async (id: string) => {
    if (!confirm("Remove this team from leaderboard?")) return;
    await supabase.from('event_leaderboard').delete().eq('id', id);
  };

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-widest">
            <Trophy className="w-4 h-4" />
            Live Rankings Engine
          </div>
          <h1 className="text-5xl font-black tracking-tight text-white">Leaderboard</h1>
          <p className="text-neutral-500 text-lg max-w-2xl font-medium">
            Manage real-time competitive standings. Scores sync instantly to all mobile devices.
          </p>
        </div>
        <button 
          onClick={addTeam}
          className="bg-amber-500 hover:bg-amber-400 text-black px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-amber-500/20 flex items-center gap-3 active:scale-95 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          ENLIST TEAM
        </button>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatItem icon={Users} label="Active Teams" value={teams.length.toString()} color="amber" />
        <StatItem icon={TrendingUp} label="Total Points" value={teams.reduce((acc, t) => acc + t.score, 0).toLocaleString()} color="blue" />
        <StatItem icon={Award} label="Top Score" value={(teams[0]?.score || 0).toLocaleString()} color="emerald" />
      </div>

      {/* Rankings Table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[40px] overflow-hidden backdrop-blur-3xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/5 bg-white/[0.01]">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Pos</th>
                <th className="px-8 py-6 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Combatant</th>
                <th className="px-8 py-6 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Score</th>
                <th className="px-8 py-6 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] text-right">Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-8 py-10">
                      <div className="h-8 bg-white/5 rounded-full w-full opacity-20" />
                    </td>
                  </tr>
                ))
              ) : teams.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <p className="text-neutral-600 font-bold uppercase tracking-widest text-xs">No active standings recorded</p>
                  </td>
                </tr>
              ) : teams.map((team, idx) => {
                const isTop3 = idx < 3;
                const colors = [
                  "from-amber-400 to-yellow-600 shadow-amber-500/40",
                  "from-slate-300 to-slate-500 shadow-slate-400/40",
                  "from-orange-400 to-orange-700 shadow-orange-500/40"
                ];

                return (
                  <tr key={team.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-8">
                      {isTop3 ? (
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors[idx]} flex items-center justify-center font-black text-black text-xl shadow-lg`}>
                          {idx + 1}
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-neutral-500 text-lg group-hover:text-white transition-colors">
                          {idx + 1}
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-white text-xl tracking-tight group-hover:text-amber-400 transition-colors">
                          {team.team_name}
                        </span>
                        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mt-1">
                          {team.organization || 'Independent'} // {team.track || 'Unassigned'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                         <div className="h-2 w-24 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
                              style={{ width: `${Math.min(100, (team.score / (teams[0]?.score || 1)) * 100)}%` }} 
                            />
                         </div>
                         <span className="font-mono text-3xl font-black text-white tracking-tighter">
                           {team.score.toLocaleString()}
                         </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end items-center gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => updateScore(team.id, team.score, -50)}
                          className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center hover:bg-red-500 hover:border-red-500 hover:text-white transition-all text-neutral-400 active:scale-95"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => updateScore(team.id, team.score, 50)}
                          className="px-5 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-black text-xs hover:bg-blue-500 hover:text-white transition-all active:scale-95"
                        >
                          +50
                        </button>
                        <button 
                          onClick={() => updateScore(team.id, team.score, 100)}
                          className="px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-xs hover:bg-emerald-500 hover:text-white transition-all active:scale-95"
                        >
                          +100
                        </button>
                        <button 
                          onClick={() => deleteTeam(team.id)}
                          className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center text-neutral-600 hover:bg-red-500/20 hover:text-red-500 transition-all ml-4"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Footer Info */}
      <footer className="pt-6 border-t border-white/5 flex items-center gap-4 text-neutral-600">
         <div className="animate-pulse w-2 h-2 bg-emerald-500 rounded-full" />
         <p className="text-[10px] font-black uppercase tracking-[0.25em]">Real-time synchronization active for all channels</p>
      </footer>
    </div>
  );
}

function StatItem({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
  const colors = {
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-amber-500/5",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-blue-500/5",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5"
  } as any;

  return (
    <div className={`p-8 rounded-[32px] border transition-all hover:scale-[1.02] backdrop-blur-xl ${colors[color]}`}>
       <div className="flex items-center gap-6">
          <div className="p-4 rounded-2xl bg-black/20">
             <Icon className="w-8 h-8" />
          </div>
          <div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">{label}</p>
             <h3 className="text-4xl font-black mt-1 tabular-nums">{value}</h3>
          </div>
       </div>
    </div>
  );
}
