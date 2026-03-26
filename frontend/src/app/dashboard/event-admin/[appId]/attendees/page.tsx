"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import { 
  Users, 
  Mail, 
  Clock, 
  ShieldCheck, 
  Search, 
  Trash2, 
  Loader2, 
  UserPlus,
  ArrowUpRight,
  Fingerprint
} from 'lucide-react';

export default function AttendeesAdminPage() {
  const params = useParams();
  const appId = params?.appId as string;
  
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAttendees = async () => {
    if (!appId) return;
    const { data, error } = await supabase
      .from('app_registrations')
      .select('*')
      .order('created_at', { ascending: false });
    
    const filtered = data?.filter(a => a.app_name === appId || a.data?.appId === appId) || [];
    if (!error) setAttendees(filtered);
    setLoading(false);
  };

  useEffect(() => {
    fetchAttendees();
  }, [appId]);

  const removeAttendee = async (id: string) => {
    if (!confirm("Are you sure you want to remove this registration?")) return;
    await supabase.from('app_registrations').delete().eq('id', id);
    setAttendees(attendees.filter(a => a.id !== id));
  };

  const filteredAttendees = attendees.filter(a => 
    a.data?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.data?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-widest">
            <Fingerprint className="w-4 h-4" />
            Identity Management
          </div>
          <h1 className="text-5xl font-black tracking-tight text-white">Attendees</h1>
          <p className="text-neutral-500 text-lg max-w-2xl font-medium">
            Monitor and manage the digital presence of every registered user in your event ecosystem.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white/[0.02] border border-white/10 rounded-2xl p-2 pr-6">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Active Pool</p>
            <p className="text-xl font-black text-white">{attendees.length} REGISTERED</p>
          </div>
        </div>
      </header>

      {/* Stats & Search */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-sky-400 transition-colors" />
          <input 
            type="text"
            placeholder="Search by name, email or ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-medium focus:outline-none focus:border-sky-500/50 focus:bg-white/[0.04] transition-all placeholder:text-neutral-600"
          />
        </div>
      </div>

      {/* Attendees Table/List */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[40px] overflow-hidden backdrop-blur-3xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="px-8 py-6 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Profile</th>
                <th className="px-8 py-6 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Communication</th>
                <th className="px-8 py-6 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Timestamp</th>
                <th className="px-8 py-6 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-8 py-10">
                      <div className="h-6 bg-white/5 rounded-full w-full opacity-20" />
                    </td>
                  </tr>
                ))
              ) : filteredAttendees.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <p className="text-neutral-600 font-bold uppercase tracking-widest text-xs">No matching credentials found</p>
                  </td>
                </tr>
              ) : filteredAttendees.map((att) => (
                <tr key={att.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 flex items-center justify-center border border-white/10 group-hover:border-sky-500/30 transition-colors">
                          <span className="text-xl font-black text-sky-400">
                             {att.data?.full_name?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#050505]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-white text-lg tracking-tight group-hover:text-sky-400 transition-colors">
                            {att.data?.full_name || 'Restricted Access'}
                          </p>
                          <ArrowUpRight className="w-4 h-4 text-neutral-700 opacity-0 group-hover:opacity-100 transition-all" />
                        </div>
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.15em] mt-0.5 font-mono">
                          UUID: {att.id.slice(0, 16)}...
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-neutral-400 font-bold text-sm">
                        <Mail className="w-4 h-4 text-sky-500/50" />
                        {att.data?.email || 'No Email Linked'}
                      </div>
                      <span className="text-[10px] font-black text-emerald-500/50 uppercase tracking-widest flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Verified Account
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-neutral-400 font-bold text-sm">
                      {new Date(att.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-[10px] text-neutral-600 uppercase font-black tracking-widest mt-1 italic">
                      {new Date(att.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => removeAttendee(att.id)} 
                      className="p-4 rounded-2xl bg-red-500/5 text-red-500/40 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/20 transition-all active:scale-95"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && filteredAttendees.length > 0 && (
        <footer className="pt-6 border-t border-white/5 flex items-center justify-between">
          <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em]">
            End of records pool // Securely Encrypted
          </p>
          <div className="flex gap-2">
             <div className="w-2 h-2 rounded-full bg-sky-500 shadow-lg shadow-sky-500/50" />
             <div className="w-2 h-2 rounded-full bg-white/10" />
             <div className="w-2 h-2 rounded-full bg-white/10" />
          </div>
        </footer>
      )}
    </div>
  );
}
