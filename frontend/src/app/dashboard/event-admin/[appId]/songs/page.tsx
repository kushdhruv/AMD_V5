'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabase-client';
import { Plus, Trash2, Edit2, Play, CheckCircle2, Music2 } from 'lucide-react';

export default function SongsPage({ params }: { params: { appId: string } }) {
  const { appId } = params;
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [requestedBy, setRequestedBy] = useState('');
  const [status, setStatus] = useState('queued');

  useEffect(() => {
    fetchSongs();
  }, [appId]);

  const fetchSongs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('song_requests')
      .select('*')
      .eq('event_id', appId)
      .order('votes', { ascending: false });
    
    if (data) setSongs(data);
    setLoading(false);
  };

  const resetForm = () => {
    setTitle('');
    setArtist('');
    setRequestedBy('');
    setStatus('queued');
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await supabase
        .from('song_requests')
        .update({ title, artist, requested_by: requestedBy, status })
        .eq('id', editingId);
    } else {
      await supabase
        .from('song_requests')
        .insert([{
          event_id: appId,
          title,
          artist,
          requested_by: requestedBy,
          status,
          votes: 1
        }]);
    }
    resetForm();
    fetchSongs();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this song request?')) return;
    await supabase.from('song_requests').delete().eq('id', id);
    fetchSongs();
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await supabase.from('song_requests').update({ status: newStatus }).eq('id', id);
    fetchSongs();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Song Queue Management
          </h1>
          <p className="text-gray-400 mt-2">Manage DJ requests, update playing status, and view what's trending.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg transition-all shadow-lg shadow-purple-500/20 font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Song Request
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['queued', 'playing', 'played'].map((stat) => (
          <div key={stat} className="p-6 bg-[#111] border border-white/5 rounded-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">{stat}</h3>
            <p className="text-3xl font-bold text-white mt-2">
              {songs.filter(s => s.status === stat).length}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              <th className="p-4 text-sm font-medium text-gray-400">Song & Artist</th>
              <th className="p-4 text-sm font-medium text-gray-400">Requested By</th>
              <th className="p-4 text-sm font-medium text-gray-400">Votes</th>
              <th className="p-4 text-sm font-medium text-gray-400">Status</th>
              <th className="p-4 text-sm font-medium text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading songs...</td></tr>
            ) : songs.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No song requests yet.</td></tr>
            ) : (
              songs.map((song) => (
                <tr key={song.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                  <td className="p-4">
                    <div className="font-semibold text-white flex items-center gap-2">
                      <Music2 className="w-4 h-4 text-purple-400" />
                      {song.title}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{song.artist || 'Unknown Artist'}</div>
                  </td>
                  <td className="p-4 text-gray-300">{song.requested_by || 'Anonymous'}</td>
                  <td className="p-4 text-pink-400 font-medium">{song.votes}</td>
                  <td className="p-4">
                    <div className="flex bg-[#222] rounded-lg overflow-hidden border border-white/10 w-fit">
                      {['queued', 'playing', 'played'].map(s => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(song.id, s)}
                          className={`px-3 py-1 text-xs capitalize transition-colors ${
                            song.status === s 
                              ? s === 'queued' ? 'bg-indigo-500/20 text-indigo-400' 
                                : s === 'playing' ? 'bg-pink-500/20 text-pink-400'
                                : 'bg-emerald-500/20 text-emerald-400'
                              : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingId(song.id);
                          setTitle(song.title);
                          setArtist(song.artist || '');
                          setRequestedBy(song.requested_by || '');
                          setStatus(song.status);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(song.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="border-b border-white/10 p-6">
              <h2 className="text-xl font-bold text-white">
                {editingId ? 'Edit Song Request' : 'Add Song Request'}
              </h2>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Song Title</label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-[#222] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  placeholder="e.g. Shape of You"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Artist</label>
                <input
                  type="text"
                  value={artist}
                  onChange={e => setArtist(e.target.value)}
                  className="w-full bg-[#222] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  placeholder="e.g. Ed Sheeran"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Requested By</label>
                <input
                  type="text"
                  value={requestedBy}
                  onChange={e => setRequestedBy(e.target.value)}
                  className="w-full bg-[#222] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  placeholder="Optional Name"
                />
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
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl transition-all font-medium"
                >
                  {editingId ? 'Save Changes' : 'Add Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
