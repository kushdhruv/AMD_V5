"use client";

import { AppConfigSchema, AppConfig } from "@/lib/app-builder-v2/schema/configSchema";
import { useState } from "react";
import ConfigPanel from "@/components/app-builder-v2/ConfigPanel";
import LivePreview from "@/components/app-builder-v2/LivePreview";
import ChatPanel from "@/components/app-builder-v2/ChatPanel";
import { validateAppConfig } from "@/lib/app-builder-v2/schema/validator";
import { Loader2, Download, Sparkles, LayoutTemplate, Save } from "lucide-react";

export default function AppBuilderV2Dynamic() {
  const [config, setConfig] = useState<AppConfig>(validateAppConfig(AppConfigSchema.parse({ event: { name: "Untitled Event" } })).parsedConfig!);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [actionsUrl, setActionsUrl] = useState<string | null>(null);

  const handleConfigUpdate = (newConfig: AppConfig) => {
    setConfig(newConfig);
  };

  const handleGenerateApp = async () => {
    setIsGenerating(true);
    try {
      // 1. Update State Machine locally
      const frozenConfig = { ...config, app_state: "GENERATED" as const };
      setConfig(frozenConfig);
      
      // 2. Trigger Real EAS Build Pipeline via GitHub Actions
      console.log("[EAS Build] Triggering build pipeline for:", frozenConfig.event.name);
      
      const res = await fetch("/api/build-expo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          config: frozenConfig,
          appId: config.id || `app_${Date.now()}` 
        }),
      });

      const data = await res.json();

      if (data.success) {
        setActionsUrl(data.actionsUrl);
        alert(`🚀 App Generation Started!\n\nStructural configuration is now locked. You can monitor your build progress on GitHub Actions.`);
      } else {
        throw new Error(data.error || "Failed to trigger build");
      }
    } catch (error: any) {
      console.error("Build Error:", error);
      alert(`⚠️ Build Trigger Failed: ${error.message}`);
      // Revert state if failed
      setConfig({ ...config, app_state: "DRAFT" as const });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-90px)] bg-[#0a0a0a] text-white font-sans overflow-hidden selection:bg-purple-500/30 rounded-2xl border border-white/5 shadow-2xl">
      {/* MAC-STYLE TOP BAR */}
      <div className="h-16 border-b border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide text-white/90">AI EVENT APP CREATOR</h1>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">{config.event.name || "Untitled Draft"} • {config.app_state}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 mr-4 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
            <div className={`w-2 h-2 rounded-full ${config.app_state === 'GENERATED' ? 'bg-blue-500' : 'bg-emerald-500 animate-pulse'}`} />
            {config.app_state === 'GENERATED' ? 'Locked (Frozen)' : 'Auto-saving'}
          </div>
          <button 
            disabled={config.app_state === 'GENERATED'}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors border border-white/5 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> Save Draft
          </button>
          
          {config.app_state !== 'GENERATED' && (
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl blur opacity-40 group-hover:opacity-70 transition duration-500"></div>
              <button 
                onClick={handleGenerateApp}
                disabled={isGenerating}
                className="relative flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-bold transition-all shadow-xl shadow-purple-500/30 disabled:opacity-75"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {isGenerating ? "Triggering EAS..." : "Generate App"}
              </button>
            </div>
          )}
          
          {config.app_state === 'GENERATED' && (
            <button 
              onClick={() => {
                if (actionsUrl) {
                  window.open(actionsUrl, '_blank');
                } else {
                  alert("Build link not available yet. Please refresh or check GitHub Actions directly.");
                }
              }}
              className="relative flex items-center gap-2 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 transition-colors text-white text-sm font-bold shadow-xl shadow-emerald-500/30"
            >
              <Download className="w-4 h-4" /> {actionsUrl ? "Download APK (via GitHub)" : "Build in Progress..."}
            </button>
          )}
        </div>
      </div>


      {/* 3-PANEL WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: Guided Step Builder (25%) */}
        <div className="w-1/4 min-w-[320px] max-w-[400px] border-r border-white/5 bg-black/20 backdrop-blur-md flex flex-col z-10 shrink-0">
          <ConfigPanel 
            config={config} 
            onChange={handleConfigUpdate} 
            onGenerate={handleGenerateApp}
            disabled={isUpdating || config.app_state === 'GENERATED' || config.app_state === 'LIVE'} 
          />
        </div>

        {/* CENTER PANEL: Live Mobile Preview (50-60%) */}
        <div className="flex-1 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black relative flex items-center justify-center p-8 overflow-hidden">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
          
          <div className="relative z-10 h-full max-h-[850px] w-full max-w-[400px]">
            <LivePreview config={config} isUpdating={isUpdating} />
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 flex items-center gap-4 z-20 shadow-2xl">
            <div className="flex items-center gap-2 text-xs font-medium text-white/70">
              <div className="px-2 py-1 rounded bg-white/10 text-white">100%</div>
              Zoom
            </div>
            <div className="w-[1px] h-4 bg-white/10" />
            <div className="flex items-center gap-2 text-xs font-medium text-purple-400">
              <Loader2 className={`w-4 h-4 ${isUpdating ? 'animate-spin opacity-100' : 'opacity-0'}`} />
              {isUpdating ? "Syncing..." : "Live Sync Active"}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: AI App Architect (25%) */}
        <div className="w-1/4 min-w-[320px] max-w-[400px] border-l border-white/5 bg-black/20 backdrop-blur-md flex flex-col z-10 shrink-0">
          <ChatPanel config={config} onUpdateConfig={handleConfigUpdate} setUpdating={setIsUpdating} />
        </div>
      </div>
    </div>
  );
}
