
"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight, Zap, Code, Smartphone, Globe, PenTool, Layout, Calendar, Share2, Layers, Download, BarChart2 } from "lucide-react";
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
            AI Event OS
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
            The all-in-one platform for students & clubs. Design websites, build native apps, generate social media content, and manage registrations — <span className="text-white font-semibold">no coding required.</span>
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
               { icon: Calendar, title: "Schedule", color: "text-green-400" }
             ].map((card, i) => (
               <div key={i} className={`glass-card p-4 flex items-center gap-3 animate-pulse-slow`} style={{ animationDelay: `${i * 200}ms` }}>
                 <card.icon size={20} className={card.color} />
                 <span className="font-bold text-sm tracking-wide">{card.title}</span>
               </div>
             ))}
        </FadeIn>
      </header>

      {/* 3. Core Features Grid */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto">
        <ScrollReveal>
             <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Everything You Need to Run an Event</h2>
        </ScrollReveal>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: PenTool, title: "AI Content & Posters", desc: "Generate catchy captions, promotional emails, and stunning posters in seconds." },
            { icon: Globe, title: "WebsiteBuilder", desc: "Create professional event landing pages with research-backed blueprints." },
            { icon: Smartphone, title: "AppBuilder", desc: "Build native Android apps for announcements and registrations without coding." },
            { icon: Layout, title: "Promo Video Generator", desc: "Turn text prompts into high-energy promotional videos for social media." },
            { icon: Download, title: "Registration System", desc: "Integrated forms, QR code ticketing, and attendee management dashboard." },
            { icon: BarChart2, title: "Feedback Analyzer", desc: "Collect post-event feedback and get AI-summarized sentiment reports." }
          ].map((feature, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
                <div className="glass-card p-8 group hover:bg-white/5 transition-all h-full">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                    <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-text-secondary leading-relaxed">{feature.desc}</p>
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
                    { step: "1", title: "Idea", icon: Zap },
                    { step: "2", title: "Promotion", icon: Share2 },
                    { step: "3", title: "Registration", icon: Download },
                    { step: "4", title: "Execution", icon: Calendar },
                    { step: "5", title: "Feedback", icon: BarChart2 },
                ].map((item, i) => (
                    <ScrollReveal key={i} delay={i * 0.2}>
                        <div className="relative z-10 flex flex-col items-center gap-4 bg-background px-4 py-2">
                            <div className="w-16 h-16 rounded-full bg-neutral-900 border border-primary flex items-center justify-center text-primary font-bold text-2xl shadow-[0_0_20px_rgba(255,106,0,0.3)]">
                                <item.icon size={24} />
                            </div>
                            <span className="font-bold text-lg">{item.title}</span>
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
                <div className="glass-card p-2 relative z-10 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                    <div className="bg-neutral-900 rounded-lg overflow-hidden border border-neutral-800 aspect-video flex items-center justify-center">
                            <div className="text-center">
                                <Globe size={48} className="mx-auto text-blue-500 mb-4" />
                                <p className="text-neutral-400 font-mono text-sm">Generating Website Blueprint...</p>
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
                        <div className="h-full w-full bg-neutral-900 flex flex-col relative grid-bg">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-black/80" />
                            <div className="mt-16 px-6 relative z-10">
                                <h3 className="text-2xl font-bold text-white mb-2">Hackathon 2024</h3>
                                <div className="bg-purple-500/20 p-4 rounded-xl border border-purple-500/30 mb-4">
                                    <p className="text-purple-200 text-sm font-bold">📢 Update</p>
                                    <p className="text-purple-100 text-xs">Lunch is served in the main hall!</p>
                                </div>
                            </div>
                        </div>
                </div>
               </SlideIn>
          </div>
      </section>

      {/* 7. Marketplace Preview */}
      <section id="marketplace" className="py-20 px-6 max-w-7xl mx-auto text-center">
         <ScrollReveal>
             <h2 className="text-3xl font-bold mb-12">Community Marketplace</h2>
         </ScrollReveal>
         <div className="grid md:grid-cols-4 gap-6">
             {[
                 { title: "Hackathon Starter", type: "Website", author: "@dev_alex", likes: "1.2k", img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80" },
                 { title: "Club Registration", type: "App", author: "@campus_club", likes: "850", img: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=600&q=80" },
                 { title: "Tech Fest 2024", type: "Bundle", author: "@tech_society", likes: "2.3k", img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80" },
                 { title: "Workshop Certs", type: "Utility", author: "@design_lead", likes: "500", img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80" },
             ].map((item, i) => (
                 <ScrollReveal key={i} delay={i * 0.1}>
                    <div className="glass-card p-6 text-left group cursor-pointer h-full">
                        <div className="h-32 rounded-lg mb-4 overflow-hidden">
                            <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold">{item.title}</h4>
                            <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-neutral-400">{item.type}</span>
                        </div>
                        <div className="flex justify-between text-xs text-neutral-500">
                            <span>{item.author}</span>
                            <span>❤️ {item.likes}</span>
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
                    <Zap size={18} className="text-primary" /> AI Event OS
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
