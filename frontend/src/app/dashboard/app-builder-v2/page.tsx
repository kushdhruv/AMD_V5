"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/supabase-client";
import { Plus, Smartphone, ExternalLink, Settings, LayoutTemplate, Loader2, Calendar, Download, Trash2, Lock } from "lucide-react";

export default function AppBuilderV2Index() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApps = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('template_type', 'expo-app')
      .order('created_at', { ascending: false });

    if (!error && data) setApps(data);
    setLoading(false);
  };

  const checkBuildStatus = async (appId: string, expoFullId: string, projectUpdatedAt: string) => {
    try {
      console.log(`[Auto-Fetch] Checking Expo for app: ${appId} (EAS: ${expoFullId})`);
      const res = await fetch(`/api/builds/latest?appId=${encodeURIComponent(expoFullId)}`);
      const data = await res.json();

      if (data.success && data.status === "FINISHED" && data.apkUrl) {
        // RACE CONDITION FIX: Compare Timestamps
        // We only accept the build if it was created AFTER the project was last updated (triggered)
        // We add a 10s grace period buffer for server clock drift
        const buildTime = new Date(data.createdAt).getTime();
        const triggerTime = new Date(projectUpdatedAt).getTime() - 10000; 

        if (buildTime < triggerTime) {
          console.log(`[Auto-Fetch] Found build (${new Date(buildTime).toLocaleTimeString()}) but it's older than the trigger (${new Date(triggerTime).toLocaleTimeString()}). Ignoring stale build.`);
          return;
        }

        console.log(`[Auto-Fetch] Found valid finished build! Updating Supabase...`);
        
        // 1. Fetch current blueprint to merge
        const { data: project } = await supabase
          .from("projects")
          .select("blueprint_json")
          .eq("id", appId)
          .single();

        const updatedBlueprint = {
          ...(project?.blueprint_json as object || {}),
          apk_url: data.apkUrl,
          last_build_at: data.updatedAt || new Date().toISOString()
        };

        // 2. Update status and URL
        const { error: updateError } = await supabase
          .from("projects")
          .update({
            status: "success",
            blueprint_json: updatedBlueprint
          })
          .eq("id", appId);

        if (!updateError) {
          // Update local state to trigger UI change
          setApps(prev => prev.map(a => a.id === appId ? { ...a, status: 'success', blueprint_json: updatedBlueprint } : a));
        }
      }
    } catch (err) {
      console.error("[Auto-Fetch] Failed to check status:", err);
    }
  };

  useEffect(() => {
    fetchApps();

    // REALTIME SUBSCRIPTION
    const channel = supabase
      .channel('projects_status')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'projects', filter: "template_type=eq.expo-app" }, 
        (payload) => {
          setApps(prev => prev.map(app => app.id === payload.new.id ? payload.new : app));
        }
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'projects', filter: "template_type=eq.expo-app" },
        (payload) => {
          setApps(prev => prev.filter(app => app.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Poll for building apps
  useEffect(() => {
    const buildingApps = apps.filter(app => (app.status === 'building' || app.status === 'started'));
    if (buildingApps.length === 0) return;

    const interval = setInterval(() => {
      buildingApps.forEach(app => {
        // Use hardcoded project ID from app.json as fallback if not in blueprint
        const expoFullId = app.blueprint_json?.expo_full_id || "@kushdhruv/expo-template";
        checkBuildStatus(app.id, expoFullId, app.updated_at);
      });
    }, 60000); // Check every 60 seconds (1 minute)

    return () => clearInterval(interval);
  }, [apps]);

  const handleDeleteApp = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setApps(prev => prev.filter(app => app.id !== id));
      alert("✅ Project deleted successfully.");
    } catch (err: any) {
      console.error("Delete Error:", err);
      alert(`⚠️ Delete Failed: ${err.message}`);
    }
  };

  const downloadApk = (url: string, name: string) => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name.replace(/\s+/g, '_')}_v1.apk`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            App Builder V2
          </h1>
          <p className="text-neutral-400 mt-2 font-medium">
            Manage your AI-powered, config-driven Expo mobile applications.
          </p>
        </div>
        <Link href="/dashboard/app-builder-v2/new">
          <button className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-xl shadow-blue-500/20 font-bold transition-all hover:scale-[1.02] active:scale-95">
            <Plus className="w-5 h-5" />
            Create New App
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
        {loading ? (
           <div className="col-span-full py-20 flex flex-col items-center justify-center text-neutral-500">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
              <p className="font-bold tracking-widest uppercase text-xs">Loading your apps...</p>
           </div>
        ) : apps.length === 0 ? (
          <div className="col-span-full border-2 border-dashed border-white/5 bg-white/[0.02] rounded-3xl p-16 flex flex-col items-center justify-center text-center group transition-all hover:bg-white/[0.04]">
              <div className="w-20 h-20 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-2xl">
                <Smartphone className="w-10 h-10 text-neutral-600 group-hover:text-blue-500" />
              </div>
              <h3 className="font-bold text-2xl text-white">No Apps Found</h3>
              <p className="text-neutral-400 mt-2 mb-8 max-w-xs">Start building your first high-performance event app with our AI architect.</p>
              <Link href="/dashboard/app-builder-v2/new">
                <button className="px-10 py-3 bg-white text-black rounded-xl font-bold hover:bg-neutral-200 transition-colors">
                  Build Now
                </button>
              </Link>
          </div>
        ) : (
          apps.map((app) => {
            const status = (app.status || 'draft').toLowerCase();
            const isBuilding = status === 'building' || status === 'started';
            const isSuccess = status === 'success' || status === 'generated' || status === 'completed';
            const apkUrl = app.blueprint_json?.apk_url || app.metadata?.apk_url || app.artifact_url;

            return (
              <div key={app.id} className="group relative bg-[#111] border border-white/5 rounded-3xl p-6 transition-all hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10 overflow-hidden">
                 {/* Background Pattern */}
                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                    <Smartphone className="w-32 h-32 -mr-16 -mt-8 rotate-12" />
                 </div>

                 <div className="relative z-10 flex flex-col h-full">
                     <div className="flex justify-between items-start mb-6">
                       <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-colors ${isBuilding ? 'bg-amber-500/20 text-amber-500 animate-pulse' : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/20'}`}>
                          {isBuilding ? <Loader2 className="w-6 h-6 animate-spin" /> : <LayoutTemplate className="w-6 h-6" />}
                       </div>
                       <div className="flex flex-col items-end gap-2">
                         <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors
                           ${isBuilding ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                             app.status === 'success' || app.status === 'generated' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                             app.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                             'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                            {isBuilding ? 'Building APK...' : app.status || 'Draft'}
                         </span>
                         <button 
                           onClick={(e) => {
                             e.preventDefault();
                             handleDeleteApp(app.id, app.name);
                           }}
                           className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                           title="Delete Project"
                         >
                           <Trash2 className="w-3.5 h-3.5" />
                         </button>
                       </div>
                     </div>

                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-1">{app.name}</h3>
                    <div className="flex items-center gap-2 text-neutral-500 text-xs mb-8">
                       <Calendar className="w-3 h-3" />
                       {new Date(app.created_at).toLocaleDateString()}
                    </div>

                    <div className="mt-auto flex flex-col gap-3">
                       <div className="grid grid-cols-2 gap-3">
                          <Link 
                            href={`/dashboard/app-builder-v2/new?id=${app.id}`} 
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all
                              ${isSuccess ? 'bg-amber-500/5 text-amber-500/80 border-amber-500/10 hover:bg-amber-500/10' : 'bg-white/5 text-white border-white/5 hover:bg-white/10'}`}
                          >
                             {isSuccess ? <Lock className="w-3.5 h-3.5" /> : <Settings className="w-3.5 h-3.5" />}
                             {isSuccess ? 'View Design' : 'Edit Builder'}
                          </Link>
                          <Link href={`/dashboard/event-admin/${app.id}/stalls`} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all">
                              Manage Data <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                       </div>
                       
                        {apkUrl ? (
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              downloadApk(apkUrl, app.name);
                            }}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                          >
                             <Download className="w-4 h-4" /> Download APK
                          </button>
                        ) : isBuilding ? (
                          <div className="flex flex-col gap-2">
                            <div className="w-full py-3 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-3 border border-amber-500/20 cursor-wait">
                               <Loader2 className="w-4 h-4 animate-spin" /> Build in Progress...
                            </div>
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                const expoFullId = app.blueprint_json?.expo_full_id || "@kushdhruv/expo-template";
                                checkBuildStatus(app.id, expoFullId, app.updated_at);
                              }}
                              className="w-full py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg border border-white/5 transition-all active:scale-95"
                            >
                               Manual Sync Check
                            </button>
                          </div>
                        ) : null}
                    </div>
                 </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
