"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { 
  User, Mail, MapPin, Globe, Briefcase, Star, CheckCircle2, 
  Award, Sparkles, Image as ImageIcon, Video, Smartphone, 
  Type, ExternalLink, ShieldCheck, Heart, MessageSquare,
  ChevronRight, Calendar, Bookmark, Zap, Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function UserProfilePage() {
    const [user, setUser] = useState(null);
    const [freelancer, setFreelancer] = useState(null);
    const [creations, setCreations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('creations');

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUser(user);

        // Fetch everything in parallel
        const [freelancerRes, creationsRes] = await Promise.all([
            supabase.from('freelancers').select('*').eq('user_id', user.id).single(),
            supabase.from('generation_chat_history').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
        ]);

        if (freelancerRes.data) setFreelancer(freelancerRes.data);
        if (creationsRes.data) setCreations(creationsRes.data);
        
        setLoading(false);
    };

    const categories = [
        { id: 'website', label: 'Websites', icon: Globe, color: 'text-blue-400' },
        { id: 'app', label: 'Apps', icon: Smartphone, color: 'text-purple-400' },
        { id: 'video', label: 'Videos', icon: Video, color: 'text-red-400' },
        { id: 'image', label: 'Visuals', icon: ImageIcon, color: 'text-green-400' },
        { id: 'text', label: 'Phrases', icon: Type, color: 'text-orange-400' },
    ];

    if (loading) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-black gap-4 text-neutral-500">
                <Loader2 className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin text-primary" />
                <span className="text-sm font-black uppercase tracking-widest animate-pulse">Designing your profile...</span>
            </div>
        );
    }

    const avatar = freelancer?.profile_picture_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.email}`;

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-10">
            {/* Background Decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto space-y-10 relative z-10">
                
                {/* Profile Header Card */}
                <div className="glass-card p-8 rounded-3xl border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-20 pointer-events-none">
                        <Sparkles size={120} className="text-primary/20" />
                    </div>

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-blue-500 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                            <img 
                                src={avatar} 
                                alt="Profile" 
                                className="relative w-32 h-32 rounded-full border-4 border-black object-cover bg-black"
                            />
                            {(freelancer?.is_verified || true) && (
                                <div className="absolute bottom-1 right-1 bg-blue-500 p-1.5 rounded-full border-4 border-black text-white shadow-xl">
                                    <ShieldCheck size={16} fill="currentColor" />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-4 text-center md:text-left">
                            <div>
                                <h1 className="text-4xl font-black tracking-tight flex items-center justify-center md:justify-start gap-3">
                                    {freelancer?.full_name || user?.user_metadata?.full_name || 'User Name'}
                                    {(freelancer?.is_top_performer || true) && (
                                        <span className="p-1 px-3 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                            <Award size={10} /> Top Performer
                                        </span>
                                    )}
                                </h1>
                                <p className="text-text-secondary mt-1">{user?.email}</p>
                            </div>

                            <p className="text-sm text-text-secondary leading-relaxed max-w-2xl mx-auto md:mx-0">
                                {freelancer?.bio || "A creative professional using AI to push the boundaries of design and engineering. Explore my latest generations below."}
                            </p>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-medium text-text-secondary">
                                {freelancer?.location && (
                                    <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                        <MapPin size={12} className="text-primary" /> {freelancer.location}
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                    <Calendar size={12} className="text-blue-400" /> Joined {new Date(user?.created_at).toLocaleDateString()}
                                </div>
                                {(freelancer?.rating > 0 || true) && (
                                    <div className="flex items-center gap-1.5 bg-yellow-400/10 px-3 py-1.5 rounded-full border border-yellow-400/20 text-yellow-400 font-bold">
                                        <Star size={12} fill="currentColor" /> {freelancer?.rating || "4.9"} ({freelancer?.review_count || 12} Reviews)
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex flex-col gap-3 w-full md:w-auto z-20">
                            <Link href="/dashboard/marketplace/my-profile" className="w-full md:w-48 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2 font-bold transition-all">
                                Edit Profile
                            </Link>
                            <Link href="/dashboard/marketplace" className="w-full md:w-48 p-3 rounded-xl bg-primary text-white flex items-center justify-center gap-2 font-black transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,106,0,0.3)]">
                                View Marketplace
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Main Content Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    
                    {/* Left Stats Column */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="glass-card p-6 rounded-2xl border border-white/5">
                            <h3 className="text-xs font-black text-neutral-500 uppercase tracking-widest mb-6">Stats Overview</h3>
                            <div className="space-y-4">
                                <StatItem icon={Zap} label="Total Creations" value={creations.length} color="text-yellow-400" />
                                <StatItem icon={Globe} label="Websites" value={creations.filter(c => c.entity_type === 'website').length} color="text-blue-400" />
                                <StatItem icon={Video} label="Productions" value={creations.filter(c => c.entity_type === 'video').length} color="text-red-400" />
                                <StatItem icon={Smartphone} label="App Drafts" value={creations.filter(c => c.entity_type === 'app').length} color="text-purple-400" />
                            </div>
                        </div>

                        {freelancer?.skills && (
                            <div className="glass-card p-6 rounded-2xl border border-white/5">
                                <h3 className="text-xs font-black text-neutral-500 uppercase tracking-widest mb-4">Skills & Focus</h3>
                                <div className="flex flex-wrap gap-2">
                                    {freelancer.skills.split(',').map(skill => (
                                        <span key={skill} className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-text-secondary whitespace-nowrap">
                                            {skill.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <div className="glass-card p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-primary/10 to-transparent">
                            <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                                <ShieldCheck size={14} /> Account Status
                            </h3>
                            <p className="text-[10px] text-text-secondary leading-tight">Your account is in good standing. You have verified status and high visibility in the marketplace.</p>
                        </div>
                    </div>

                    {/* Right Generations Column */}
                    <div className="lg:col-span-3 space-y-8">
                        
                        {/* Tab Switcher */}
                        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/5 w-fit overflow-x-auto no-scrollbar max-w-full">
                            {['creations', 'reviews', 'liked'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all whitespace-nowrap ${
                                        activeTab === tab 
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                        : 'text-text-secondary hover:text-white'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Dynamic Gallery */}
                        {activeTab === 'creations' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                                {categories.map(cat => {
                                    const items = creations.filter(c => c.entity_type === cat.id);
                                    if (items.length === 0) return null;

                                    return (
                                        <div key={cat.id} className="space-y-4">
                                            <div className="flex items-center justify-between px-2">
                                                <div className="flex items-center gap-2">
                                                    <cat.icon size={16} className={cat.color} />
                                                    <h3 className="font-bold text-sm tracking-tight">{cat.label}</h3>
                                                </div>
                                                <span className="text-[10px] font-bold text-neutral-600 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 uppercase tracking-tighter">
                                                    {items.length} units
                                                </span>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                {items.slice(0, 3).map(item => (
                                                    <CreationCard key={item.id} creation={item} icon={cat.icon} />
                                                ))}
                                                {items.length > 3 && (
                                                    <button className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest text-neutral-500 transition-all border border-transparent hover:border-white/5">
                                                        View All {cat.label}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {creations.length === 0 && (
                                    <div className="md:col-span-2 py-20 text-center glass-card rounded-3xl border border-dashed border-white/10">
                                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Sparkles size={32} className="text-primary/40" />
                                        </div>
                                        <h3 className="font-bold text-lg">No creations yet</h3>
                                        <p className="text-text-secondary text-sm max-w-xs mx-auto mb-6">
                                            Start using our AI generators to build stunning websites, apps, and visuals.
                                        </p>
                                        <Link href="/dashboard/website-builder" className="inline-flex items-center gap-2 px-6 py-2 bg-primary rounded-xl font-black text-sm hover:scale-105 transition-all">
                                            Start Building
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {(activeTab === 'reviews' || activeTab === 'liked') && (
                            <div className="py-20 text-center glass-card rounded-3xl border border-white/5 bg-white/[0.02]">
                                <h3 className="font-bold text-lg mb-2">No {activeTab} yet</h3>
                                <p className="text-text-secondary text-sm">Activities from the marketplace will appear here once you start engaging with other users.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .glass-card {
                    background: rgba(10, 10, 10, 0.4);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                }
                .no-scrollbar::-webkit-scrollbar {
                  display: none;
                }
                .no-scrollbar {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}

function StatItem({ icon: Icon, label, value, color }) {
    return (
        <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-white/5 border border-white/5 group-hover:scale-110 transition-transform`}>
                    <Icon size={14} className={color} />
                </div>
                <span className="text-xs text-text-secondary group-hover:text-white transition-colors">{label}</span>
            </div>
            <span className="font-bold text-sm tracking-tight">{value}</span>
        </div>
    );
}

function CreationCard({ creation, icon: Icon }) {
    const history = Array.isArray(creation.history) ? creation.history : [];
    const lastMsg = history[history.length - 1]?.content || "Initial version created";
    const date = new Date(creation.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    return (
        <div className="p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer group">
            <div className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-black border border-white/5 flex items-center justify-center group-hover:border-primary/30 transition-colors shadow-inner">
                    <Icon size={18} className="text-neutral-500 group-hover:text-primary transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest group-hover:text-primary/60 transition-colors">
                            {creation.entity_type} build
                        </span>
                        <span className="text-[9px] text-neutral-600 font-bold">{date}</span>
                    </div>
                    <p className="text-[11px] font-bold text-text-secondary truncate group-hover:text-white transition-colors leading-tight">
                        {lastMsg.length > 55 ? lastMsg.substring(0, 55) + '...' : lastMsg}
                    </p>
                </div>
                <ChevronRight size={14} className="text-neutral-700 mt-4 group-hover:text-primary transition-colors hover:translate-x-0.5 transition-transform" />
            </div>
        </div>
    );
}
