"use client";

import React from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  Store, 
  Music2, 
  BellRing, 
  Trophy, 
  ChevronLeft,
  Activity,
  AppWindow,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/supabase-client';
import { AppConfig } from '@/lib/app-builder-v2/schema/configSchema';
import { useState, useEffect } from 'react';

export default function AdminDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { appId: string };
}) {
  const { appId } = params;
  const pathname = usePathname();
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('blueprint_json')
        .eq('id', appId)
        .single();

      if (data && data.blueprint_json) {
        setConfig(data.blueprint_json as unknown as AppConfig);
      }
    };
    fetchProject();
  }, [appId]);

  const navItems = [
    { name: 'Overview', icon: LayoutDashboard, path: `/dashboard/event-admin/${appId}`, color: 'text-blue-400', visible: true },
    { name: 'Attendees', icon: Users, path: `/dashboard/event-admin/${appId}/attendees`, color: 'text-sky-400', visible: (typeof config?.modules.registration === 'boolean' ? config?.modules.registration : config?.modules.registration?.enabled) ?? true },
    { name: 'Tickets', icon: Store, path: `/dashboard/event-admin/${appId}/tickets`, color: 'text-green-400', visible: (typeof config?.modules.registration === 'boolean' ? config?.modules.registration : config?.modules.registration?.enabled) ?? true },
    { name: 'Stalls & Menu', icon: Store, path: `/dashboard/event-admin/${appId}/stalls`, color: 'text-emerald-400', visible: config?.modules.commerce?.enabled ?? true },
    { name: 'Song Queue', icon: Music2, path: `/dashboard/event-admin/${appId}/songs`, color: 'text-purple-400', visible: config?.modules.songs ?? true },
    { name: 'Announcements', icon: BellRing, path: `/dashboard/event-admin/${appId}/announcements`, color: 'text-rose-400', visible: config?.modules.announcements ?? true },
    { name: 'Speakers', icon: Users, path: `/dashboard/event-admin/${appId}/speakers`, color: 'text-indigo-400', visible: config?.modules.speakers?.enabled ?? true },
    { name: 'Sponsors', icon: Award, path: `/dashboard/event-admin/${appId}/sponsors`, color: 'text-indigo-400', visible: config?.monetization?.enabled ?? true },
    { name: 'Leaderboard', icon: Trophy, path: `/dashboard/event-admin/${appId}/leaderboard`, color: 'text-amber-400', visible: config?.modules.leaderboard ?? true },
  ];

  const visibleNavItems = navItems.filter(item => item.visible);

  return (
    <div className="flex h-screen bg-[#050505] text-white selection:bg-blue-500/30 font-sans">
      {/* Sidebar - Glassmorphism */}
      <aside className="w-72 bg-white/[0.02] border-r border-white/10 backdrop-blur-3xl flex flex-col relative z-10">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-black tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              CONTROL PLANE
            </h2>
          </div>
          <div className="flex items-center gap-2 px-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">App ID: {appId.slice(0, 8)}...</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.name}
                href={item.path} 
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-500/10 to-transparent border border-white/10 shadow-inner' 
                    : 'hover:bg-white/[0.03] text-neutral-400 hover:text-white'}`}
              >
                <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-blue-500/20 shadow-lg shadow-blue-500/10' : 'bg-transparent'}`}>
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? item.color : 'text-neutral-500 group-hover:text-neutral-300'}`} />
                </div>
                <span className={`text-sm font-bold tracking-tight transition-all ${isActive ? 'translate-x-1' : ''}`}>
                  {item.name}
                </span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5 bg-gradient-to-b from-transparent to-white/[0.02]">
          <Link href="/dashboard" className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-neutral-500 hover:text-white bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all group">
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Builder
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-[#050505] relative">
        {/* Background Gradients */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
        <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -ml-64 -mb-64 pointer-events-none" />
        
        <div className="relative z-50">
          {children}
        </div>
      </main>
    </div>
  );
}
