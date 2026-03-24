import React from 'react';
import { 
  BarChart3, 
  Settings, 
  Users, 
  Utensils, 
  Music, 
  Bell, 
  Trophy, 
  ArrowLeft 
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { appId: string };
}) {
  const { appId } = params;

  return (
    <div className="flex h-screen bg-neutral-950 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col">
        <div className="p-6 border-b border-neutral-800">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            Data Control Plane
          </h2>
          <p className="text-xs text-neutral-400 mt-1">App ID: {appId}</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href={`/dashboard/event-admin/${appId}`} className="block px-4 py-2 rounded-lg hover:bg-neutral-800 transition-colors">
            📊 Overview
          </Link>
          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Modules</p>
          </div>
          <Link href={`/dashboard/event-admin/${appId}/attendees`} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-neutral-800 transition-all text-sm group">
            <Users className="w-4 h-4 text-neutral-500 group-hover:text-blue-400" />
            Attendees
          </Link>
          <Link href={`/dashboard/event-admin/${appId}/stalls`} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-neutral-800 transition-all text-sm group">
            <Utensils className="w-4 h-4 text-neutral-500 group-hover:text-emerald-400" />
            Stalls & Menu
          </Link>
          <Link href={`/dashboard/event-admin/${appId}/songs`} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-neutral-800 transition-all text-sm group">
            <Music className="w-4 h-4 text-neutral-500 group-hover:text-purple-400" />
            Song Queue
          </Link>
          <Link href={`/dashboard/event-admin/${appId}/announcements`} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-neutral-800 transition-all text-sm group">
            <Bell className="w-4 h-4 text-neutral-500 group-hover:text-red-400" />
            Announcements
          </Link>
          <Link href={`/dashboard/event-admin/${appId}/leaderboard`} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-neutral-800 transition-all text-sm group">
            <Trophy className="w-4 h-4 text-neutral-500 group-hover:text-amber-400" />
            Leaderboard
          </Link>
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <Link href="/dashboard" className="block px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors">
            ← Back to Builder
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-neutral-950">
        {children}
      </main>
    </div>
  );
}
