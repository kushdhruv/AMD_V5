"use client";

import React, { useState } from "react";
import { AppConfig } from "@/lib/app-builder-v2/schema/configSchema";
import { 
  Loader2, Home, Compass, Activity, User, Ticket, Map, Calendar, 
  Bell, ChevronRight, Star, ShoppingCart, Search, Utensils, 
  Smartphone, Music, Trophy, QrCode, LogOut, Settings, Award
} from "lucide-react";

type Props = {
  config: AppConfig;
  isUpdating: boolean;
};

const getContrastColor = (hex: string) => {
  if (!hex) return "#FFFFFF";
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#FFFFFF";
};

// --- MOCK DATA ---
const MOCK_STALLS = [
  { id: 1, name: "Pizza Hub 🍕", description: "Fresh Wood-fired pizzas", rating: 4.5, price: "₹150 - ₹400", featured: true, image: "🍕" },
  { id: 2, name: "Burger Bistro 🍔", description: "Juicy gourmet burgers", rating: 4.2, price: "₹100 - ₹300", featured: false, image: "🍔" },
  { id: 3, name: "Taco Town 🌮", description: "Authentic Mexican street food", rating: 4.8, price: "₹120 - ₹250", featured: true, image: "🌮" },
];

const MOCK_SPEAKERS = [
  { id: 1, name: "Dr. Sarah Chen", role: "AI Research Lead @ Google", topic: "Future of AI", image: "👩‍🔬" },
  { id: 2, name: "Marcus Johnson", role: "CEO @ StartupX", topic: "Building Unicorns", image: "👨‍💼" },
];

const MOCK_SPONSORS = [
  { id: 1, name: "TechCorp", tier: "Platinum", desc: "Powering the future", is_active: true },
  { id: 2, name: "InnovateLabs", tier: "Gold", desc: "Creative solutions", is_active: true },
  { id: 3, name: "Global Systems", tier: "Gold", desc: "Scalable infrastructure", is_active: true },
  { id: 4, name: "Future Foundry", tier: "Silver", desc: "Incubating tomorrow", is_active: true },
  { id: 5, name: "Nexus Digital", tier: "Silver", desc: "Connected strategy", is_active: true },
];

const MOCK_ANNOUNCEMENTS = [
  { id: 1, title: "Food Court Extended", body: "All food stalls will remain open until 1:00 AM tonight!", time: "10 mins ago" },
  { id: 2, title: "Workshop Registration Open", body: "Register for tomorrow's AI/ML workshop. Limited seats!", time: "1 hour ago" },
];

export default function LivePreview({ config, isUpdating }: Props) {
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'tickets' | 'activities' | 'profile'>('home');
  const [exploreSubTab, setExploreSubTab] = useState<'stalls' | 'sponsors' | 'speakers'>('stalls');
  
  if (!config || !config.theme || !config.event) {
    return (
      <div className="flex-1 w-full h-full flex flex-col items-center justify-center -mt-8">
        <div className="relative w-[340px] h-[740px] bg-black rounded-[45px] shadow-[0_0_50px_rgba(0,0,0,0.5)] border-[8px] border-[#1a1a1a] overflow-hidden flex flex-center items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-white/20" />
        </div>
      </div>
    );
  }

  const { theme, event, modules, monetization } = config;
  
  const primaryColor = theme.primary_color;
  const secondaryColor = theme.secondary_color;
  const accentColor = theme.accent;
  const bgColor = theme.background;
  const surfaceColor = theme.surface;
  const textPrimary = theme.textPrimary;
  const textSecondary = theme.textSecondary;
  const borderRadius = theme.radius;
  const isDark = theme.dark_mode_enabled;

  // --- SUB-COMPONENTS (SCREENS) ---

  const HomeScreen = () => (
    <div className="flex-1 overflow-y-auto px-5 pt-4 pb-24 scrollbar-hide animate-in fade-in duration-500">
      {/* Hero Banner */}
      <div 
        className="w-full p-5 mb-5 relative overflow-hidden min-h-[160px] flex flex-col justify-center border border-white/5 shadow-2xl"
        style={{ backgroundColor: `${primaryColor}15`, borderRadius: borderRadius }}
      >
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent pointer-events-none" />
        <div 
          className="self-start px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 border backdrop-blur-md"
          style={{ backgroundColor: `${primaryColor}40`, borderColor: `${primaryColor}80`, color: '#fff' }}
        >
          ✨ Day 1 Live
        </div>
        <h2 className="text-2xl font-bold leading-tight relative" style={{ color: textPrimary }}>Welcome to {event.name || "Untitled Event"}</h2>
        <p className="text-xs opacity-80 mt-1 relative" style={{ color: textSecondary }}>{event.tagline || "Experience innovation & creativity"}</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {modules.registration && (
          <div className="p-3 flex flex-col items-center justify-center gap-2 border shadow-lg cursor-pointer active:scale-95 transition-transform" onClick={() => setActiveTab('tickets')} style={{ backgroundColor: primaryColor, borderColor: `${primaryColor}80`, borderRadius: borderRadius * 0.7 }}>
            <Ticket className="w-5 h-5" style={{ color: getContrastColor(primaryColor) }} />
            <span className="text-[10px] font-bold" style={{ color: getContrastColor(primaryColor) }}>Tickets</span>
          </div>
        )}
        {modules.commerce.enabled && (
          <div className="p-3 flex flex-col items-center justify-center gap-2 border border-white/5 shadow-lg cursor-pointer active:scale-95 transition-transform" onClick={() => { setActiveTab('explore'); setExploreSubTab('stalls'); }} style={{ backgroundColor: surfaceColor, borderRadius: borderRadius * 0.7 }}>
            <Compass className="w-5 h-5" style={{ color: accentColor }} />
            <span className="text-[10px] font-medium" style={{ color: textSecondary }}>Stalls</span>
          </div>
        )}
        <div className="p-3 flex flex-col items-center justify-center gap-2 border border-white/5 shadow-lg cursor-pointer active:scale-95 transition-transform" style={{ backgroundColor: surfaceColor, borderRadius: borderRadius * 0.7 }}>
          <Calendar className="w-5 h-5 text-blue-400" />
          <span className="text-[10px] font-medium" style={{ color: textSecondary }}>Schedule</span>
        </div>
      </div>

      {/* Now Happening */}
      <div className="w-full p-4 mb-5 border border-white/5 shadow-lg relative overflow-hidden cursor-pointer active:opacity-80 transition-opacity" style={{ backgroundColor: surfaceColor, borderRadius: borderRadius }}>
        <div className="flex items-center gap-2 mb-1">
           <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
           <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: accentColor }}>Now Happening</span>
        </div>
        <h3 className="text-base font-bold" style={{ color: textPrimary }}>DJ Night @ Main Stage</h3>
        <p className="text-xs mt-1 font-medium" style={{ color: textSecondary }}>8:00 PM - 11:00 PM</p>
        <div className="absolute right-4 bottom-4 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg" style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}>Join</div>
      </div>

      {/* Announcements */}
      {modules.announcements && (
        <div className="w-full mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold" style={{ color: textPrimary }}>Announcements</h3>
            <span style={{ color: primaryColor }} className="text-[10px] font-bold uppercase cursor-pointer">View All</span>
          </div>
          {MOCK_ANNOUNCEMENTS.map(a => (
            <div key={a.id} className="rounded-xl p-4 border border-white/5 flex gap-3 mb-3 cursor-pointer hover:bg-white/[0.02] transition-colors" style={{ backgroundColor: surfaceColor, borderRadius: borderRadius }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${primaryColor}15` }}>
                 <Bell className="w-4 h-4" style={{ color: primaryColor }} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold" style={{ color: textPrimary }}>{a.title}</h4>
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: textSecondary }}>{a.body}</p>
                <span className="text-[9px] mt-1 block" style={{ color: textSecondary, opacity: 0.6 }}>{a.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const ExploreScreen = () => (
    <div className="flex-1 overflow-y-auto px-5 pt-4 pb-24 scrollbar-hide animate-in slide-in-from-right-4 duration-300">
      <h2 className="text-xl font-bold mb-4" style={{ color: textPrimary }}>Explore</h2>
      
      {/* Sub-tabs */}
      <div className="flex gap-2 mb-6 p-1 rounded-xl border border-white/5" style={{ backgroundColor: surfaceColor, borderRadius: borderRadius }}>
        <button 
          onClick={() => setExploreSubTab('stalls')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${exploreSubTab === 'stalls' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          style={exploreSubTab === 'stalls' ? { backgroundColor: primaryColor } : {}}
        >
          Stalls
        </button>
        <button 
          onClick={() => setExploreSubTab('sponsors')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${exploreSubTab === 'sponsors' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          style={exploreSubTab === 'sponsors' ? { backgroundColor: primaryColor } : {}}
        >
          Sponsors
        </button>
        <button 
          onClick={() => setExploreSubTab('speakers')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${exploreSubTab === 'speakers' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          style={exploreSubTab === 'speakers' ? { backgroundColor: primaryColor } : {}}
        >
          Speakers
        </button>
      </div>

      {exploreSubTab === 'stalls' && (
        <div className="space-y-4">
          {MOCK_STALLS.map(s => (
            <div key={s.id} className="rounded-2xl overflow-hidden border border-white/5 shadow-xl group cursor-pointer" style={{ backgroundColor: surfaceColor, borderRadius: borderRadius }}>
              <div className="h-32 bg-gray-800/50 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-500 relative">
                 {s.image}
                 {s.featured && <div className="absolute top-3 right-3 px-2 py-0.5 bg-purple-600 text-[8px] font-black rounded-md uppercase tracking-tighter shadow-lg">Featured</div>}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-base" style={{ color: textPrimary }}>{s.name}</h4>
                    <p className="text-xs mt-0.5" style={{ color: textSecondary }}>{s.description}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold text-yellow-500">{s.rating}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs font-bold" style={{ color: textSecondary }}>{s.price}</span>
                  <div className="flex gap-2">
                    <div className="px-4 py-1.5 rounded-lg border text-[10px] font-bold hover:bg-white/5 transition-colors" style={{ borderColor: `${primaryColor}30`, color: textSecondary }}>Menu</div>
                    <div className="px-4 py-1.5 rounded-lg text-[10px] font-bold shadow-lg active:scale-95 transition-transform" style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}>Order Now</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {exploreSubTab === 'speakers' && (
        <div className="space-y-3">
          {MOCK_SPEAKERS.map(s => (
            <div key={s.id} className="rounded-xl p-3 border border-white/5 flex items-center gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors group" style={{ backgroundColor: surfaceColor, borderRadius: borderRadius }}>
               <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center text-2xl border-2 border-white/5 shadow-lg group-hover:border-purple-500/30 transition-colors">{s.image}</div>
               <div className="flex-1">
                 <h4 className="text-sm font-bold" style={{ color: textPrimary }}>{s.name}</h4>
                 <p className="text-[10px] mt-0.5" style={{ color: textSecondary }}>{s.role}</p>
                 <div className="flex items-center gap-1.5 mt-2">
                   <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                   <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: primaryColor }}>{s.topic}</span>
                 </div>
               </div>
               <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
            </div>
          ))}
        </div>
      )}

      {exploreSubTab === 'sponsors' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          {/* Platinum - Hero */}
          {MOCK_SPONSORS.filter(s => s.tier === 'Platinum' && s.is_active).map(s => (
            <div key={s.id} className="group relative p-8 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl" style={{ backgroundColor: surfaceColor, borderRadius: borderRadius * 1.5 }}>
              <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: primaryColor }} />
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                   <Award className="w-3.5 h-3.5" style={{ color: accentColor }} />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: accentColor }}>Platinum Partner</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-2xl shadow-inner">🏢</div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight" style={{ color: textPrimary }}>{s.name}</h3>
                    <p className="text-[10px] font-medium" style={{ color: textSecondary }}>{s.desc}</p>
                  </div>
                </div>
                <div className="w-full py-3.5 rounded-2xl text-center text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all mt-2 cursor-pointer" style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}>
                   Visit Partner
                </div>
              </div>
            </div>
          ))}

          {/* Gold - Grid */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1" style={{ color: textSecondary }}>Gold Partners</h4>
            <div className="grid grid-cols-2 gap-3">
              {MOCK_SPONSORS.filter(s => s.tier === 'Gold' && s.is_active).map(s => (
                <div key={s.id} className="p-5 rounded-2xl border border-white/5 text-center cursor-pointer hover:border-white/10 transition-all shadow-lg group" style={{ backgroundColor: surfaceColor, borderRadius: borderRadius }}>
                  <div className="w-12 h-12 bg-gray-800/30 rounded-full mx-auto mb-3 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🚀</div>
                  <h4 className="text-[11px] font-bold" style={{ color: textPrimary }}>{s.name}</h4>
                  <div className="flex items-center justify-center gap-1 mt-2">
                     <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                     <span className="text-[8px] font-black text-amber-500/80 uppercase tracking-widest leading-none">Gold</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Silver - Row */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1" style={{ color: textSecondary }}>Supporting Partners</h4>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
              {MOCK_SPONSORS.filter(s => s.tier === 'Silver' && s.is_active).map(s => (
                <div key={s.id} className="flex-shrink-0 px-5 py-3 rounded-xl border border-white/5 flex items-center gap-3" style={{ backgroundColor: surfaceColor, borderRadius: borderRadius * 0.8 }}>
                  <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-xs font-black" style={{ color: primaryColor }}>{s.name[0]}</div>
                  <span className="text-[11px] font-bold whitespace-nowrap" style={{ color: textSecondary }}>{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const TicketsScreen = () => (
    <div className="flex-1 overflow-y-auto px-5 pt-8 pb-24 flex flex-col items-center animate-in slide-in-from-bottom-4 duration-500">
      <div className="w-full text-center mb-8">
        <h2 className="text-3xl font-black mb-1" style={{ color: textPrimary }}>SECURE</h2>
        <h2 className="text-3xl font-black" style={{ color: primaryColor }}>ACCESS</h2>
      </div>

      <div className="w-full mb-8">
        <div className="rounded-[32px] p-6 border border-white/5" style={{ backgroundColor: surfaceColor, borderColor: `${primaryColor}30` }}>
           <div className="flex justify-between items-center mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                 <Ticket size={24} style={{ color: primaryColor }} />
              </div>
              <h3 className="text-2xl font-black" style={{ color: textPrimary }}>₹499</h3>
           </div>
           
           <h4 className="text-xl font-bold mb-2" style={{ color: textPrimary }}>Pro Pass</h4>
           <div className="text-xs mb-6 space-y-1" style={{ color: textSecondary }}>
             <p>• Full event access</p>
             <p>• VIP speaker louge</p>
             <p>• 2 Free meal coupons</p>
           </div>

           <div className="w-full h-14 rounded-2xl flex items-center justify-center font-black tracking-wider cursor-pointer active:scale-95 transition-transform" style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}>
              PAY VIA UPI
           </div>
        </div>
      </div>

      <div className="w-full mt-auto opacity-30 text-center py-4 border-t border-white/5">
         <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-white/10" style={{ color: textSecondary }}>End of List</span>
      </div>
    </div>
  );

  const ActivitiesScreen = () => (
    <div className="flex-1 overflow-y-auto px-5 pt-4 pb-24 scrollbar-hide animate-in slide-in-from-right-4 duration-300">
      <h2 className="text-xl font-bold mb-6" style={{ color: textPrimary }}>Activities</h2>
      
      {/* Mocking Music section as hardcoded data as requested */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: textPrimary }}>
            <Music className="w-4 h-4" style={{ color: primaryColor }} />
            Live Event Queue
          </h3>
          <div className="px-3 py-1 rounded-full text-[10px] font-bold" style={{ backgroundColor: `${primaryColor}10`, color: textSecondary }}>12 Ready</div>
        </div>
        <div className="rounded-2xl p-4 border border-white/5 shadow-xl" style={{ backgroundColor: surfaceColor, borderRadius: borderRadius }}>
          <div className="flex items-center gap-4 border-b border-white/5 pb-4 mb-4">
             <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center text-2xl shadow-inner">🎵</div>
             <div className="flex-1">
               <h4 className="text-sm font-bold" style={{ color: textPrimary }}>Midnight Galaxy</h4>
               <p className="text-[10px] mt-0.5" style={{ color: textSecondary }}>Playing Now • Stage Alpha</p>
             </div>
             <ChevronRight className="w-4 h-4 text-gray-600" />
          </div>
          <div className="w-full py-2 flex justify-center text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:opacity-80 transition-opacity" style={{ color: primaryColor }}>Place A Request</div>
        </div>
      </div>

      {modules.leaderboard && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: textPrimary }}>
              <Trophy className="w-4 h-4 text-yellow-500" />
              Event Leaderboard
            </h3>
            <span className="text-[10px] font-bold uppercase" style={{ color: primaryColor }}>View All</span>
          </div>
          <div className="space-y-2.5">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-3.5 rounded-xl border border-white/5 flex items-center gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors" style={{ backgroundColor: surfaceColor, borderRadius: borderRadius }}>
                <span className={`text-xs font-black italic w-6 text-center ${i===1 ? 'text-yellow-500 scale-125' : 'text-gray-500'}`}>{i}</span>
                <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center border border-white/5 shadow-lg">
                   {i === 1 ? '🥇' : i === 2 ? '🥈' : '🥉'}
                </div>
                <div className="flex-1">
                  <h4 className="text-[12px] font-bold tracking-tight" style={{ color: textPrimary }}>Team Apollo {i}</h4>
                  <p className="text-[9px] uppercase mt-0.5" style={{ color: textSecondary }}>IIT Bombay</p>
                </div>
                <div className="text-right">
                  <span className="text-[12px] font-black" style={{ color: textPrimary }}>{(4-i)*1250}</span>
                  <p className="text-[8px] font-bold uppercase tracking-tighter" style={{ color: textSecondary }}>pts</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const ProfileScreen = () => (
    <div className="flex-1 overflow-y-auto px-5 pt-10 pb-24 flex flex-col items-center animate-in zoom-in-95 duration-500">
       <div className="relative mb-6">
         <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-purple-600 via-blue-500 to-cyan-400 p-[3px] shadow-[0_0_30px_rgba(168,85,247,0.3)]">
            <div className="w-full h-full rounded-full border-[5px] border-[#0a0a0c] overflow-hidden bg-gray-900 flex items-center justify-center text-5xl">🙍‍♂️</div>
         </div>
         <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#34d399] rounded-full border-4 border-[#0a0a0c] flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
         </div>
       </div>
       
       <h2 className="text-2xl font-black tracking-tight" style={{ color: textPrimary }}>Dhruv Sharma</h2>
       <p className="text-xs mt-1.5 font-medium flex items-center gap-2" style={{ color: textSecondary }}>
         <Ticket className="w-3 h-3" style={{ color: primaryColor }} />
         Platinum Pass • #TF-2026-X
       </p>

       {/* QR Code Section */}
       <div className="mt-10 p-7 bg-white rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.4)] flex flex-col items-center gap-5 border-[10px] border-white/5 group cursor-pointer relative overflow-hidden">
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-44 h-44 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 p-2 shadow-inner">
             <QrCode className="w-full h-full text-[#121212]" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col items-center gap-1">
             <span className="text-[11px] font-black tracking-[0.3em] uppercase" style={{ color: '#121212' }}>Access Granted</span>
             <div className="w-16 h-1 rounded-full bg-gray-100 mt-1" />
          </div>
       </div>

       {/* Action List */}
       <div className="w-full mt-10 space-y-3">
          <div className="w-full p-4 rounded-2xl border border-white/5 flex items-center justify-between group cursor-pointer hover:bg-white/[0.04] transition-colors" style={{ backgroundColor: surfaceColor, borderRadius: borderRadius }}>
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
                   <Settings className="w-5 h-5" style={{ color: primaryColor }} />
                </div>
                <span className="text-sm font-bold" style={{ color: textPrimary }}>Settings</span>
             </div>
             <ChevronRight className="w-4 h-4" style={{ color: textSecondary }} />
          </div>
          <div className="w-full p-4 rounded-2xl border border-white/5 flex items-center justify-between group cursor-pointer hover:bg-red-500/5 transition-colors" style={{ backgroundColor: surfaceColor, borderRadius: borderRadius }}>
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                   <LogOut className="w-5 h-5 text-red-500/70" />
                </div>
                <span className="text-sm font-bold text-red-500/70">Sign Out</span>
             </div>
             <ChevronRight className="w-4 h-4" style={{ color: textSecondary }} />
          </div>
       </div>
    </div>
  );

  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center -mt-8">
      {/* Phone Hardware Mockup */}
      <div className="relative w-[340px] h-[740px] bg-black rounded-[45px] shadow-[0_0_50px_rgba(0,0,0,0.5)] border-[8px] border-[#1a1a1a] overflow-hidden flex flex-col">
        
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[25px] bg-[#1a1a1a] rounded-b-3xl z-50 shadow-inner flex items-center justify-center">
            <div className="w-12 h-1 rounded-full bg-black/50" />
        </div>

        {/* Screen Content */}
        <div 
          className={`flex-1 relative flex flex-col overflow-hidden transition-all duration-500 ${isUpdating ? 'blur-[2px] opacity-70 scale-[0.98]' : 'scale-100'}`}
          style={{ backgroundColor: bgColor, color: textPrimary, fontFamily: theme.font_family }}
        >
           
           {/* Internal Scrollable Area Container - Fixed height via flex-1 + overflow-hidden */}
           <div className="flex-1 relative flex flex-col overflow-hidden min-h-0">
             <style dangerouslySetInnerHTML={{ __html: `
               .scrollbar-hide::-webkit-scrollbar { display: none; }
               .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
             `}} />
             {/* Rendering active screen */}
             {activeTab === 'home' && <HomeScreen />}
             {activeTab === 'explore' && <ExploreScreen />}
             {activeTab === 'tickets' && <TicketsScreen />}
             {activeTab === 'activities' && <ActivitiesScreen />}
             {activeTab === 'profile' && <ProfileScreen />}
           </div>

           {/* Bottom Tab Bar */}
           <div className="absolute bottom-0 left-0 w-full h-[80px] backdrop-blur-xl border-t border-white/5 flex items-center justify-around pb-6 px-4 z-50" style={{ backgroundColor: `${surfaceColor}CC` }}>
             
             <button 
               onClick={() => setActiveTab('home')}
               className="flex flex-col items-center justify-center gap-1.5 w-14 group pt-2 transition-all outline-none"
             >
                <Home className="w-[22px] h-[22px] transition-all group-active:scale-75" style={{ color: activeTab === 'home' ? primaryColor : '#555', fill: activeTab === 'home' ? `${primaryColor}40` : 'transparent' }} />
                <span className="text-[10px] font-bold tracking-tight" style={{ color: activeTab === 'home' ? primaryColor : '#555' }}>Home</span>
             </button>
             
             <button 
               onClick={() => setActiveTab('explore')}
               className="flex flex-col items-center justify-center gap-1.5 w-14 group pt-2 transition-all outline-none"
             >
                <Compass className="w-[22px] h-[22px] transition-all group-active:scale-75" style={{ color: activeTab === 'explore' ? primaryColor : '#555', fill: activeTab === 'explore' ? `${primaryColor}40` : 'transparent' }} />
                <span className="text-[10px] font-bold tracking-tight" style={{ color: activeTab === 'explore' ? primaryColor : '#555' }}>Explore</span>
             </button>

             {modules.registration && (
               <button 
                 onClick={() => setActiveTab('tickets')}
                 className="flex flex-col items-center justify-center gap-1.5 w-14 group pt-2 transition-all outline-none"
               >
                  <Ticket className="w-[22px] h-[22px] transition-all group-active:scale-75" style={{ color: activeTab === 'tickets' ? primaryColor : '#555', fill: activeTab === 'tickets' ? `${primaryColor}40` : 'transparent' }} />
                  <span className="text-[10px] font-bold tracking-tight" style={{ color: activeTab === 'tickets' ? primaryColor : '#555' }}>Tickets</span>
               </button>
             )}

             <button 
               onClick={() => setActiveTab('activities')}
               className="flex flex-col items-center justify-center gap-1.5 w-14 group pt-2 transition-all outline-none"
             >
                <Activity className="w-[22px] h-[22px] transition-all group-active:scale-75" style={{ color: activeTab === 'activities' ? primaryColor : '#555', fill: activeTab === 'activities' ? `${primaryColor}40` : 'transparent' }} />
                <span className="text-[10px] font-bold tracking-tight" style={{ color: activeTab === 'activities' ? primaryColor : '#555' }}>Activities</span>
             </button>

             <button 
               onClick={() => setActiveTab('profile')}
               className="flex flex-col items-center justify-center gap-1.5 w-14 group pt-2 transition-all outline-none"
             >
                <User className="w-[22px] h-[22px] transition-all group-active:scale-75" style={{ color: activeTab === 'profile' ? primaryColor : '#555', fill: activeTab === 'profile' ? `${primaryColor}40` : 'transparent' }} />
                <span className="text-[10px] font-bold tracking-tight" style={{ color: activeTab === 'profile' ? primaryColor : '#555' }}>Profile</span>
             </button>
             
           </div>

           {/* Loading overlay logic */}
           {isUpdating && (
             <div className="absolute inset-0 bg-[#0a0a0c]/40 flex items-center justify-center backdrop-blur-sm z-50">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
