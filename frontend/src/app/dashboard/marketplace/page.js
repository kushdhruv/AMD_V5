
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { 
  Search, MapPin, DollarSign, Github, Linkedin, Globe,
  Briefcase, ChevronDown, Users, UserPlus, ExternalLink, Star, Sparkles, Play, Image as ImageIcon, Smartphone, Plus,
  CheckCircle2, Award, Heart, MessageSquare
} from 'lucide-react';
import LikeButton from '@/components/marketplace/LikeButton';
import CommentSection from '@/components/marketplace/CommentSection';
import ChatDrawer from '@/components/marketplace/ChatDrawer';
import { DEMO_FREELANCERS } from '@/lib/mock-data';

const SKILL_OPTIONS = [
  "JavaScript", "Python", "React", "Node.js", "TypeScript",
  "FastAPI", "Machine Learning", "UI/UX", "DevOps", "Mobile Dev",
  "Next.js", "Flutter", "Rust", "Go", "AWS"
];

// Helper to get initials if no avatar
function getAvatarUrl(url, name) {
  if (url && url.startsWith("http")) return url;
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || "U")}`;
}

function SkillBadge({ skill }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-white/5 border border-white/10 text-text-secondary">
      {skill}
    </span>
  );
}

// ═══════════════════════════════════════
// Project card (shown side by side)
// ═══════════════════════════════════════
function ProjectCard({ project, freelancer }) {
  const techStack = (project.tech_stack || "").split(",").map(s => s.trim()).filter(Boolean);
  const hasLink = project.link && project.link !== "#";

  const Content = (
    <div className={`glass-card overflow-hidden group flex-shrink-0 w-72 transition-all h-[340px] flex flex-col ${hasLink ? 'hover:ring-2 hover:ring-primary/50 cursor-pointer shadow-lg shadow-primary/5' : 'hover:ring-1 hover:ring-primary/30'}`}>
      {/* Thumbnail */}
      {project.thumbnail_url ? (
        <div className="relative aspect-video overflow-hidden border-b border-white/5 shrink-0">
          <img
            src={project.thumbnail_url}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
          
          {hasLink && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100">
                <div className="bg-primary px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-2xl">
                    Open Site <ExternalLink size={14} />
                </div>
            </div>
          )}
          
          {hasLink && (
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur p-1.5 rounded-lg border border-white/10 group-hover:border-primary/50 transition-colors">
              <ExternalLink size={12} className="text-white" />
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center border-b border-white/5 shrink-0">
          <Briefcase size={28} className="text-white/10" />
        </div>
      )}

      {/* Content Area - FIXED HEIGHT */}
      <div className="p-4 flex-1 flex flex-col justify-between overflow-hidden bg-white/[0.01]">
        <div className="space-y-1.5">
          <h3 className="font-bold text-white text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2 h-10">
            {project.title}
          </h3>
          <div className="h-9">
            {project.description ? (
              <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed font-medium">
                {project.description}
              </p>
            ) : (
              <p className="text-[11px] text-neutral-700 italic font-medium">No description provided</p>
            )}
          </div>
        </div>

        {/* Tech Stack Pills - FIXED POSITION AT BOTTOM */}
        <div className="flex flex-wrap gap-1 mt-auto pt-3 border-t border-white/5">
          {techStack.length > 0 ? (
            <>
              {techStack.slice(0, 3).map(t => (
                <span key={t} className="px-1.5 py-0.5 rounded text-[9px] bg-white/5 text-text-secondary border border-white/10 group-hover:border-primary/20 group-hover:text-primary/80 transition-colors uppercase font-bold tracking-tighter">
                  {t}
                </span>
              ))}
              {techStack.length > 3 && (
                <span className="px-1.5 py-0.5 rounded text-[9px] text-neutral-600 font-bold">+{techStack.length - 3}</span>
              )}
            </>
          ) : (
            <span className="text-[9px] text-neutral-700 font-bold uppercase tracking-widest">Portfolio Item</span>
          )}
        </div>
      </div>
    </div>
  );

  if (hasLink) {
    return (
      <a href={project.link} target="_blank" rel="noopener noreferrer" className="block outline-none">
        {Content}
      </a>
    );
  }

  return Content;
}

// ═══════════════════════════════════════
// Per-freelancer section with projects
// ═══════════════════════════════════════
function FreelancerSection({ freelancer }) {
  const skills = (freelancer.skills || "").split(",").map(s => s.trim()).filter(Boolean);
  const avatar = getAvatarUrl(freelancer.profile_picture_url, freelancer.full_name);
  const projects = freelancer.portfolios || [];
  const creations = freelancer.ai_creations || [];
  const isAvailable = freelancer.availability === "actively_looking";
  const profileHref = `/dashboard/marketplace/${freelancer.id}`;

  return (
    <div className="space-y-4">
      {/* Freelancer header - NOW FULLY CLICKABLE */}
      <Link href={profileHref} className="block">
        <div className="glass-card p-5 relative overflow-hidden group hover:ring-2 hover:ring-primary/40 transition-all cursor-pointer">
            {freelancer.is_top_performer && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-primary/20 to-transparent px-4 py-1 flex items-center gap-1.5">
                    <Award size={12} className="text-primary" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Top Performer</span>
                </div>
            )}

            <div className="flex items-start gap-4">
                <img src={avatar} alt={freelancer.full_name}
                className="w-16 h-16 rounded-2xl border border-white/10 object-cover shrink-0 group-hover:scale-105 transition-transform" />
                
                <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-bold text-lg text-white group-hover:text-primary transition-colors flex items-center gap-2">
                            {freelancer.full_name}
                            {freelancer.is_verified && <CheckCircle2 size={16} className="text-blue-400 fill-blue-400/10" />}
                        </span>
                        
                        <div className="flex items-center gap-1 bg-yellow-400/10 px-2 py-0.5 rounded-lg">
                            <Star size={12} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-[11px] font-bold text-yellow-400">{freelancer.rating || "4.8"}</span>
                            <span className="text-[9px] text-yellow-400/60">({freelancer.review_count || "24"})</span>
                        </div>

                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        isAvailable ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-green-400' : 'bg-yellow-400'}`} />
                        {isAvailable ? 'Available' : 'On Break'}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-text-secondary flex-wrap">
                        {freelancer.location && <span className="flex items-center gap-1"><MapPin size={11} /> {freelancer.location}</span>}
                        <span className="flex items-center gap-1"><Briefcase size={11} /> {projects.length + creations.length} creations</span>
                    </div>

                    {freelancer.bio && (
                        <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed max-w-2xl">{freelancer.bio}</p>
                    )}

                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {skills.slice(0, 6).map(s => <SkillBadge key={s} skill={s} />)}
                        {skills.length > 6 && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-primary/10 text-primary">+{skills.length - 6}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </Link>

      {/* Unified Creativity Row */}
      {(projects.length > 0 || creations.length > 0) && (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pl-1">
          {/* AI Creations First */}
          {creations.map(c => (
            <div key={c.id} className="relative group/creation">
                <ProjectCard project={{
                    title: c.name || c.prompt,
                    description: c.prompt,
                    thumbnail_url: c.image_url || c.thumbnail_url,
                    link: c.live_url || c.video_url || c.image_url,
                    tech_stack: c.type || "AI Gen"
                }} freelancer={freelancer} />
                <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 pointer-events-none">
                    <Sparkles size={8} className="text-primary" />
                    <span className="text-[8px] font-bold text-white uppercase">{c.type || 'AI'}</span>
                </div>
                <div className="absolute top-2 right-2 flex gap-2">
                    <LikeButton entityId={c.id} entityType={c.type?.toLowerCase() === 'poster' || c.type?.toLowerCase() === 'image' ? 'image' : c.type?.toLowerCase() || 'image'} />
                </div>
            </div>
          ))}
          {/* Portfolio Projects */}
          {projects.map(p => (
            <div key={p.id} className="relative">
                <ProjectCard project={p} freelancer={freelancer} />
                <div className="absolute top-2 right-2">
                    <LikeButton entityId={p.id} entityType="portfolio" />
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MarketplacePage() {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [myProfileId, setMyProfileId] = useState(null);
  const [activeTab, setActiveTab] = useState("freelancers");
  const [isChatOpen, setIsChatOpen] = useState(false);

  const loadFreelancers = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('freelancers')
      .select('*, portfolios(*)')
      .order('created_at', { ascending: false });

    if (availabilityFilter) {
      query = query.eq('availability', availabilityFilter);
    }
    if (skillFilter) {
      query = query.ilike('skills', `%${skillFilter}%`);
    }
    if (searchQuery.trim()) {
      const term = `%${searchQuery.trim()}%`;
      query = query.or(`full_name.ilike.${term},bio.ilike.${term},skills.ilike.${term}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Marketplace fetch error:", error);
      setFreelancers([]);
    } else {
      // Fetch AI creations for each freelancer
      const usersWithCreations = await Promise.all((data || []).map(async (f) => {
        if (!f.user_id) return { ...f, ai_creations: [] };
        
        const [web, vid, img, app] = await Promise.all([
            supabase.from('projects').select('*').eq('user_id', f.user_id).eq('is_public', true),
            supabase.from('generated_videos').select('*').eq('user_id', f.user_id).eq('is_public', true),
            supabase.from('generated_images').select('*').eq('user_id', f.user_id).eq('is_public', true),
            supabase.from('app_builder_projects').select('*').eq('user_id', f.user_id).eq('is_public', true),
        ]);

        const creations = [
            ...(web.data || []).map(i => ({ ...i, type: 'Website' })),
            ...(vid.data || []).map(i => ({ ...i, type: 'Video' })),
            ...(img.data || []).map(i => ({ ...i, type: 'Poster' })),
            ...(app.data || []).map(i => ({ ...i, type: 'App' })),
        ];

        return { ...f, ai_creations: creations };
      }));

      setFreelancers(usersWithCreations);
    }
    setLoading(false);
  }, [searchQuery, skillFilter, availabilityFilter]);

  const loadGlobalCreations = useCallback(async () => {
    const [web, vid, img, app] = await Promise.all([
        supabase.from('projects').select('*, profiles:user_id(full_name, avatar_url)').eq('is_public', true).limit(4),
        supabase.from('generated_videos').select('*, profiles:user_id(full_name, avatar_url)').eq('is_public', true).limit(4),
        supabase.from('generated_images').select('*, profiles:user_id(full_name, avatar_url)').eq('is_public', true).limit(4),
        supabase.from('app_builder_projects').select('*, profiles:user_id(full_name, avatar_url)').eq('is_public', true).limit(4),
    ]);

    const merged = [
        ...(web.data || []).map(i => ({ ...i, type: 'Website', icon: Globe })),
        ...(vid.data || []).map(i => ({ ...i, type: 'Video', icon: Play })),
        ...(img.data || []).map(i => ({ ...i, type: 'Poster', icon: ImageIcon })),
        ...(app.data || []).map(i => ({ ...i, type: 'App', icon: Smartphone })),
    ].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));

    setGlobalCreations(merged);
  }, []);

  useEffect(() => { 
    loadFreelancers(); 
  }, [loadFreelancers]);

  // Check if user has a profile
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('freelancers').select('id').eq('user_id', user.id).maybeSingle();
        if (data) setMyProfileId(data.id);
      }
    })();
  }, []);

  // ═══ Merge real DB freelancers with demo data ═══
  const filteredDemos = DEMO_FREELANCERS.filter(d => {
    if (availabilityFilter && d.availability !== availabilityFilter) return false;
    if (skillFilter && !d.skills.toLowerCase().includes(skillFilter.toLowerCase())) return false;
    if (searchQuery.trim()) {
      const term = searchQuery.trim().toLowerCase();
      if (!d.full_name.toLowerCase().includes(term) &&
          !d.bio.toLowerCase().includes(term) &&
          !d.skills.toLowerCase().includes(term)) return false;
    }
    return true;
  });

  const allFreelancers = [...freelancers, ...filteredDemos];
  const totalProjects = allFreelancers.reduce((sum, f) => sum + (f.portfolios?.length ?? 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 p-4 md:p-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">
            Explore <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Marketplace</span>
          </h1>
          <p className="text-text-secondary text-sm">Discover top talent and amazing AI-generated creations</p>
        </div>
        <div className="flex items-center gap-3">
            <Link
            href="/dashboard/marketplace/my-profile"
            className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm transition border border-white/10"
            >
            <UserPlus size={16} />
            {myProfileId ? 'Edit Profile' : 'Join as Freelancer'}
            </Link>
        </div>
      </div>


      {/* Search & Filters */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, skills, or bio..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="appearance-none bg-white/5 border border-white/10 rounded-lg px-4 pr-8 py-2.5 text-sm text-white hover:bg-white/10 transition cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="" className="bg-neutral-900">All Skills</option>
              {SKILL_OPTIONS.map(s => (
                <option key={s} value={s} className="bg-neutral-900">{s}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" size={14} />
          </div>
          <div className="relative">
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="appearance-none bg-white/5 border border-white/10 rounded-lg px-4 pr-8 py-2.5 text-sm text-white hover:bg-white/10 transition cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="" className="bg-neutral-900">All Statuses</option>
              <option value="actively_looking" className="bg-neutral-900">Actively Looking</option>
              <option value="taking_break" className="bg-neutral-900">Taking a Break</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" size={14} />
          </div>
        </div>
      </div>

      {/* Stats bar */}
      {!loading && (
        <div className="flex items-center gap-6 text-xs text-text-secondary">
          <span className="flex items-center gap-1.5"><Users size={12} /> {allFreelancers.length} freelancer{allFreelancers.length !== 1 ? 's' : ''}</span>
          <span className="flex items-center gap-1.5"><Briefcase size={12} /> {totalProjects} project{totalProjects !== 1 ? 's' : ''}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-8">
          {[1,2,3].map(i => (
            <div key={i} className="space-y-4 animate-pulse">
              <div className="glass-card h-24 bg-white/[0.02]" />
              <div className="flex gap-4">
                <div className="glass-card w-72 h-48 bg-white/[0.02] shrink-0" />
                <div className="glass-card w-72 h-48 bg-white/[0.02] shrink-0" />
              </div>
            </div>
          ))}
        </div>
      ) : allFreelancers.length > 0 ? (
        <div className="space-y-10">
          {allFreelancers.map(f => (
            <FreelancerSection key={f.id} freelancer={f} />
          ))}
        </div>
      ) : (
        <div className="glass-card p-16 text-center text-text-secondary">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="font-bold text-white mb-2">No results found</h3>
          <p className="text-sm">Try adjusting your filters, or <Link href="/dashboard/marketplace/my-profile" className="text-primary hover:underline">be the first to join!</Link></p>
        </div>
      )}

      {/* Floating Chat Button */}
      <button 
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[100] group"
      >
        <MessageSquare size={24} className="group-hover:rotate-12 transition-transform" />
        <div className="absolute top-0 right-0 w-4 h-4 bg-blue-500 rounded-full border-2 border-neutral-900 animate-pulse" />
      </button>

      <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
