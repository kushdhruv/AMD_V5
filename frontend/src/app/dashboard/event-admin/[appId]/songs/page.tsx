"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabase-client';
import { useParams } from 'next/navigation';
import { 
  Music, 
  Play, 
  Trash2, 
  Loader2, 
  ThumbsUp, 
  Disc3,
  ListMusic,
  Radio,
  History
} from 'lucide-react';

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
    <div className="p-10 max-w-7xl mx-auto space-y-10">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest">
            <Radio className="w-4 h-4 animate-pulse" />
            Live Broadcast Feed
          </div>
          <h1 className="text-5xl font-black tracking-tight text-white">Song Queue</h1>
          <p className="text-neutral-500 text-lg max-w-2xl font-medium">
            Manage attendee requests in real-time. Curate the perfect atmosphere with precision.
          </p>
        </div>
        <div className="flex bg-white/[0.02] border border-white/5 p-1 rounded-2xl">
           <TabButton active label="Live Requests" icon={ListMusic} />
           <TabButton label="History" icon={History} />
        </div>
      </header>

      {/* Queue Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Now Playing - Large Card */}
        <div className="lg:col-span-1">
           <div className="sticky top-10 space-y-6">
              <h2 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] font-mono">Status: On Air</h2>
              {songs.find(s => s.status === 'playing') ? (
                <div className="relative group p-8 rounded-[40px] bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl shadow-indigo-500/20 overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Disc3 className="w-32 h-32 animate-spin-slow" />
                   </div>
                   <div className="relative z-10 space-y-6">
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                         <Play className="w-6 h-6 text-white fill-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Now Playing</p>
                        <h3 className="text-3xl font-black text-white tracking-tight leading-none">
                          {songs.find(s => s.status === 'playing')?.title}
                        </h3>
                        <p className="text-white/80 font-bold mt-2">
                          {songs.find(s => s.status === 'playing')?.artist}
                        </p>
                      </div>
                      <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Streaming Live</span>
                         </div>
                         <button 
                           onClick={() => setStatus(songs.find(s => s.status === 'playing')?.id, 'playing', 'played')}
                           className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-[10px] font-black text-white uppercase tracking-widest backdrop-blur-md transition-all"
                         >
                           Archive
                         </button>
                      </div>
                   </div>
                </div>
              ) : (
                <div className="p-12 rounded-[40px] bg-white/[0.02] border border-white/5 border-dashed flex flex-col items-center justify-center text-center space-y-4">
                   <Music className="w-12 h-12 text-neutral-800" />
                   <p className="text-neutral-600 font-black uppercase tracking-widest text-[10px]">No active track</p>
                </div>
              )}
           </div>
        </div>

        {/* Requests List */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between px-4">
              <h2 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] font-mono">Incoming Stream</h2>
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-neutral-600 uppercase">Requests</span>
                    <span className="text-white font-black">{songs.filter(s => s.status === 'queued').length}</span>
                 </div>
              </div>
           </div>

           <div className="space-y-4">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-24 rounded-3xl bg-white/[0.01] border border-white/5 animate-pulse" />
                ))
              ) : songs.filter(s => s.status === 'queued').length === 0 ? (
                <div className="p-20 text-center">
                  <p className="text-neutral-700 font-black uppercase tracking-widest text-xs">The queue is currently silent</p>
                </div>
              ) : songs.filter(s => s.status === 'queued').map((song) => (
                <div key={song.id} className="group relative flex items-center gap-6 p-6 rounded-3xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] hover:border-white/10 transition-all">
                   <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-black transition-all">
                      <Music className="w-6 h-6" />
                   </div>
                   
                   <div className="flex-1">
                      <h4 className="text-lg font-black text-white tracking-tight group-hover:text-indigo-400 transition-colors">{song.title}</h4>
                      <p className="text-sm font-bold text-neutral-500">{song.artist || 'Independent'}</p>
                      <div className="flex items-center gap-4 mt-2">
                         <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest flex items-center gap-1">
                            By: {song.requested_by || 'Anonymous'}
                         </span>
                         <span className="w-1 h-1 rounded-full bg-neutral-800" />
                         <div className="flex items-center gap-1.5">
                            <ThumbsUp className="w-3 h-3 text-indigo-500/50" />
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{song.votes} Votes</span>
                         </div>
                      </div>
                   </div>

                   <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setStatus(song.id, song.status, 'playing')}
                        className="bg-white text-black px-5 py-3 rounded-2xl font-black text-xs hover:bg-indigo-400 transition-all active:scale-95 shadow-xl shadow-white/10"
                      >
                        PLAY NOW
                      </button>
                      <button 
                         onClick={() => removeSong(song.id)}
                         className="p-4 rounded-2xl bg-white/5 text-neutral-600 hover:bg-red-500/20 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ label, icon: Icon, active = false }: { label: string, icon: any, active?: boolean }) {
  return (
    <button className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${active ? 'bg-white text-black shadow-lg shadow-white/5' : 'text-neutral-500 hover:text-white'}`}>
       <Icon className="w-4 h-4" />
       {label}
    </button>
  );
}

const styles = `
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .animate-spin-slow {
    animation: spin-slow 8s linear infinite;
  }
`;
