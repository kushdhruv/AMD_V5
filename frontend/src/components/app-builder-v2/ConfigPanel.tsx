"use client";

import { AppConfig } from "@/lib/app-builder-v2/schema/configSchema";
import { useState } from "react";
import { Check, ChevronRight, Settings2, Layout, Palette, DollarSign, Sparkles, AlertCircle } from "lucide-react";
import { clsx } from "clsx";

type Props = {
  config: AppConfig;
  onChange: (newConfig: AppConfig) => void;
  onGenerate: () => void;
  disabled: boolean;
};

const STEPS = [
  { id: 1, title: "Event Details", icon: Settings2 },
  { id: 2, title: "Features", icon: Layout },
  { id: 3, title: "Theme", icon: Palette },
  { id: 4, title: "Monetization", icon: DollarSign },
  { id: 5, title: "Review", icon: Check },
];

export default function ConfigPanel({ config, onChange, onGenerate, disabled }: Props) {
  const [step, setStep] = useState(1);

  const updateNestedConfig = (path: string[], value: any) => {
    if (disabled) return;
    const newConfig = JSON.parse(JSON.stringify(config));
    let current = newConfig;
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) current[path[i]] = {};
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    onChange(newConfig);
  };

  const handleFeatureToggle = (moduleKey: keyof typeof config.modules, subKey?: string, value?: boolean) => {
    if (disabled) return;
    if (typeof config.modules[moduleKey] === 'boolean') {
        updateNestedConfig(['modules', moduleKey as string], !config.modules[moduleKey]);
    } else {
        const enabled = (config.modules[moduleKey] as any).enabled;
        updateNestedConfig(['modules', moduleKey as string, 'enabled'], !enabled);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/40">
      {/* Step Header */}
      <div className="p-6 border-b border-white/5">
        <h2 className="text-lg font-bold text-white mb-4">App Configuration</h2>
        <div className="flex justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/5 -translate-y-1/2" />
          <div 
            className="absolute top-1/2 left-0 h-[2px] bg-purple-500 -translate-y-1/2 transition-all duration-300"
            style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
          />
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isPast = step > s.id;
            return (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={clsx(
                  "relative z-10 flex flex-col items-center gap-2 group transition-all",
                  isActive || isPast ? "text-purple-400" : "text-white/30 hover:text-white/50"
                )}
              >
                <div className={clsx(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all bg-black border-2",
                  isActive ? "border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]" : 
                  isPast ? "border-purple-500 bg-purple-500/10 text-purple-400" : "border-white/10 bg-white/5"
                )}>
                  {isPast ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h3 className="text-sm font-medium text-white/50 uppercase tracking-widest mb-3">Quick Templates</h3>
              <div className="grid grid-cols-2 gap-3">
                 <button className="p-3 text-left rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-all text-xs text-purple-200">
                    <span className="block font-bold text-sm text-purple-300 mb-1">Tech Fest</span>
                    Includes Leaderboard, Live Scores & Speakers
                 </button>
                 <button className="p-3 text-left rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all text-xs text-blue-200">
                    <span className="block font-bold text-sm text-blue-300 mb-1">Cultural Fest</span>
                    Includes Voting & Song Queue
                 </button>
                 <button className="p-3 text-left rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-xs text-emerald-200 col-span-2">
                    <span className="block font-bold text-sm text-emerald-300 mb-1">Hackathon</span>
                    Includes Registrations, Teams & Announcements
                 </button>
              </div>
            </div>

            <h3 className="text-sm font-medium text-white/50 uppercase tracking-widest mb-4 mt-8">Event Basics</h3>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/70">Event Name</label>
              <input
                type="text"
                disabled={disabled}
                value={config.event.name}
                onChange={(e) => updateNestedConfig(["event", "name"], e.target.value)}
                placeholder="e.g. Hackathon 2026"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/70">Tagline / Subtitle</label>
              <input
                type="text"
                disabled={disabled}
                value={config.event.tagline || ""}
                onChange={(e) => updateNestedConfig(["event", "tagline"], e.target.value)}
                placeholder="The biggest event of the year"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-white/70">App Logo URL</label>
              <input
                type="text"
                disabled={disabled}
                value={config.event.logo_url || ""}
                onChange={(e) => updateNestedConfig(["event", "logo_url"], e.target.value)}
                placeholder="https://..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white/50 uppercase tracking-widest">App Capabilities</h3>
              <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full border border-purple-500/20">Max 8</span>
            </div>
            
            <FeatureCard 
               title="Registration Engine" 
               desc="Ticketing, QR codes, and profile management."
               isEnabled={config.modules.registration}
               onChange={() => handleFeatureToggle('registration')}
            />
            
            <FeatureCard 
               title="Stalls & Commerce" 
               desc="Digital storefronts, menus, and WhatsApp ordering."
               isEnabled={config.modules.commerce.enabled}
               onChange={() => handleFeatureToggle('commerce')}
            />
            
            <FeatureCard 
               title="Live Leaderboard" 
               desc="Real-time rankings and gamification."
               isEnabled={config.modules.leaderboard}
               onChange={() => handleFeatureToggle('leaderboard')}
            />

            <FeatureCard 
               title="Coupons & Deals" 
               desc="Redeemable sponsor discounts."
               isEnabled={config.modules.coupons}
               onChange={() => handleFeatureToggle('coupons')}
            />

            <FeatureCard 
               title="Speaker Profiles" 
               desc="Swipeable bios and event schedules."
               isEnabled={config.modules.speakers.enabled}
               onChange={() => handleFeatureToggle('speakers')}
            />
            
            <FeatureCard 
               title="Announcements" 
               desc="Push notifications and live feeds."
               isEnabled={config.modules.announcements}
               onChange={() => handleFeatureToggle('announcements')}
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-sm font-medium text-white/50 uppercase tracking-widest mb-4">Appearance</h3>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/70 flex justify-between">
                Primary Brand Color
                <span className="text-white/40">{config.theme.primary_color}</span>
              </label>
              <div className="flex gap-3">
                <input
                  type="color"
                  disabled={disabled}
                  value={config.theme.primary_color}
                  onChange={(e) => updateNestedConfig(["theme", "primary_color"], e.target.value)}
                  className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                />
                <div className="flex-1 flex gap-2">
                  {['#A855F7', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#000000'].map(c => (
                    <button 
                      key={c}
                      onClick={() => updateNestedConfig(["theme", "primary_color"], c)}
                      className="w-8 h-8 rounded-full border-2 border-white/10 hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 flex gap-3">
              <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
              <p className="text-xs text-purple-200">
                You can ask the AI Architect to generate a complete theme palette based on your event vibe (e.g. "Cyberpunk Fest").
              </p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-white/50 uppercase tracking-widest">Sponsorships</h3>
              <div className="flex items-center gap-2">
                  <span className="text-xs text-white/50">Enable</span>
                  <button 
                    onClick={() => updateNestedConfig(["monetization", "enabled"], !config.monetization.enabled)}
                    className={clsx(
                      "w-10 h-6 rounded-full relative transition-all duration-300",
                      config.monetization.enabled ? "bg-emerald-500" : "bg-white/10"
                    )}
                  >
                    <div className={clsx(
                      "w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-sm",
                      config.monetization.enabled ? "left-5" : "left-1"
                    )} />
                  </button>
              </div>
            </div>
            
            {config.monetization.enabled ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <h4 className="text-emerald-400 text-sm font-bold mb-1">Global Ad Engine Live</h4>
                  <p className="text-xs text-emerald-200/70">Ads are injected automatically into the Home and Leaderboard feeds.</p>
                </div>
                {/* Visual Placeholder for Add Slot */}
                <button className="w-full py-3 border border-dashed border-white/20 rounded-xl text-white/40 text-sm hover:bg-white/5 hover:text-white/60 transition-colors flex items-center justify-center gap-2">
                  <span>+ Add Sponsor Slot</span>
                </button>
              </div>
            ) : (
                <div className="p-6 text-center border border-white/5 rounded-xl bg-white/5">
                    <DollarSign className="w-8 h-8 text-white/20 mx-auto mb-2" />
                    <p className="text-sm text-white/40">Enable monetization to inject sponsor banners naturally into the app structure.</p>
                </div>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-sm font-medium text-white/50 uppercase tracking-widest mb-4">App Summary</h3>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                <div 
                  className="w-12 h-12 rounded-xl border border-white/10 shrink-0"
                  style={{ backgroundColor: config.theme.primary_color }}
                />
                <div>
                  <h4 className="font-bold text-white tracking-wide">{config.event.name || "Untitled"}</h4>
                  <p className="text-xs text-white/40">{config.event.tagline || "No tagline"}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Enabled Features</h5>
                  <ul className="space-y-1">
                    {Object.entries(config.modules).map(([key, val]) => {
                      const enabled = typeof val === 'boolean' ? val : val.enabled;
                      if (!enabled) return null;
                      return (
                        <li key={key} className="text-xs text-white/80 flex items-center gap-2">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="capitalize">{key}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div>
                  <h5 className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Monetization</h5>
                  {config.monetization.enabled ? (
                    <div className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> Active (Est. ₹50k - ₹2L)
                    </div>
                  ) : (
                    <div className="text-xs text-white/30">Disabled</div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                 <h5 className="text-[10px] text-white/40 uppercase tracking-widest mb-3">Build Confidence Checklist</h5>
                 <div className="flex items-center gap-2 text-xs text-white/80"><div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-emerald-400" /></div> Schema Validation Passed</div>
                 <div className="flex items-center gap-2 text-xs text-white/80"><div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-emerald-400" /></div> Theme Engine Ready</div>
                 <div className="flex items-center gap-2 text-xs text-white/80"><div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-emerald-400" /></div> Global Routing Linked</div>
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 flex items-start gap-3 border border-purple-500/20">
              <AlertCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-purple-300">Ready for Build</h4>
                <p className="text-xs text-purple-200 mt-1 leading-relaxed">
                  When you click 'Generate App' in the top bar, this exact structure is locked and shipped to the Expo Builder pipeline to produce your APK.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Nav */}
      <div className="p-4 border-t border-white/5 flex items-center justify-between bg-black/50">
        <button 
          onClick={() => setStep(s => Math.max(1, s - 1))}
          className={clsx("text-sm font-medium transition-colors", step === 1 ? "text-white/20 pointer-events-none" : "text-white/60 hover:text-white")}
        >
          Back
        </button>
        {step < 5 ? (
          <button 
            onClick={() => setStep(s => s + 1)}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all text-sm"
          >
            Next Step <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button 
            disabled={disabled}
            onClick={onGenerate}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 text-sm disabled:opacity-50"
          >
            Approve Build
          </button>
        )}
      </div>
    </div>
  );
}

function FeatureCard({ title, desc, isEnabled, onChange }: { title: string, desc: string, isEnabled: boolean, onChange: () => void }) {
  return (
    <div 
      onClick={onChange}
      className={clsx(
        "group p-4 rounded-xl cursor-pointer transition-all border duration-300 relative overflow-hidden",
        isEnabled ? "bg-purple-500/10 border-purple-500/30" : "bg-white/5 border-white/5 hover:border-white/10"
      )}
    >
      {isEnabled && <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />}
      <div className="flex items-start justify-between relative z-10">
        <div>
          <h4 className={clsx("text-sm font-bold tracking-wide transition-colors", isEnabled ? "text-purple-300" : "text-white/80")}>{title}</h4>
          <p className="text-xs text-white/40 mt-1 pr-6 leading-relaxed">{desc}</p>
        </div>
        <div className={clsx(
          "w-10 h-6 shrink-0 rounded-full relative transition-all duration-300",
          isEnabled ? "bg-purple-500" : "bg-black border border-white/20"
        )}>
           <div className={clsx(
             "w-4 h-4 rounded-full absolute top-1 transition-all duration-300 shadow-sm",
             isEnabled ? "bg-white left-5" : "bg-white/30 left-1"
           )} />
        </div>
      </div>
    </div>
  );
}
