"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabase-client';
import { useParams } from 'next/navigation';
import { 
  Bell, 
  Trash2, 
  Pin, 
  PinOff, 
  Loader2, 
  Send, 
  AlertCircle, 
  Megaphone,
  Clock,
  CheckCircle2,
  Plus
} from 'lucide-react';

export default function AnnouncementsAdminPage() {
  const params = useParams();
  const appId = params?.appId as string;
  
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '', type: 'update' });

  const fetchAnnouncements = async () => {
    if (!appId) return;
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('event_id', appId)
      .order('created_at', { ascending: false });

    if (!error && data) setAnnouncements(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAnnouncements();
    
    const channel = supabase
      .channel('announcements_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'announcements',
        filter: `event_id=eq.${appId}`
      }, () => {
        fetchAnnouncements();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [appId]);

  const handleSend = async () => {
    if (!newAnnouncement.title || !newAnnouncement.message) return;

    setIsSending(true);
    const { error } = await supabase.from('announcements').insert([{
      title: newAnnouncement.title,
      body: newAnnouncement.message,
      event_id: appId,
      type: newAnnouncement.type.toLowerCase()
    }]);

    if (!error) {
      setShowModal(false);
      setNewAnnouncement({ title: '', message: '', type: 'update' });
    } else {
      alert("Failed to send: " + error.message);
    }
    setIsSending(false);
  };

  const removeAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this broadcast?")) return;
    await supabase.from('announcements').delete().eq('id', id);
  };

  return (
    <div className="p-10 max-w-6xl mx-auto space-y-10">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-widest">
            <Megaphone className="w-4 h-4" />
            Broadcast Engine
          </div>
          <h1 className="text-5xl font-black tracking-tight text-white">Announcements</h1>
          <p className="text-neutral-500 text-lg max-w-2xl">
            Reach every single attendee instantly with push notifications and live feed broadcasts.
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="group relative flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white font-black uppercase tracking-widest rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-emerald-500/20 overflow-hidden"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          Create Broadcast
        </button>
      </header>

      {/* Announcements Feed */}
      <div className="space-y-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-40 bg-white/[0.02] border border-white/5 rounded-[32px] animate-pulse" />
          ))
        ) : announcements.length === 0 ? (
          <div className="py-20 text-center space-y-6 bg-white/[0.01] border border-dashed border-white/10 rounded-[40px]">
            <div className="w-20 h-20 bg-white/[0.03] rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-neutral-700" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black">Radio Silence</h3>
              <p className="text-neutral-500 font-medium">You haven't sent any announcements to this event yet.</p>
            </div>
          </div>
        ) : (
          announcements.map((alert) => (
            <div 
              key={alert.id}
              className="group relative bg-white/[0.02] border border-white/10 rounded-[32px] p-8 transition-all hover:bg-white/[0.04] hover:border-white/20 hover:shadow-2xl overflow-hidden"
            >
              {/* Type Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 bg-rose-500 group-hover:opacity-20 transition-opacity" />

              <div className="relative z-10 flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black tracking-tight text-white group-hover:text-rose-400 transition-colors">
                        {alert.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                          {alert.data?.type || 'Update'}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-neutral-700" />
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                          <Clock className="w-3 h-3" />
                          {new Date(alert.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-neutral-400 text-lg leading-relaxed font-medium">
                    {alert.body}
                  </p>
                </div>

                <div className="flex md:flex-col justify-end gap-3">
                  <button 
                    onClick={() => removeAnnouncement(alert.id)}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-neutral-500 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all active:scale-95"
                    title="Delete broadcast"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Delivered</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-black/60">
          <div className="w-full max-w-xl bg-[#111] border border-white/10 rounded-[40px] p-10 shadow-3xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight text-white">Compose Broadcast</h2>
                <p className="text-neutral-500 font-medium">The message will be sent to all active devices.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Broadcast Title</label>
                <input 
                  type="text"
                  placeholder="e.g. Workshop Starting Soon!"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  className="w-full bg-white/[0.05] border border-white/5 rounded-2xl py-4 px-6 text-white font-bold focus:outline-none focus:border-rose-500/50 transition-all placeholder:text-neutral-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Full Message</label>
                <textarea 
                  placeholder="Details about the update..."
                  rows={4}
                  value={newAnnouncement.message}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                  className="w-full bg-white/[0.05] border border-white/5 rounded-2xl py-4 px-6 text-white font-medium focus:outline-none focus:border-rose-500/50 transition-all placeholder:text-neutral-700 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Announcement Type</label>
                <div className="flex gap-2">
                  {['update', 'important', 'event', 'food'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewAnnouncement({ ...newAnnouncement, type })}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                        newAnnouncement.type === type 
                          ? 'bg-rose-500 text-white border-rose-500' 
                          : 'bg-white/5 text-neutral-500 border-white/5 hover:border-white/10'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-neutral-500 hover:text-white transition-all"
                >
                  Discard
                </button>
                <button 
                  onClick={handleSend}
                  disabled={isSending || !newAnnouncement.title || !newAnnouncement.message}
                  className="flex-[2] py-4 bg-white text-black text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-2xl shadow-rose-500/10"
                >
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send Broadcast Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
