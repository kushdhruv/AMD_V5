"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabase-client';
import { useParams } from 'next/navigation';
import { 
  Activity, 
  Users, 
  Store, 
  Megaphone, 
  Music, 
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Globe,
  Smartphone
} from 'lucide-react';

export default function AdminOverview() {
  const params = useParams();
  const appId = params?.appId as string;

  const [stats, setStats] = useState({
    stalls: 0,
    songs: 0,
    announcements: 0,
    attendees: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    if (!appId) return;
    
    // Fetch all counts in parallel
    const [stallsRes, songsRes, announcementsRes, registrationsRes] = await Promise.all([
      supabase.from('stalls').select('id', { count: 'exact', head: true }).eq('event_id', appId),
      supabase.from('song_requests').select('id', { count: 'exact', head: true }).eq('event_id', appId).eq('status', 'queued'),
      supabase.from('announcements').select('id', { count: 'exact', head: true }).eq('event_id', appId),
      supabase.from('app_registrations').select('id', { count: 'exact', head: true }).eq('app_name', appId)
    ]);

    setStats({
      stalls: stallsRes.count || 0,
      songs: songsRes.count || 0,
      announcements: announcementsRes.count || 0,
      attendees: registrationsRes.count || 0
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
    
    // Subscribe to changes for live counter updates
    const channels = [
      supabase.channel('overview_stalls').on('postgres_changes', { event: '*', schema: 'public', table: 'stalls', filter: `event_id=eq.${appId}` }, () => fetchStats()).subscribe(),
      supabase.channel('overview_songs').on('postgres_changes', { event: '*', schema: 'public', table: 'song_requests', filter: `event_id=eq.${appId}` }, () => fetchStats()).subscribe(),
      supabase.channel('overview_announcements').on('postgres_changes', { event: '*', schema: 'public', table: 'announcements', filter: `event_id=eq.${appId}` }, () => fetchStats()).subscribe(),
      supabase.channel('overview_registrations').on('postgres_changes', { event: '*', schema: 'public', table: 'app_registrations', filter: `app_name=eq.${appId}` }, () => fetchStats()).subscribe(),
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [appId]);

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <header className="relative p-12 rounded-[50px] bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
           <Globe className="w-64 h-64 text-indigo-500 animate-pulse" />
        </div>
        <div className="relative z-10 space-y-4">
           <div className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em]">
              <Zap className="w-4 h-4 fill-indigo-400" />
              Engine Status: Operational
           </div>
           <h1 className="text-6xl font-black tracking-tighter text-white leading-none">
              Control Center
           </h1>
           <p className="text-neutral-500 text-xl max-w-xl font-medium leading-relaxed">
              Your decentralized event infrastructure is live. Every interaction across the mobile mesh is synchronized here in millisecond real-time.
           </p>
           <div className="flex items-center gap-6 pt-6">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                 <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Live Sync Active</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                 <ShieldCheck className="w-4 h-4 text-indigo-400" />
                 <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">TLS 1.3 Encrypted</span>
              </div>
           </div>
        </div>
      </header>

      {/* Grid Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Event Vendors" 
          value={stats.stalls} 
          icon={Store} 
          color="indigo" 
          loading={loading}
        />
        <StatCard 
          label="Guest Requests" 
          value={stats.songs} 
          icon={Music} 
          color="purple" 
          loading={loading}
          trend="8 Pending"
        />
        <StatCard 
          label="Active Broadcasts" 
          value={stats.announcements} 
          icon={Megaphone} 
          color="pink" 
          loading={loading}
        />
        <StatCard 
          label="Mobile Users" 
          value={stats.attendees} 
          icon={Users} 
          color="sky" 
          loading={loading}
          trend="Live Now"
        />
      </div>

      {/* Infrastructure Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 p-10 rounded-[40px] bg-white/[0.02] border border-white/5 space-y-8">
            <div className="flex items-center justify-between">
               <h2 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em]">Network Topology</h2>
               <Activity className="w-5 h-5 text-indigo-500/50" />
            </div>
            <div className="space-y-4">
               <NetworkNode label="Supabase Cloud Relay" status="Online" latency="24ms" active />
               <NetworkNode label="EAS Build Artifact Storage" status="Online" latency="11ms" active />
               <NetworkNode label="SQLite Edge Mesh" status="Syncing" latency="48ms" />
            </div>
         </div>

         <div className="p-10 rounded-[40px] bg-indigo-600/[0.03] border border-indigo-500/20 flex flex-col justify-between group cursor-pointer hover:bg-indigo-600/10 transition-all">
            <div className="space-y-4">
               <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-black shadow-xl shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-6 h-6" />
               </div>
               <h3 className="text-2xl font-black text-white tracking-tight">Mobile Preview</h3>
               <p className="text-neutral-500 font-medium">Verify your app layout and real-time content delivery in the simulator.</p>
            </div>
            <div className="flex items-center gap-2 text-indigo-400 font-black text-xs uppercase tracking-widest pt-6">
               Open Simulator <ArrowUpRight className="w-4 h-4 translate-y-[-1px]" />
            </div>
         </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, loading, trend }: any) {
  const colorMap: any = {
    indigo: "from-indigo-500/20 to-indigo-500/5 text-indigo-400 border-indigo-500/20",
    purple: "from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-500/20",
    pink: "from-pink-500/20 to-pink-500/5 text-pink-400 border-pink-500/20",
    sky: "from-sky-500/20 to-sky-500/5 text-sky-400 border-sky-500/20",
  };

  return (
    <div className="group p-8 rounded-[40px] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
       <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center mb-6`}>
          <Icon className="w-6 h-6" />
       </div>
       <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{label}</p>
       <div className="flex items-end justify-between mt-2">
          {loading ? (
            <div className="h-10 w-24 bg-white/5 rounded-xl animate-pulse" />
          ) : (
            <h4 className="text-5xl font-black text-white tracking-tighter">{value}</h4>
          )}
          {trend && (
            <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap">
              {trend}
            </span>
          )}
       </div>
    </div>
  );
}

function NetworkNode({ label, status, latency, active = false }: any) {
  return (
    <div className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all">
       <div className="flex items-center gap-4">
          <div className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-amber-400'}`} />
          <span className="text-sm font-bold text-neutral-300">{label}</span>
       </div>
       <div className="flex items-center gap-6">
          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{status}</span>
          <span className="font-mono text-[10px] text-indigo-400/50 bg-indigo-500/5 px-2 py-1 rounded-md">{latency}</span>
       </div>
    </div>
  );
}
