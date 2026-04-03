
"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight, Zap, Code, Smartphone, Globe, PenTool, Layout, Calendar, Share2, Layers, Download, BarChart2, Video, Lightbulb, Sparkles, Rocket, Users, CircleDollarSign, Store, Star, MapPin, ExternalLink, Heart } from "lucide-react";
import { MeteorShower, RedGlowPulse } from "@/components/ui/backgrounds";
import { ScrollReveal, FadeIn, SlideIn } from "@/components/ui/scroll-reveal";
import { LoginModal } from "@/components/auth/login-modal";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/supabase-client";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

    // Add auth state listener to keep user in sync
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleNavigation = (path, mode = 'login') => {
    if (user) {
      router.push(path);
    } else {
      setAuthMode(mode);
      setIsLoginOpen(true);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden text-white font-sans selection:bg-primary selection:text-white">
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} initialMode={authMode} />
      {/* Background Ambience - Global Grid/Stars handled in layout.js */}
      
      <MeteorShower />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
      </div>

      {/* 1. Sticky Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
              <Zap size={18} fill="currentColor" />
            </div>
            Ek Manch
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#web-builder" className="hover:text-white transition-colors">Website Builder</Link>
            <Link href="#app-builder" className="hover:text-white transition-colors">App Builder</Link>
            <Link href="#marketplace" className="hover:text-white transition-colors">Marketplace</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => { setAuthMode('login'); setIsLoginOpen(true); }} className="text-sm font-medium hover:text-primary transition-colors">Sign In</button>
            <button onClick={() => { setAuthMode('signup'); setIsLoginOpen(true); }} className="px-4 py-2 rounded-full bg-white text-black text-sm font-bold hover:bg-neutral-200 transition-all flex items-center gap-2">
              Get Started <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <header className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto text-center flex flex-col items-center">
        
        <FadeIn delay={0.2} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          The AI Operating System for Events
        </FadeIn>
        
        <FadeIn delay={0.4}>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            Plan, Promote & Run <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary text-glow">
                Any Event with AI
            </span>
            </h1>
        </FadeIn>
        
        <FadeIn delay={0.6}>
            <p className="text-lg md:text-xl text-text-secondary max-w-2xl mb-10 leading-relaxed">
            The all-in-one platform for creators, clubs & event organizers. Design websites, build native apps, generate social media content, and manage registrations — <span className="text-white font-semibold">no coding required.</span>
            </p>
        </FadeIn>
        
        <FadeIn delay={0.8} className="flex flex-col sm:flex-row items-center gap-4 mb-20">
          <button onClick={() => handleNavigation('/dashboard', 'signup')} className="px-8 py-4 rounded-full bg-gradient-to-r from-primary to-secondary font-bold text-lg hover:shadow-[0_0_30px_rgba(255,106,0,0.4)] transition-all flex items-center gap-2">
            <Zap size={20} fill="currentColor" /> Start Building Free
          </button>
          <Link href="#demo" className="px-8 py-4 rounded-full border border-white/20 bg-white/5 font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-sm">
            View Live Demo
          </Link>
        </FadeIn>

        {/* Hero Cards Animation */}
        <FadeIn delay={1.0} className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4 opacity-80 pointer-events-none select-none">
             {[
               { icon: Globe, title: "Website Builder", color: "text-blue-400" },
               { icon: Smartphone, title: "App Creator", color: "text-purple-400" },
               { icon: PenTool, title: "Poster Gen", color: "text-pink-400" },
               { icon: Video, title: "Video Gen", color: "text-green-400" }
             ].map((card, i) => (
               <div key={i} className={`glass-card p-5 flex items-center gap-4 animate-pulse-slow`} style={{ animationDelay: `${i * 200}ms` }}>
                 <card.icon size={24} className={card.color} />
                 <span className="font-bold text-base tracking-wide">{card.title}</span>
               </div>
             ))}
        </FadeIn>
      </header>

      {/* 3. Core Features Grid */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto">
        <ScrollReveal>
             <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Everything You Need to Run an Event</h2>
        </ScrollReveal>
        
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {[
            { icon: Lightbulb, title: "AI Ideation & Logic", desc: "Structure your event seamlessly with AI brainstorming for schedules, logistics, and themes." },
            { icon: PenTool, title: "AI Content & Posters", desc: "Generate catchy captions, promotional emails, and stunning visually appealing posters in seconds." },
            { icon: Rocket, title: "Website & App Builder", desc: "Publish professional event landing pages and native Android apps without writing a single line of code." },
            { icon: Video, title: "Promo Video Generator", desc: "Turn text prompts into high-energy promotional videos tailored for your social media channels." },
            { icon: Store, title: "Creator Marketplace", desc: "Discover and hire freelancers or grab templates, assets, and blueprints created by top organizers." },
            { icon: CircleDollarSign, title: "Ticketing & Commerce", desc: "Integrated registration forms, QR tickets, vendor stalls, and unified payment processing." }
          ].map((feature, i) => (
            <ScrollReveal key={i} delay={i * 0.1} className="h-full">
                <div className="glass-card p-8 group hover:bg-white/5 transition-all h-full flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                    <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-text-secondary leading-relaxed flex-1">{feature.desc}</p>
                </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* 4. Event Lifecycle */}
      <section className="py-20 bg-background-secondary/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
            <ScrollReveal>
                <h2 className="text-3xl font-bold mb-16">The Event Lifecycle, Automated</h2>
            </ScrollReveal>
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative">
                {/* Connecting Line */}
                <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 -translate-y-1/2" />
                
                {[
                    { step: "1", title: "Ideate", icon: Lightbulb, sub: "AI Brainstorming & Logic" },
                    { step: "2", title: "Generate", icon: Sparkles, sub: "AI Poster & Video" },
                    { step: "3", title: "Launch", icon: Rocket, sub: "Website & App Building" },
                    { step: "4", title: "Connect", icon: Users, sub: "Creator Marketplace" },
                    { step: "5", title: "Monetize", icon: CircleDollarSign, sub: "Ticketing & Commerce" },
                ].map((item, i) => (
                    <ScrollReveal key={i} delay={i * 0.2}>
                        <div className="relative z-10 flex flex-col items-center gap-4 bg-background px-4 py-2 group cursor-default">
                            <div className="w-16 h-16 rounded-full bg-neutral-900 border border-primary flex items-center justify-center text-primary font-bold text-2xl shadow-[0_0_20px_rgba(255,106,0,0.3)] group-hover:scale-110 group-hover:shadow-[0_0_35px_rgba(255,106,0,0.5)] transition-all duration-300">
                                <item.icon size={24} />
                            </div>
                            <div className="text-center">
                                <span className="font-bold text-lg block group-hover:text-primary transition-colors">{item.title}</span>
                                <span className="text-xs text-text-secondary mt-2 block w-[140px] leading-snug">{item.sub}</span>
                            </div>
                        </div>
                    </ScrollReveal>
                ))}
            </div>
        </div>
      </section>

      {/* 5. Website Builder Showcase */}
      <section id="web-builder" className="py-24 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
              <ScrollReveal>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider">
                    WebsiteBuilder AI
                </div>
                <h2 className="text-4xl md:text-5xl font-bold leading-tight mt-4">
                    Launch a Professional <br /> Event Website in Seconds.
                </h2>
                <p className="text-text-secondary text-lg mt-4">
                    Don't start from scratch. Our AI researches your event topic, generates a structured blueprint, and builds a fully responsive website instantly.
                </p>
                <ul className="space-y-4 mt-6">
                    {[
                        "Prompt-based generation (no drag-and-drop needed)",
                        "Live preview with click-to-edit content",
                        "Instant theme switching & dark mode",
                        "One-click deployment to public URL"
                    ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400"><Code size={14} /></div>
                            <span className="text-neutral-300">{item}</span>
                        </li>
                    ))}
                </ul>
                <button onClick={() => handleNavigation('/dashboard/website-builder')} className="inline-block mt-8 px-8 py-3 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors">
                    Try WebsiteBuilder
                </button>
              </ScrollReveal>
          </div>
          <div className="flex-1 relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full" />
              <SlideIn direction="right">
                <div className="glass-card p-2 relative z-10 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                    <div className="bg-[#0a0a0a] rounded-lg overflow-hidden border border-neutral-800 aspect-[16/10] flex flex-row relative shadow-2xl group text-left">
                        {/* Left Panel: Browser View */}
                        <div className="flex-[3] flex flex-col border-r border-neutral-800 bg-[#0d0d12]">
                            {/* Browser Header */}
                            <div className="h-5 bg-[#1a1a1a] flex items-center px-3 gap-2 border-b border-neutral-800">
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                </div>
                                <div className="mx-auto text-[7px] text-neutral-500 font-mono">ai-hackathon.vercel.app</div>
                                <div className="w-6"></div>
                            </div>

                            {/* Browser Content */}
                            <div className="flex-1 p-4 relative overflow-hidden flex flex-col pt-3">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#111122] to-[#050505] z-0" />
                                
                                <div className="relative z-10 flex justify-between items-center mb-6">
                                    <div className="font-bold text-white text-[9px] tracking-tight">AI HACKATHON</div>
                                    <div className="flex text-[6px] gap-2.5 text-neutral-400 font-bold tracking-wider hidden sm:flex">
                                        <span>ABOUT</span><span>SCHEDULE</span><span>SPEAKERS</span>
                                    </div>
                                    <div className="bg-pink-500 px-2 py-1 rounded text-[7px] font-bold text-white">GET TICKETS</div>
                                </div>

                                <div className="relative z-10 flex flex-col items-center justify-center flex-1 text-center mt-2">
                                    <h1 className="text-[28px] md:text-4xl font-black text-white tracking-tighter leading-[1.1] mb-3">UNLEASH YOUR<br />CREATIVITY</h1>
                                    <p className="text-[8px] md:text-[9px] text-neutral-300 max-w-[200px] md:max-w-[250px] mb-5 leading-relaxed">Join the ultimate AI Hackathon challenge where innovation meets collaboration.</p>
                                    <div className="flex gap-2">
                                        <div className="px-4 py-1.5 bg-pink-500 rounded text-[8px] font-bold text-white">REGISTER NOW</div>
                                        <div className="px-4 py-1.5 border border-white/20 rounded text-[8px] font-bold text-white">AGENDA</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Panel: AI Sidebar */}
                        <div className="flex-[1.2] bg-[#111111] flex flex-col pt-3 pb-2 px-3">
                            {/* Header */}
                            <div className="flex items-center gap-1.5 mb-4 text-white">
                                <div className="w-4 h-4 bg-orange-600 rounded flex items-center justify-center">
                                     <Sparkles size={8} />
                                </div>
                                <span className="font-bold text-[9px]">Edit with AI</span>
                            </div>

                            {/* Suggestion prompt */}
                            <div className="flex flex-col items-center text-center mb-4">
                                <div className="w-7 h-7 rounded-lg bg-orange-900/40 text-orange-500 flex items-center justify-center mb-2">
                                    <Sparkles size={10} />
                                </div>
                                <span className="text-[10px] font-bold text-white mb-1">What would you like to change?</span>
                                <span className="text-[6px] text-neutral-500 leading-tight">Describe any edit — text, colors, add/remove sections...</span>
                            </div>

                            {/* Quick Edits */}
                            <div className="flex-1 overflow-hidden flex flex-col gap-1.5">
                                <div className="text-[6px] font-bold text-neutral-600 uppercase tracking-widest mb-0.5">Quick Edits</div>
                                {[
                                    { icon: <Zap size={8} />, text: "Change color to purple" },
                                    { icon: <PenTool size={8} />, text: "Update hero title" },
                                    { icon: <Users size={8} />, text: "Add sponsors section" },
                                    { icon: <Globe size={8} />, text: "Remove gallery" },
                                ].map((edit, i) => (
                                    <div key={i} className="bg-white/5 border border-white/5 rounded p-1.5 text-[7px] text-neutral-300 flex items-center gap-2 hover:bg-white/10 cursor-pointer transition-colors">
                                        <span className="text-neutral-500">{edit.icon}</span>
                                        {edit.text}
                                    </div>
                                ))}
                            </div>

                            {/* Input box */}
                            <div className="mt-2 bg-white/5 border border-white/10 rounded p-1.5 flex items-center justify-between gap-2 group-hover:border-blue-500/50 transition-colors">
                                <div className="text-[7px] text-neutral-500 flex-1">Describe your edit...</div>
                                <ArrowRight size={8} className="text-neutral-500" />
                            </div>
                        </div>
                    </div>
                </div>
              </SlideIn>
          </div>
      </section>

      {/* 6. App Builder Showcase */}
      <section id="app-builder" className="py-24 px-6 max-w-7xl mx-auto flex flex-col md:flex-row-reverse items-center gap-16 bg-background-secondary/30 rounded-3xl border border-white/5 my-20">
          <div className="flex-1 space-y-8">
              <ScrollReveal>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-wider">
                    AppBuilder AI
                </div>
                <h2 className="text-4xl md:text-5xl font-bold leading-tight mt-4">
                    Build and Download <br /> Real Desktop/Mobile Apps.
                </h2>
                <p className="text-text-secondary text-lg mt-4">
                    Bridge the gap between web and mobile. Configure your app visually and let our cloud pipeline compile a real APK for you to download.
                </p>
                <ul className="space-y-4 mt-6">
                    {[
                        "Visual mobile simulator preview",
                        "Cloud-based APK compilation (GitHub Actions)",
                        "Native features: Notifications, Camera, Offline mode",
                        "Pre-built templates for Announcements & Schedules"
                    ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400"><Smartphone size={14} /></div>
                            <span className="text-neutral-300">{item}</span>
                        </li>
                    ))}
                </ul>
                <button onClick={() => handleNavigation('/dashboard/app-builder-v2')} className="inline-block mt-8 px-8 py-3 rounded-full bg-purple-600 text-white font-bold hover:bg-purple-500 transition-colors">
                    Try AppBuilder
                </button>
              </ScrollReveal>
          </div>
          <div className="flex-1 flex justify-center relative">
               <div className="absolute inset-0 bg-purple-500/20 blur-[80px] rounded-full" />
               <SlideIn direction="left">
                <div className="w-[300px] h-[600px] bg-black border-4 border-neutral-800 rounded-[3rem] shadow-2xl relative z-10 overflow-hidden ring-4 ring-neutral-900">
                        {/* Fake Phone UI */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-20" />
                        <div className="h-full w-full bg-[#0a0a0a] flex flex-col relative overflow-hidden">
                            {/* App Header */}
                            <div className="pt-12 px-5 flex justify-between items-center relative z-10">
                                <div>
                                    <h3 className="text-xl font-bold text-white tracking-tight">TechFest 2026</h3>
                                    <p className="text-neutral-400 text-[10px]">March 19-21, 2026</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.6)]">
                                    <Zap size={14} className="text-blue-400" fill="currentColor" />
                                </div>
                            </div>
                            
                            {/* App Body (Scrollable area) */}
                            <div className="flex-1 overflow-y-auto pb-20 px-4 mt-6 flex flex-col gap-4 relative z-10 no-scrollbar">
                                {/* Hero Card */}
                                <div className="rounded-2xl p-5 border border-white/10 relative overflow-hidden flex flex-col items-center text-center">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#1a153a] via-[#10192e] to-[#0d2121]" />
                                    <div className="absolute right-0 top-0 w-32 h-32 bg-[url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80')] opacity-20 bg-cover mix-blend-screen" />
                                    <div className="relative z-10">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/50 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold mb-3 shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                                            <span>✨</span> Day 1 Live
                                        </div>
                                        <h4 className="text-2xl font-bold text-white mb-2">Welcome to TechFest</h4>
                                        <p className="text-neutral-300 text-xs mb-5">Experience innovation & creativity</p>
                                        <div className="flex gap-2 justify-center w-full">
                                            <button className="flex-1 py-1.5 rounded-full bg-violet-600 border border-violet-500 text-white text-[10px] font-bold shadow-[0_4px_15px_rgba(124,58,237,0.4)]">Explore Events</button>
                                            <button className="flex-1 py-1.5 rounded-full border border-white/20 bg-white/5 text-white text-[10px] font-bold">View Schedule</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <div className="flex-[2] rounded-xl bg-gradient-to-r from-[#6b21a8] to-[#4c1d95] p-3 border border-[#8b5cf6]/30 flex flex-col justify-center shadow-[0_4px_20px_rgba(124,58,237,0.3)] min-h-[60px]">
                                        <div className="flex items-center gap-2 text-white">
                                            <Layers size={14} className="opacity-80" />
                                            <div>
                                                <div className="font-bold text-xs">Register Now</div>
                                                <div className="text-purple-200 text-[9px]">Limited Spots</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 rounded-xl bg-[#121212] border border-white/5 p-3 flex flex-col items-center justify-center gap-1 min-h-[60px]">
                                        <Globe size={14} className="text-teal-400" />
                                        <span className="text-white text-[9px] font-bold">Explore Stalls</span>
                                    </div>
                                </div>

                                <button className="w-full py-2.5 rounded-xl bg-[#121212] border border-white/5 text-white text-xs font-bold flex items-center justify-center gap-2">
                                    <Calendar size={12} className="text-teal-400" /> View Full Schedule
                                </button>

                                {/* Live Event Card */}
                                <div className="rounded-xl bg-[#121218] border border-purple-500/20 p-4 mt-1 relative overflow-hidden">
                                    <div className="absolute right-0 top-0 w-24 h-24 bg-purple-500/10 blur-[20px]" />
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 text-[9px] font-bold">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE
                                        </div>
                                        <span className="text-teal-400 text-[10px] font-bold">Now Happening</span>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h5 className="font-bold text-sm text-white mb-1 shadow-black drop-shadow-md">DJ Night @ Main Stage</h5>
                                            <p className="text-neutral-400 text-[9px] mb-2">by DJ Neon Pulse</p>
                                            <div className="text-purple-400 text-[9px] flex items-center gap-1"><Zap size={10} /> 8:00 PM - 11:00 PM</div>
                                            <div className="text-teal-400 text-[9px] flex items-center gap-1 mt-1"><Smartphone size={10} /> 120 people attending</div>
                                        </div>
                                        <button className="px-5 py-1.5 rounded-full bg-violet-600 text-white text-[10px] font-bold shadow-[0_0_15px_rgba(124,58,237,0.5)] mt-1">Join</button>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Nav */}
                            <div className="absolute bottom-0 left-0 right-0 h-[60px] bg-[#0a0a0a] border-t border-white/5 flex justify-around items-center px-2 z-20 pb-2">
                                <div className="flex flex-col items-center gap-1 text-purple-500 mt-1">
                                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                                        <div className="w-4 h-4 bg-purple-500 border border-purple-400 rounded-sm rounded-t-lg shadow-[0_0_10px_rgba(168,85,247,0.6)]" />
                                    </div>
                                    <span className="text-[9px] font-bold -mt-1">Home</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 text-neutral-500 hover:text-white transition-colors">
                                    <Globe size={18} />
                                    <span className="text-[9px]">Explore</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 text-neutral-500 hover:text-white transition-colors">
                                    <Layout size={18} />
                                    <span className="text-[9px]">Activities</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 text-neutral-500 hover:text-white transition-colors">
                                    <div className="w-4 h-4 border-2 border-current rounded-full mb-[2px]" />
                                    <span className="text-[9px]">Profile</span>
                                </div>
                            </div>
                        </div>
                </div>
               </SlideIn>
          </div>
      </section>

      {/* 7. Marketplace Creative Spotlight */}
      <section id="marketplace" className="py-24 px-6 max-w-7xl mx-auto relative overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

          <ScrollReveal>
              <div className="text-center mb-12 relative z-10">
                  <h2 className="text-xl md:text-2xl font-bold mb-4 text-white">
                      Community Marketplace
                  </h2>
              </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 w-full mx-auto group/grid">
                {[
                    { img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80", title: "Global Hackathon portal", type: "Website", handle: "@dev_alex", likes: "1.2k" },
                    { img: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=600&q=80", title: "Startup Pitch Deck", type: "Template", handle: "@design_lead", likes: "850" },
                    { img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80", title: "Club Registration App", type: "App", handle: "@campus_club", likes: "640" },
                    { img: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80", title: "Corporate Tech Fest", type: "Bundle", handle: "@tech_society", likes: "2.1k" },
                ].map((item, idx) => (
                    <ScrollReveal key={idx} delay={idx * 0.1} className="relative z-0 hover:z-20">
                        <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 flex flex-col transition-all duration-500 shadow-2xl relative cursor-pointer
                                        group-hover/grid:opacity-40 group-hover/grid:blur-[2px]
                                        hover:!opacity-100 hover:!blur-0 hover:scale-105 hover:-translate-y-2 hover:border-primary/50 hover:shadow-[0_20px_40px_rgba(255,106,0,0.15)] group h-full">
                            <div className="rounded-[10px] overflow-hidden aspect-[16/10] mb-5 relative bg-neutral-900 border border-white/5">
                                <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 opacity-90 group-hover:scale-110 group-hover:opacity-100" />
                            </div>
                            
                            <div className="flex items-center justify-between gap-2 mb-3">
                                <h4 className="text-white font-bold text-[13px] tracking-tight">{item.title}</h4>
                                <span className="px-2 py-[2px] bg-white/10 rounded-md text-[9px] text-neutral-300 font-medium">
                                    {item.type}
                                </span>
                            </div>
                            
                            <div className="flex items-center justify-between text-[11px] mb-1">
                                <span className="text-neutral-500 font-medium">{item.handle}</span>
                                <div className="flex items-center gap-1.5 text-neutral-400 font-medium">
                                    <svg className="w-[10px] h-[10px] text-red-500 fill-red-500 transition-transform group-hover:scale-125" viewBox="0 0 24 24">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                    </svg>
                                    {item.likes}
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                ))}
          </div>
      </section>

      {/* 8. Pricing Section */}
      <section id="pricing" className="py-20 px-6 max-w-7xl mx-auto">
        <ScrollReveal>
             <h2 className="text-3xl font-bold mb-12 text-center">Simple, Credit-Based Pricing</h2>
        </ScrollReveal>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <ScrollReveal delay={0.1}>
                <div className="glass-card p-8 flex flex-col h-full border-t-4 border-neutral-500 transform transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:border-white/50 group">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-white transition-colors">Free</h3>
                    <div className="text-4xl font-bold mb-1">$0<span className="text-lg font-normal text-text-secondary">/mo</span></div>
                    <div className="text-white font-bold mb-6">100 credits/mo</div>
                    <ul className="space-y-3 mb-8 flex-1 text-sm text-neutral-300">
                        <li>5 Web Generations</li>
                        <li>2 App Generations</li>
                        <li>Basic Templates access</li>
                    </ul>
                    <button onClick={() => handleNavigation('/dashboard', 'signup')} className="w-full py-3 rounded-lg bg-white/10 text-white font-bold hover:bg-white/20 transition-all">
                        Start for Free
                    </button>
                </div>
            </ScrollReveal>

            {/* Creator */}
            <ScrollReveal delay={0.2}>
                <div className="glass-card p-8 flex flex-col h-full border-t-4 border-primary relative transform md:-translate-y-4 transition-all duration-500 hover:scale-110 hover:shadow-[0_0_60px_rgba(255,106,0,0.4)] z-0 hover:z-10 hover:border-primary/80 group">
                    <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-[0_4px_20px_rgba(255,106,0,0.4)]">POPULAR</div>
                    <h3 className="text-xl font-bold mb-2 text-primary group-hover:text-white transition-colors">Creator</h3>
                    <div className="text-4xl font-bold mb-1">$15<span className="text-lg font-normal text-text-secondary">/mo</span></div>
                    <div className="text-white font-bold mb-6">1,000 credits/mo</div>
                    <ul className="space-y-3 mb-8 flex-1 text-sm text-neutral-300">
                        <li>50 Web Generations</li>
                        <li>25 App Generations</li>
                        <li>Premium Templates</li>
                        <li>No Cancellation Fees</li>
                    </ul>
                    <button onClick={() => handleNavigation('/dashboard', 'signup')} className="w-full py-3 rounded-lg btn-primary text-white font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,106,0,0.2)] hover:shadow-[0_0_40px_rgba(255,106,0,0.6)]">
                        Get Creator
                    </button>
                </div>
            </ScrollReveal>

            {/* Pro */}
            <ScrollReveal delay={0.3}>
                <div className="glass-card p-8 flex flex-col h-full border-t-4 border-primary transform transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,106,0,0.4)] hover:border-primary group">
                    <h3 className="text-xl font-bold mb-2 text-primary group-hover:text-white transition-colors">Pro</h3>
                    <div className="text-4xl font-bold mb-1">$40<span className="text-lg font-normal text-text-secondary">/mo</span></div>
                    <div className="text-white font-bold mb-6">5,000 credits/mo</div>
                    <ul className="space-y-3 mb-8 flex-1 text-sm text-neutral-300">
                        <li>Unlimited Potential</li>
                        <li>Custom Domains</li>
                        <li>White Label Apps</li>
                        <li>Priority Support</li>
                    </ul>
                    <button onClick={() => handleNavigation('/dashboard', 'signup')} className="w-full py-3 rounded-lg bg-white/10 text-white font-bold hover:bg-primary/20 transition-all hover:text-primary">
                        Go Pro
                    </button>
                </div>
            </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 bg-background-secondary">
          <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 text-sm">
              <div className="col-span-2">
                  <div className="flex items-center gap-2 font-bold text-lg mb-4">
                    <Zap size={18} className="text-primary" /> Ek Manch
                  </div>
                  <p className="text-text-secondary max-w-sm">
                      Note: This is a hackathon project. Not heavily tested for production use. Made with ❤️ by team <span className="text-primary font-bold">Alpha Hacks</span>.
                  </p>
              </div>
              <div>
                  <h5 className="font-bold mb-4">Platform</h5>
                  <ul className="space-y-2 text-text-secondary">
                      <li><a href="#" className="hover:text-white">Website Builder</a></li>
                      <li><a href="#" className="hover:text-white">App Builder</a></li>
                      <li><a href="#" className="hover:text-white">Marketplace</a></li>
                  </ul>
              </div>
              <div>
                  <h5 className="font-bold mb-4">Connect</h5>
                  <ul className="space-y-2 text-text-secondary">
                      <li><a href="https://github.com/kushdhruv/AMD_V5" target="_blank" rel="noopener noreferrer" className="hover:text-white">GitHub</a></li>
                      <li><a href="#" className="hover:text-white">Twitter</a></li>
                      <li><a href="#" className="hover:text-white">Discord</a></li>
                  </ul>
              </div>
          </div>
      </footer>

    </div>
  );
}
