"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import { Music, Play, Trash2, Loader2, ThumbsUp } from 'lucide-react';

export default function SongsAdminPage() {
  const params = useParams();
  const appId = params?.appId as string;
  
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSongs = async () => {
    if (!appId) return;
    const { data, error } = await supabase
      .from('song_requests')
      .select('*')
      .eq('event_id', appId)
      .order('votes', { ascending: false });

    if (!error && data) setSongs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSongs();
    
    const channel = supabase
      .channel('songs_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'song_requests' }, () => {
        fetchSongs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [appId]);

  const setStatus = async (id: string, currentStatus: string, newStatus: string) => {
    if (newStatus === 'playing') {
       // Reset any other playing song
       await supabase.from('song_requests').update({ status: 'played' }).eq('event_id', appId).eq('status', 'playing');
    }
    const { error } = await supabase.from('song_requests').update({ status: newStatus }).eq('id', id);
    if (error) alert("Failed to update status");
  };

  const removeSong = async (id: string) => {
    if (!confirm("Remove this request?")) return;
    await supabase.from('song_requests').delete().eq('id', id);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">DJ Song Queue</h1>
        <p className="text-neutral-400 mt-1">Manage song requests and what's currently playing.</p>
      </header>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400">
            <tr>
              <th className="px-6 py-4 font-medium">Song Title</th>
              <th className="px-6 py-4 font-medium">Requested By</th>
              <th className="px-6 py-4 font-medium">Votes</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {loading ? (
               <tr><td colSpan={5} className="px-6 py-12 text-center text-neutral-500">Loading queue...</td></tr>
            ) : songs.length === 0 ? (
               <tr><td colSpan={5} className="px-6 py-12 text-center text-neutral-500">No song requests yet.</td></tr>
            ) : songs.map((song) => (
              <tr key={song.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-white text-base">{song.title}</div>
                  <div className="text-neutral-400 text-xs mt-0.5">{song.artist || 'Unknown Artist'}</div>
                </td>
                <td className="px-6 py-4 text-neutral-300 font-medium">{song.requested_by || 'Anonymous'}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xl text-blue-400 font-black tracking-tighter">{song.votes}</span>
                    <ThumbsUp className="w-3 h-3 text-blue-500/50" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
                    ${song.status === 'playing' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      song.status === 'queued' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                      'bg-neutral-800 text-neutral-500 border-neutral-700'}
                  `}>
                    {song.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 group-hover:opacity-100 transition-opacity">
                    {song.status === 'queued' && (
                      <button 
                        onClick={() => setStatus(song.id, song.status, 'playing')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold transition-all shadow-lg active:scale-95 shadow-emerald-500/10"
                      >
                        <Play className="w-3 h-3" /> Play Now
                      </button>
                    )}
                    <button 
                      onClick={() => removeSong(song.id)}
                      className="p-2 text-neutral-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
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
    </div>
  );
}
