'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabase-client';
import { Plus, Trash2, Edit2, Trophy, Users } from 'lucide-react';

export default function LeaderboardPage({ params }: { params: { appId: string } }) {
  const { appId } = params;
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [track, setTrack] = useState('');      // Category/Event like "Dance", "Singing"
  const [teamName, setTeamName] = useState(''); // Member/Team Name
  const [organization, setOrganization] = useState('');
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetchLeaderboard();
  }, [appId]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('event_leaderboard')
      .select('*')
      .eq('event_id', appId)
      .order('score', { ascending: false });
    
    if (data) setEntries(data);
    setLoading(false);
  };

  const resetForm = () => {
    setTrack('');
    setTeamName('');
    setOrganization('');
    setScore(0);
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await supabase
        .from('event_leaderboard')
        .update({ track, team_name: teamName, organization, score })
        .eq('id', editingId);
    } else {
      await supabase
        .from('event_leaderboard')
        .insert([{
          event_id: appId,
          track,
          team_name: teamName,
          organization,
          score
        }]);
    }
    resetForm();
    fetchLeaderboard();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this leaderboard entry?')) return;
    await supabase.from('event_leaderboard').delete().eq('id', id);
    fetchLeaderboard();
  };

  // Group entries by track (event name like "Dance", "Singing")
  const groupedEntries = entries.reduce((acc, entry) => {
    const key = entry.track || 'Uncategorized';
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-600">
            Leaderboard Management
          </h1>
          <p className="text-gray-400 mt-2">Manage event categories, team members, and update their live scores.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-lg transition-all shadow-lg shadow-amber-500/20 font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Entry
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-[#111] border border-white/5 rounded-xl">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Entries</h3>
          <p className="text-3xl font-bold text-white mt-2">{entries.length}</p>
        </div>
        <div className="p-6 bg-[#111] border border-white/5 rounded-xl">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Categories (Tracks)</h3>
          <p className="text-3xl font-bold text-white mt-2">{Object.keys(groupedEntries).length}</p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500 bg-[#111] rounded-2xl border border-white/5">
          Loading leaderboard...
        </div>
      ) : entries.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-[#111] rounded-2xl border border-white/5">
          No leaderboard entries found for this event.
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedEntries).map(([trackName, trackEntries]) => (
            <div key={trackName} className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
              <div className="border-b border-white/10 p-4 bg-white/[0.02] flex items-center gap-3">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl font-bold text-white">{trackName}</h2>
                <span className="text-sm text-gray-500 font-medium ml-2">{(trackEntries as any[]).length} participants</span>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-sm">
                    <th className="p-4 font-medium">Rank</th>
                    <th className="p-4 font-medium">Member/Team Name</th>
                    <th className="p-4 font-medium">Organization</th>
                    <th className="p-4 font-medium text-right">Score</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(trackEntries as any[])
                    // Sort descending by score for ranking
                    .sort((a, b) => b.score - a.score)
                    .map((entry, idx) => (
                    <tr key={entry.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                      <td className="p-4 font-bold text-gray-400">#{idx + 1}</td>
                      <td className="p-4">
                        <div className="font-semibold text-white flex items-center gap-2">
                          <Users className="w-4 h-4 text-amber-500/50" />
                          {entry.team_name}
                        </div>
                      </td>
                      <td className="p-4 text-gray-400">{entry.organization || '-'}</td>
                      <td className="p-4 text-right">
                        <span className="text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-lg">
                          {entry.score}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingId(entry.id);
                              setTrack(entry.track || '');
                              setTeamName(entry.team_name);
                              setOrganization(entry.organization || '');
                              setScore(entry.score || 0);
                              setIsModalOpen(true);
                            }}
                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="border-b border-white/10 p-6 flex flex-col gap-1">
              <h2 className="text-xl font-bold text-white">
                {editingId ? 'Edit Leaderboard Entry' : 'Add Leaderboard Entry'}
              </h2>
              <p className="text-sm text-gray-400">Assign participants to events and set their scores.</p>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Event Category (Track)
                </label>
                <input
                  required
                  type="text"
                  value={track}
                  onChange={e => setTrack(e.target.value)}
                  className="w-full bg-[#222] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  placeholder="e.g. Dance, Singing, Hackathon"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Participant / Team Name
                </label>
                <input
                  required
                  type="text"
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  className="w-full bg-[#222] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                  placeholder="e.g. John Doe, The Rockets"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Score</label>
                  <input
                    required
                    type="number"
                    value={score}
                    onChange={e => setScore(Number(e.target.value))}
                    className="w-full bg-[#222] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Organization (Optional)</label>
                  <input
                    type="text"
                    value={organization}
                    onChange={e => setOrganization(e.target.value)}
                    className="w-full bg-[#222] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Stanford"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl transition-all font-medium"
                >
                  {editingId ? 'Save Changes' : 'Add Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
