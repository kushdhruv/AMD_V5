"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import { Bell, Trash2, Pin, PinOff, Loader2 } from 'lucide-react';

export default function AnnouncementsAdminPage() {
  const params = useParams();
  const appId = params?.appId as string;
  
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const fetchAnnouncements = async () => {
    if (!appId) return;
    const { data, error } = await supabase
      .from('builder_announcements')
      .select('*')
      .eq('data->appId', appId) // Assuming appId is stored in JSONB or app_name
      .order('created_at', { ascending: false });

    if (!error && data) setAnnouncements(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAnnouncements();
    
    // Realtime subscription
    const channel = supabase
      .channel('announcements_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'builder_announcements' }, () => {
        fetchAnnouncements();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [appId]);

  const sendAnnouncement = async () => {
    const title = prompt("Enter Announcement Title:");
    const message = prompt("Enter Announcement Message:");
    if (!title || !message) return;

    setIsSending(true);
    const { error } = await supabase.from('builder_announcements').insert([{
      title,
      message,
      app_name: appId, // Using app_name as appId placeholder
      data: { appId, type: 'Alert', pinned: false }
    }]);

    if (error) alert("Failed to send: " + error.message);
    setIsSending(false);
  };

  const removeAnnouncement = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await supabase.from('builder_announcements').delete().eq('id', id);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Announcements & Push</h1>
          <p className="text-neutral-400 mt-1">Send real-time updates to all app users instantly.</p>
        </div>
        <button 
          onClick={sendAnnouncement}
          disabled={isSending}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50"
        >
          {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
          New Announcement
        </button>
      </header>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400">
            <tr>
              <th className="px-6 py-4 font-medium">Message</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {loading ? (
               <tr><td colSpan={3} className="px-6 py-12 text-center text-neutral-500">Loading announcements...</td></tr>
            ) : announcements.length === 0 ? (
               <tr><td colSpan={3} className="px-6 py-12 text-center text-neutral-500">No announcements sent yet.</td></tr>
            ) : announcements.map((alert) => (
              <tr key={alert.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-white text-base">{alert.title}</div>
                  <div className="text-neutral-400 text-xs mt-1 leading-relaxed max-w-md">{alert.message}</div>
                  <div className="text-[10px] text-neutral-600 mt-2 font-mono uppercase tracking-widest">{new Date(alert.created_at).toLocaleString()}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {alert.data?.type || 'Update'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => removeAnnouncement(alert.id)} 
                    className="p-2 text-neutral-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
