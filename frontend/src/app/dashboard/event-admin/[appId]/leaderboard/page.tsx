"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import { Trophy, Plus, Minus, Loader2, Trash2 } from 'lucide-react';

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
      .update({ score: currentScore + amount })
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

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Leaderboard Scores</h1>
          <p className="text-neutral-400 mt-1">Update scores and the app will re-render podiums instantly via sync.</p>
        </div>
        <button 
          onClick={addTeam}
          className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Team
        </button>
      </header>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400">
            <tr>
              <th className="px-6 py-4 font-medium w-20">Rank</th>
              <th className="px-6 py-4 font-medium">Team Details</th>
              <th className="px-6 py-4 font-medium">Score</th>
              <th className="px-6 py-4 font-medium text-right">Quick Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {loading ? (
               <tr><td colSpan={4} className="px-6 py-12 text-center text-neutral-500">Loading rankings...</td></tr>
            ) : teams.length === 0 ? (
               <tr><td colSpan={4} className="px-6 py-12 text-center text-neutral-500">No teams registered yet.</td></tr>
            ) : teams.map((team, idx) => (
              <tr key={team.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black italic border-2 ${idx === 0 ? 'bg-amber-500/20 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-neutral-800 border-neutral-700 text-neutral-400'}`}>
                    {idx + 1}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-white text-base">{team.team_name}</div>
                  <div className="text-neutral-500 text-xs mt-0.5">{team.organization || 'General Category'} • {team.track || 'Main'}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono text-2xl text-blue-400 font-black tracking-tighter">{team.score}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => updateScore(team.id, team.score, -50)}
                      className="p-2 border border-neutral-800 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => updateScore(team.id, team.score, 50)}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1 rounded-lg font-black text-xs shadow-lg active:scale-95 transition-transform"
                    >
                      +50
                    </button>
                    <button 
                      onClick={() => updateScore(team.id, team.score, 100)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1 rounded-lg font-black text-xs shadow-lg active:scale-95 transition-transform"
                    >
                      +100
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
