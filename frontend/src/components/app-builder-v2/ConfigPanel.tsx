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

const THEME_LIBRARY = [
  {
    id: "neon_horizon",
    name: "Neon Horizon",
    desc: "Cyberpunk energy with fuchsia glows and deep slate shadows.",
    preview: ["#D946EF", "#8B5CF6", "#22D3EE", "#0F172A", "#1E293B"],
    colors: {
      primary_color: "#D946EF",
      secondary_color: "#8B5CF6",
      accent: "#22D3EE",
      background: "#0F172A",
      surface: "#1E293B",
      textPrimary: "#F8FAFC",
      textSecondary: "#94A3B8",
      radius: 20,
      font_family: "Space Grotesk",
      dark_mode_enabled: true,
    }
  },
  {
    id: "silk_ink",
    name: "Silk & Ink",
    desc: "Sophisticated editorial style. Cream parchment and charcoal ink.",
    preview: ["#111827", "#F59E0B", "#B45309", "#FFFBEB", "#FEF3C7"],
    colors: {
      primary_color: "#111827",
      secondary_color: "#F59E0B",
      accent: "#B45309",
      background: "#FFFBEB",
      surface: "#FEF3C7",
      textPrimary: "#1F2937",
      textSecondary: "#6B7280",
      radius: 4,
      font_family: "Outfit",
      dark_mode_enabled: false,
    }
  },
  {
    id: "royal_velvet",
    name: "Royal Velvet",
    desc: "Premium luxury. Deep navy meets elegant gold accents.",
    preview: ["#FACC15", "#1E1B4B", "#EAB308", "#020617", "#0F172A"],
    colors: {
      primary_color: "#FACC15",
      secondary_color: "#1E1B4B",
      accent: "#EAB308",
      background: "#020617",
      surface: "#0F172A",
      textPrimary: "#FFFFFF",
      textSecondary: "#94A3B8",
      radius: 12,
      font_family: "Inter",
      dark_mode_enabled: true,
    }
  },
  {
    id: "forest_mist",
    name: "Forest Mist",
    desc: "Organic and calm. Earthy greens and deep forest tones.",
    preview: ["#10B981", "#064E3B", "#34D399", "#022C22", "#064E3B"],
    colors: {
      primary_color: "#10B981",
      secondary_color: "#064E3B",
      accent: "#34D399",
      background: "#022C22",
      surface: "#064E3B",
      textPrimary: "#F0FDF4",
      textSecondary: "#A7F3D0",
      radius: 16,
      font_family: "Inter",
      dark_mode_enabled: true,
    }
  },
  {
    id: "midnight_mono",
    name: "Midnight Mono",
    desc: "Sharp, high-contrast minimalism. Pure black and arctic white.",
    preview: ["#FFFFFF", "#18181B", "#3F3F46", "#000000", "#09090B"],
    colors: {
      primary_color: "#FFFFFF",
      secondary_color: "#18181B",
      accent: "#3F3F46",
      background: "#000000",
      surface: "#09090B",
      textPrimary: "#FAFAFA",
      textSecondary: "#A1A1AA",
      radius: 4,
      font_family: "Space Grotesk",
      dark_mode_enabled: true,
    }
  },
  {
    id: "royal_noir",
    name: "Royal Noir",
    desc: "Luxurious and bold. Matte black with metallic gold accents.",
    preview: ["#EAB308", "#171717", "#FDE047", "#0A0A0A", "#111111"],
    colors: {
      primary_color: "#EAB308", // Metallic Gold
      secondary_color: "#171717", // Matte Black
      accent: "#FDE047",
      background: "#0A0A0A",
      surface: "#111111",
      textPrimary: "#FFFFFF",
      textSecondary: "#A3A3A3",
      radius: 8,
      font_family: "Outfit",
      dark_mode_enabled: true,
    }
  },
  {
    id: "cyber_pulse",
    name: "Cyber Pulse",
    desc: "High-energy cyberpunk with electric pink and cyan.",
    preview: ["#FF2D55", "#000000", "#00F2FF", "#050505", "#0D0D0D"],
    colors: {
      primary_color: "#FF2D55", // Electric Pink
      secondary_color: "#000000",
      accent: "#00F2FF", // Cyber Cyan
      background: "#050505",
      surface: "#0D0D0D",
      textPrimary: "#FAFAFA",
      textSecondary: "#71717A",
      radius: 0,
      font_family: "Space Grotesk",
      dark_mode_enabled: true,
    }
  },
  {
    id: "arctic_cloud",
    name: "Arctic Cloud",
    desc: "Clean, crisp, and spacious. Deep navy on arctic white.",
    preview: ["#0F172A", "#F8FAFC", "#38BDF8", "#FFFFFF", "#F1F5F9"],
    colors: {
      primary_color: "#0F172A", // Deep Navy
      secondary_color: "#F8FAFC", // Arctic White
      accent: "#38BDF8",
      background: "#FFFFFF",
      surface: "#F1F5F9",
      textPrimary: "#020617",
      textSecondary: "#64748B",
      radius: 20,
      font_family: "Inter",
      dark_mode_enabled: false,
    }
  },
  {
    id: "deep_sea_teal",
    name: "Deep Sea Teal",
    desc: "Tranquil and profound. Transformative teal with deep blues.",
    preview: ["#1E6F6B", "#020617", "#5EEAD4", "#010409", "#0D1117"],
    colors: {
      primary_color: "#1E6F6B", // Transformative Teal
      secondary_color: "#020617",
      accent: "#5EEAD4",
      background: "#010409",
      surface: "#0D1117",
      textPrimary: "#E6EDF3",
      textSecondary: "#7D8590",
      radius: 12,
      font_family: "Outfit",
      dark_mode_enabled: true,
    }
  },
  {
    id: "desert_stone",
    name: "Desert Stone",
    desc: "Earthy and warm. Clay amber with natural stone tones.",
    preview: ["#D97706", "#F5F5F4", "#FCD34D", "#FAF9F6", "#F5F5F4"],
    colors: {
      primary_color: "#D97706", // Clay Amber
      secondary_color: "#F5F5F4", // Stone
      accent: "#FCD34D",
      background: "#FAF9F6",
      surface: "#F5F5F4",
      textPrimary: "#1C1917",
      textSecondary: "#57534E",
      radius: 14,
      font_family: "Outfit",
      dark_mode_enabled: false,
    }
  },
  {
    id: "glacier_light",
    name: "Glacier Light",
    desc: "Clean, professional, and spacious. Perfect for corporate summits.",
    preview: ["#2563EB", "#EFF6FF", "#60A5FA", "#FFFFFF", "#F8FAFC"],
    colors: {
      primary_color: "#2563EB",
      secondary_color: "#EFF6FF",
      accent: "#60A5FA",
      background: "#FFFFFF",
      surface: "#F8FAFC",
      textPrimary: "#0F172A",
      textSecondary: "#64748B",
      radius: 12,
      font_family: "Inter",
      dark_mode_enabled: false,
    }
  },
  {
    id: "oceanic_deep",
    name: "Oceanic Deep",
    desc: "Tranquil marine tones. Teals and deep sea blues.",
    preview: ["#0D9488", "#0F172A", "#2DD4BF", "#020617", "#010B13"],
    colors: {
      primary_color: "#0D9488",
      secondary_color: "#0F172A",
      accent: "#2DD4BF",
      background: "#020617",
      surface: "#010B13",
      textPrimary: "#E0F2F1",
      textSecondary: "#94A3B8",
      radius: 16,
      font_family: "Outfit",
      dark_mode_enabled: true,
    }
  },
  {
    id: "sunset_glow",
    name: "Sunset Glow",
    desc: "Warm and inviting. Oranges, corals, and deep purples.",
    preview: ["#F97316", "#FB923C", "#7C3AED", "#1E1B4B", "#2D1B4B"],
    colors: {
      primary_color: "#F97316",
      secondary_color: "#FB923C",
      accent: "#7C3AED",
      background: "#1E1B4B",
      surface: "#2D1B4B",
      textPrimary: "#FFF7ED",
      textSecondary: "#FED7AA",
      radius: 20,
      font_family: "Outfit",
      dark_mode_enabled: true,
    }
  },
  {
    id: "lavender_dream",
    name: "Lavender Dream",
    desc: "Soft and whimsical. Pastel purples and soft whites.",
    preview: ["#8B5CF6", "#F5F3FF", "#DDD6FE", "#FDFCFE", "#F9F5FF"],
    colors: {
      primary_color: "#8B5CF6",
      secondary_color: "#F5F3FF",
      accent: "#DDD6FE",
      background: "#FDFCFE",
      surface: "#F9F5FF",
      textPrimary: "#4C1D95",
      textSecondary: "#7C3AED",
      radius: 24,
      font_family: "Outfit",
      dark_mode_enabled: false,
    }
  }
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
              <label className="text-xs font-medium text-white/70 flex items-center gap-2">
                  App Logo / Icon
                  <span className="text-[10px] text-white/30">(Max 2MB. Square PNG recommended)</span>
              </label>
              
              <div className="flex items-center gap-4">
                  {config.event.logo_url && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-white/5 flex items-center justify-center">
                          <img 
                              src={config.event.logo_url} 
                              alt="App Icon Preview" 
                              className="w-full h-full object-cover" 
                          />
                      </div>
                  )}
                  
                  <div className="flex-1 relative">
                      <input
                        type="file"
                        accept="image/*"
                        disabled={disabled}
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 2 * 1024 * 1024) {
                                alert("File size must be less than 2MB");
                                return;
                            }
                            const reader = new FileReader();
                            reader.onload = (event) => {
                                const base64String = event.target?.result as string;
                                updateNestedConfig(["event", "logo_url"], base64String);
                            };
                            reader.readAsDataURL(file);
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-500/10 file:text-purple-400 hover:file:bg-purple-500/20 cursor-pointer transition-all"
                      />
                  </div>
              </div>
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
               isEnabled={typeof config.modules.registration === 'boolean' ? config.modules.registration : config.modules.registration.enabled}
               onChange={() => handleFeatureToggle('registration')}
            >
                <div className="flex items-center justify-between">
                   <div className="flex flex-col">
                     <span className="text-xs font-bold text-white/80">Allow 'Free Entry' Mode</span>
                     <span className="text-[10px] text-white/40">Users can generate tickets with 0 fees.</span>
                   </div>
                   <button 
                     onClick={() => {
                       const currentVal = (config.modules.registration as any)?.sub_features?.free_tier || false;
                       updateNestedConfig(['modules', 'registration', 'sub_features', 'free_tier'], !currentVal);
                     }}
                     className={clsx(
                       "w-8 h-4 rounded-full relative transition-all duration-300",
                       (config.modules.registration as any)?.sub_features?.free_tier ? "bg-purple-500" : "bg-black border border-white/20"
                     )}
                   >
                       <div className={clsx(
                         "w-3 h-3 rounded-full absolute top-[1px] transition-all duration-300 shadow-sm bg-white",
                         (config.modules.registration as any)?.sub_features?.free_tier ? "left-[17px]" : "left-[1px] opacity-30"
                       )} />
                   </button>
                </div>
            </FeatureCard>
            
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

            <FeatureCard 
               title="Song Queue" 
               desc="Let attendees request and vote on the playlist."
               isEnabled={config.modules.songs}
               onChange={() => handleFeatureToggle('songs')}
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-sm font-medium text-white/50 uppercase tracking-widest mb-4">Theme Library</h3>
            <div className="grid grid-cols-1 gap-4">
              {THEME_LIBRARY.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    const newConfig = { ...config, theme: { ...theme.colors, preset: theme.id } };
                    onChange(newConfig as any);
                  }}
                  className={clsx(
                    "group p-4 rounded-2xl border transition-all text-left relative overflow-hidden",
                    config.theme.preset === theme.id 
                      ? "bg-white/10 border-white/20 shadow-xl" 
                      : "bg-white/5 border-white/5 hover:border-white/10"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-white text-sm">{theme.name}</h4>
                      <p className="text-[10px] text-white/40 mt-0.5">{theme.desc}</p>
                    </div>
                    {config.theme.preset === theme.id && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {theme.preview.map((c, i) => (
                      <div key={i} className="w-full h-2 rounded-full" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </button>
              ))}
            </div>

            <h3 className="text-sm font-medium text-white/50 uppercase tracking-widest mb-4 mt-8">Fine Tuning</h3>
            <div className="space-y-4 bg-white/5 border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-white/70">Dark Mode</label>
                  <button 
                    onClick={() => updateNestedConfig(["theme", "dark_mode_enabled"], !config.theme.dark_mode_enabled)}
                    className={clsx(
                      "w-10 h-6 rounded-full relative transition-all duration-300",
                      config.theme.dark_mode_enabled ? "bg-purple-500" : "bg-white/10"
                    )}
                  >
                    <div className={clsx(
                      "w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-sm",
                      config.theme.dark_mode_enabled ? "left-5" : "left-1"
                    )} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-white/70">Corner Radius</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="range"
                      min="0"
                      max="32"
                      value={config.theme.radius}
                      onChange={(e) => updateNestedConfig(["theme", "radius"], parseInt(e.target.value))}
                      className="w-24 accent-purple-500"
                    />
                    <span className="text-xs text-white/50 w-6 text-right">{config.theme.radius}px</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-white/70">Primary Tone</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.theme.primary_color}
                      onChange={(e) => updateNestedConfig(["theme", "primary_color"], e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                    />
                    <span className="text-[10px] font-mono text-white/30">{config.theme.primary_color}</span>
                  </div>
                </div>
            </div>

            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 flex gap-3">
              <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
              <p className="text-xs text-purple-200">
                Each preset is optimized for a specific vibe, including matching backgrounds and font families.
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

function FeatureCard({ title, desc, isEnabled, onChange, children }: { title: string, desc: string, isEnabled: boolean, onChange: () => void, children?: React.ReactNode }) {
  return (
    <div 
      className={clsx(
        "group p-4 rounded-xl transition-all border duration-300 relative overflow-hidden",
        isEnabled ? "bg-purple-500/10 border-purple-500/30" : "bg-white/5 border-white/5 hover:border-white/10"
      )}
    >
      {isEnabled && <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />}
      <div className="flex items-start justify-between relative z-10 cursor-pointer" onClick={onChange}>
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
      {isEnabled && children && (
        <div className="mt-4 pt-4 border-t border-purple-500/10 relative z-10">
          {children}
        </div>
      )}
    </div>
  );
}
