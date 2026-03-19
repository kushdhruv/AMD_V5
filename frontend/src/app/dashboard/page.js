
"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { 
  Zap, Globe, Smartphone, PenTool, Layout, 
  ArrowUpRight, Plus, Clock, Image, Video, CreditCard, Package
} from 'lucide-react';

const QuickActionCard = ({ title, icon: Icon, color, href, desc }) => (
  <Link 
    href={href}
    className="glass-card p-6 hover:bg-white/5 transition-all group flex flex-col justify-between h-48"
  >
    <div className="flex justify-between items-start">
      <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
        <ArrowUpRight size={16} />
      </div>
    </div>
    <div>
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <p className="text-text-secondary text-xs">{desc}</p>
    </div>
  </Link>
);

// Maps activity descriptions to icon + color + link
function getActivityMeta(description) {
  const d = (description || "").toLowerCase();
  if (d.includes("video"))  return { icon: Video, color: "text-pink-400", bg: "bg-pink-500/10", link: "/dashboard/generators/video" };
  if (d.includes("poster") || d.includes("image")) return { icon: Image, color: "text-orange-400", bg: "bg-orange-500/10", link: "/dashboard/generators/image" };
  if (d.includes("website") || d.includes("web")) return { icon: Globe, color: "text-blue-400", bg: "bg-blue-500/10", link: "/dashboard/website-builder" };
  if (d.includes("app") || d.includes("apk")) return { icon: Smartphone, color: "text-purple-400", bg: "bg-purple-500/10", link: "/dashboard/app-builder-v2" };
  return { icon: CreditCard, color: "text-green-400", bg: "bg-green-500/10", link: "#" };
}

function timeAgo(dateStr) {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return then.toLocaleDateString();
}

export default function DashboardHome() {
  const [recentActivity, setRecentActivity] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecent() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Fetch credit transactions (all activities) + projects in parallel
      const [txResult, projResult] = await Promise.all([
        supabase
          .from('credit_transactions')
          .select('id, amount, description, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('projects')
          .select('id, name, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      if (txResult.data) setRecentActivity(txResult.data);
      if (projResult.data) setRecentProjects(projResult.data);
      setLoading(false);
    }
    fetchRecent();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-8">
      
      {/* Welcome Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, Creator</h1>
          <p className="text-text-secondary">Ready to launch your next big event?</p>
        </div>
        <button className="btn-primary text-white">
          <Plus size={18} /> New Project
        </button>
      </div>

      {/* Quick Actions Grid */}
      <section>
        <h2 className="text-sm font-bold text-text-secondary uppercase mb-4 tracking-wider">Create New</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickActionCard 
            title="Event Website" 
            icon={Globe} 
            color="text-blue-400" 
            href="/dashboard/website-builder" 
            desc="Generate a landing page from a prompt."
          />
          <QuickActionCard 
            title="Native App" 
            icon={Smartphone} 
            color="text-purple-400" 
            href="/dashboard/app-builder" 
            desc="Build Android APK for announcements."
          />
          <QuickActionCard 
            title="Promo Video" 
            icon={Layout} 
            color="text-pink-400" 
            href="/dashboard/generators/video" 
            desc="Create social media hype videos."
          />
          <QuickActionCard 
            title="Event Poster" 
            icon={PenTool} 
            color="text-orange-400" 
            href="/dashboard/generators/image" 
            desc="Design stunning posters instantly."
          />
        </div>
      </section>

      {/* Recent Activity & Projects — Two columns */}
      <section className="pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Activity Feed — 3 cols */}
          <div className="lg:col-span-3">
            <h2 className="text-sm font-bold text-text-secondary uppercase mb-4 tracking-wider flex items-center gap-2">
              <Clock size={14} /> Recent Activity
            </h2>

            {loading ? (
              <div className="glass-card p-8 text-center text-text-secondary animate-pulse">Loading...</div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-2">
                {recentActivity.map((tx) => {
                  const meta = getActivityMeta(tx.description);
                  const Icon = meta.icon;
                  return (
                    <Link 
                      key={tx.id} 
                      href={meta.link}
                      className="glass-card p-4 flex items-center gap-4 hover:bg-white/5 transition-all group"
                    >
                      <div className={`w-10 h-10 rounded-lg ${meta.bg} flex items-center justify-center ${meta.color} shrink-0`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{tx.description}</p>
                        <p className="text-xs text-text-secondary">{timeAgo(tx.created_at)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-red-400">-{tx.amount}</span>
                        <p className="text-[10px] text-text-secondary">credits</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="glass-card p-10 text-center text-text-secondary">
                <div className="mb-3 text-3xl">⚡</div>
                <p className="text-sm">No activity yet.</p>
                <p className="text-xs mt-1 opacity-60">Your generation history will appear here.</p>
              </div>
            )}
          </div>

          {/* Recent Projects — 2 cols */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-bold text-text-secondary uppercase mb-4 tracking-wider flex items-center gap-2">
              <Package size={14} /> Recent Projects
            </h2>

            {loading ? (
              <div className="glass-card p-8 text-center text-text-secondary animate-pulse">Loading...</div>
            ) : recentProjects.length > 0 ? (
              <div className="space-y-2">
                {recentProjects.map((proj) => (
                  <Link 
                    key={proj.id} 
                    href={`/dashboard/website-builder/${proj.id}`}
                    className="glass-card p-4 flex items-center gap-3 hover:bg-white/5 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                      <Globe size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{proj.name || "Untitled Project"}</p>
                      <p className="text-xs text-text-secondary">{timeAgo(proj.created_at)}</p>
                    </div>
                    <ArrowUpRight size={14} className="text-text-secondary group-hover:text-primary transition shrink-0" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="glass-card p-10 text-center text-text-secondary">
                <div className="mb-3 text-3xl">📂</div>
                <p className="text-sm">No projects yet.</p>
                <p className="text-xs mt-1 opacity-60">Build a website to get started!</p>
              </div>
            )}
          </div>

        </div>
      </section>

    </div>
  );
}
