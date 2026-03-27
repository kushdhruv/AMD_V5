"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { 
  MapPin, DollarSign, Briefcase, Github, Linkedin, Globe, 
  ExternalLink, CheckCircle2, Award, Star, Sparkles, MessageSquare, 
  Heart, Send, Loader2, Play, Image as ImageIcon, Smartphone, ChevronLeft, UserPlus, Users
} from 'lucide-react';
import Link from 'next/link';
import LikeButton from '@/components/marketplace/LikeButton';
import CommentSection from '@/components/marketplace/CommentSection';
import { sendConnectionRequest, fetchGitHubProjects } from '@/lib/supabase/marketplace-v2';
import { DEMO_FREELANCERS } from '@/lib/mock-data';

export default function UserProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const [freelancer, setFreelancer] = useState(null);
    const [creations, setCreations] = useState([]);
    const [githubProjects, setGithubProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);
    const [connectStatus, setConnectStatus] = useState(null);
    const [activeSection, setActiveSection] = useState('creativity'); // portfolio | creativity | github | reviews

    useEffect(() => {
        async function loadProfile() {
            setLoading(true);
            try {
                // Check if it's a demo profile
                if (id && id.toString().startsWith('demo-')) {
                    const demo = DEMO_FREELANCERS.find(f => f.id === id);
                    if (demo) {
                        setFreelancer(demo);
                        setCreations(demo.ai_creations.map(c => ({
                            ...c,
                            icon: c.type === 'Website' ? Globe : c.type === 'Video' ? Play : c.type === 'App' ? Smartphone : ImageIcon
                        })));
                        setGithubProjects(demo.github_projects || []);
                        setLoading(false);
                        return;
                    }
                }

                const { data: profile, error } = await supabase
                    .from('freelancers')
                    .select('*, portfolios(*)')
                    .eq('id', id)
                    .single();
                
                if (error) throw error;
                setFreelancer(profile);

                // Fetch AI creations
                const [web, vid, img, app] = await Promise.all([
                    supabase.from('projects').select('*').eq('user_id', profile.user_id).eq('is_public', true),
                    supabase.from('generated_videos').select('*').eq('user_id', profile.user_id).eq('is_public', true),
                    supabase.from('generated_images').select('*').eq('user_id', profile.user_id).eq('is_public', true),
                    supabase.from('app_builder_projects').select('*').eq('user_id', profile.user_id).eq('is_public', true),
                ]);

                setCreations([
                    ...(web.data || []).map(i => ({ ...i, type: 'Website', icon: Globe })),
                    ...(vid.data || []).map(i => ({ ...i, type: 'Video', icon: Play })),
                    ...(img.data || []).map(i => ({ ...i, type: 'Image', icon: ImageIcon })),
                    ...(app.data || []).map(i => ({ ...i, type: 'App', icon: Smartphone })),
                ].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));

                // Fetch GitHub projects
                const { data: gh } = await fetchGitHubProjects(profile.id);
                setGithubProjects(gh || []);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        if (id) loadProfile();
    }, [id]);

    const handleConnect = async () => {
        setConnecting(true);
        try {
            await sendConnectionRequest(freelancer.user_id, "Hi, I'd like to reach out about your work.");
            setConnectStatus("Request Sent");
        } catch (err) {
            alert(err.message);
        } finally {
            setConnecting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-neutral-500 animate-pulse">Loading amazing profile...</div>;

    if (!freelancer) return <div className="min-h-screen flex items-center justify-center text-white">Profile not found.</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 p-4 md:p-8">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-text-secondary hover:text-white transition group mb-4">
                <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Marketplace
            </button>

            {/* Header Section */}
            <div className="glass-card p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32" />
                
                <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                    <div className="relative">
                        <img 
                            src={freelancer.profile_picture_url || `https://api.dicebear.com/7.x/initials/svg?seed=${freelancer.full_name}`} 
                            className="w-32 h-32 rounded-3xl border-2 border-white/10 object-cover shadow-2xl"
                        />
                        {freelancer.is_verified && (
                            <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-1.5 border-4 border-neutral-900 shadow-xl">
                                <CheckCircle2 size={16} className="text-white" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-4xl font-black text-white flex items-center gap-3">
                                    {freelancer.full_name}
                                    {freelancer.is_top_performer && (
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            <Award size={12} /> Top Performer
                                        </span>
                                    )}
                                </h1>
                                <div className="flex items-center gap-4 mt-2 text-text-secondary font-medium">
                                    <span className="flex items-center gap-1.5 text-yellow-400">
                                        <Star size={16} fill="currentColor" /> {freelancer.rating || "4.8"} (23 reviews)
                                    </span>
                                    <span className="flex items-center gap-1.5"><MapPin size={16} /> {freelancer.location}</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={handleConnect}
                                    disabled={connecting || connectStatus}
                                    className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl transition shadow-lg shadow-primary/20 disabled:opacity-50"
                                >
                                    {connecting ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                                    {connectStatus || "Connect to Chat"}
                                </button>
                                <div className="flex gap-2">
                                    {freelancer.github_url && <a href={freelancer.github_url} className="p-3 glass-card hover:bg-white/10 text-white transition"><Github size={20} /></a>}
                                    {freelancer.linkedin_url && <a href={freelancer.linkedin_url} className="p-3 glass-card hover:bg-white/10 text-white transition"><Linkedin size={20} /></a>}
                                </div>
                            </div>
                        </div>

                        <p className="text-text-secondary text-lg leading-relaxed max-w-3xl font-medium">
                            {freelancer.bio}
                        </p>

                        <div className="flex flex-wrap gap-2 pt-2">
                            {(freelancer.skills || "").split(',').map(s => (
                                <span key={s} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-text-secondary">
                                    {s.trim()}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-8 border-b border-white/5 overflow-x-auto">
                {[
                    { id: 'creativity', label: 'AI Creativity', icon: Sparkles },
                    { id: 'portfolio', label: 'Classic Portfolio', icon: Briefcase },
                    { id: 'github', label: 'GitHub Projects', icon: Github },
                    { id: 'reviews', label: 'Trust & Reviews', icon: Star },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSection(tab.id)}
                        className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all relative ${activeSection === tab.id ? 'text-primary' : 'text-neutral-500 hover:text-white'}`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                        {tab.id === 'creativity' && <span className="ml-1 px-1.5 py-0.5 rounded bg-primary/10 text-[10px]">{creations.length}</span>}
                        {activeSection === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full shadow-[0_-4px_10px_rgba(255,107,0,0.5)]" />}
                    </button>
                ))}
            </div>

            {/* Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {activeSection === 'creativity' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {creations.map(creation => (
                                <CreationTile key={creation.id} creation={creation} />
                            ))}
                            {creations.length === 0 && <EmptyState label="No public AI creations yet" />}
                        </div>
                    )}

                    {activeSection === 'portfolio' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(freelancer.portfolios || []).map(p => (
                                <PortfolioTile key={p.id} project={p} />
                            ))}
                            {(freelancer.portfolios || []).length === 0 && <EmptyState label="No classic portfolio items yet" />}
                        </div>
                    )}

                    {activeSection === 'github' && (
                        <div className="space-y-4">
                            {githubProjects.map(repo => (
                                <div key={repo.id} className="glass-card p-6 flex flex-col md:flex-row justify-between items-start gap-4 hover:bg-white/5 transition group">
                                    <div>
                                        <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{repo.repo_name}</h3>
                                        <p className="text-xs text-text-secondary mt-1 max-w-xl">{repo.description}</p>
                                        <div className="flex items-center gap-3 mt-4">
                                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-yellow-400">
                                                <Star size={12} fill="currentColor" /> {repo.stars} stars
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-neutral-700" />
                                            <span className="text-[10px] text-neutral-500 uppercase tracking-tighter">Updated {new Date(repo.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <a href={repo.repo_url} target="_blank" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 border border-white/10 text-xs font-bold text-white hover:bg-neutral-800 transition">
                                        View Code <ExternalLink size={14} />
                                    </a>
                                </div>
                            ))}
                            {githubProjects.length === 0 && <EmptyState label="No GitHub projects listed" />}
                        </div>
                    )}

                    {activeSection === 'reviews' && (
                        <div className="space-y-6">
                            {(freelancer.reviews || []).map(review => (
                                <div key={review.id} className="glass-card p-6 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <img src={review.client_avatar} alt={review.client_name} className="w-10 h-10 rounded-full border border-white/10" />
                                            <div>
                                                <h4 className="font-bold text-white text-sm">{review.client_name}</h4>
                                                <p className="text-[10px] text-text-secondary">{review.role}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 bg-yellow-400/10 px-2 py-0.5 rounded-lg">
                                            <Star size={10} className="text-yellow-400 fill-yellow-400" />
                                            <span className="text-[10px] font-bold text-yellow-400">{review.rating.toFixed(1)}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-text-secondary leading-relaxed italic">"{review.content}"</p>
                                    <p className="text-[9px] text-neutral-600 uppercase tracking-widest">{new Date(review.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                            ))}
                            {(freelancer.reviews || []).length === 0 && (
                                <div className="glass-card p-12 text-center text-neutral-600">
                                    <p className="italic text-lg">"Authentic reviews from verified clients will appear here."</p>
                                    <p className="text-xs mt-4">Average Rating: {freelancer.rating || "4.8"} / 5.0 ({freelancer.review_count || "0"} total reviews)</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <div className="glass-card p-6 space-y-6">
                        <h3 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/5 pb-4">Social Presence</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-text-secondary flex items-center gap-2"><Heart size={14} /> Likes</span>
                                <span className="font-black text-white">{freelancer.is_demo ? "1,240+" : "0"}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-text-secondary flex items-center gap-2"><MessageSquare size={14} /> Comments</span>
                                <span className="font-black text-white">{freelancer.is_demo ? "422" : "0"}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-text-secondary flex items-center gap-2"><Users size={14} /> Connections</span>
                                <span className="font-black text-white">{freelancer.is_demo ? freelancer.review_count * 3 : "0"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                        <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4">Availability</h3>
                        <div className={`p-4 rounded-xl font-bold text-center ${freelancer.availability === 'actively_looking' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-neutral-500/10 text-neutral-500'}`}>
                            {freelancer.availability === 'actively_looking' ? 'Ready for New Projects' : 'Currently Unavailable'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CreationTile({ creation }) {
    const [showComments, setShowComments] = useState(false);
    const hasLink = creation.live_url || creation.video_url || creation.image_url;

    const Content = (
        <div className={`glass-card group flex flex-col overflow-hidden transition-all h-[340px] ${hasLink ? 'hover:ring-2 hover:ring-primary/50 cursor-pointer shadow-lg shadow-primary/5' : 'border-white/5 hover:border-primary/30'}`}>
            <div className="aspect-video bg-neutral-900 relative overflow-hidden border-b border-white/5 shrink-0">
                {(creation.image_url || creation.thumbnail_url) ? (
                    <img src={creation.image_url || creation.thumbnail_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-800">
                        <creation.icon size={40} className="text-neutral-700" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                
                {hasLink && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100">
                        <div className="bg-primary px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-2xl">
                            Explore {creation.type === 'Website' ? 'Site' : creation.type} <ExternalLink size={12} />
                        </div>
                    </div>
                )}

                <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                    <creation.icon size={10} className="text-primary" />
                    <span className="text-[9px] font-bold text-white uppercase tracking-wider">{creation.type}</span>
                </div>
                <div className="absolute top-2 right-2 flex gap-2">
                    <LikeButton entityId={creation.id} entityType={creation.type.toLowerCase() === 'website' ? 'project' : creation.type.toLowerCase()} />
                </div>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between bg-white/[0.01] overflow-hidden">
                <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-white line-clamp-2 h-10 mb-1 group-hover:text-primary transition-colors">{creation.name || creation.prompt}</h3>
                    <div className="h-9">
                        <p className="text-[10px] text-text-secondary line-clamp-2 leading-relaxed font-medium">{creation.prompt || "AI Generated Creation"}</p>
                    </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
                    <button 
                        onClick={(e) => {
                            if (hasLink) e.preventDefault();
                            setShowComments(!showComments);
                        }} 
                        className="text-[10px] text-neutral-500 font-bold hover:text-white transition uppercase relative z-10"
                    >
                        {showComments ? "Hide Comments" : "Write Comment"}
                    </button>
                    {hasLink && (
                        <div className="text-primary group-hover:text-white transition flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">
                            {creation.type === 'Website' ? 'Open Site' : 'View'} <ExternalLink size={10} />
                        </div>
                    )}
                </div>

                {showComments && (
                    <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                        <CommentSection entityId={creation.id} entityType={creation.type.toLowerCase() === 'website' ? 'project' : creation.type.toLowerCase()} />
                    </div>
                )}
            </div>
        </div>
    );

    if (hasLink) {
        return (
            <a href={hasLink} target="_blank" rel="noopener noreferrer" className="block outline-none">
                {Content}
            </a>
        );
    }

    return Content;
}

function PortfolioTile({ project }) {
    const [showComments, setShowComments] = useState(false);
    const hasLink = project.link && project.link !== "#";

    const Content = (
        <div className={`glass-card group flex flex-col overflow-hidden transition-all h-[340px] ${hasLink ? 'hover:ring-2 hover:ring-blue-500/50 cursor-pointer shadow-lg shadow-blue-500/5' : 'hover:ring-1 hover:ring-blue-500/30'}`}>
            <div className="aspect-video relative overflow-hidden border-b border-white/5 shrink-0">
                <img src={project.thumbnail_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                
                {hasLink && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100">
                        <div className="bg-blue-500 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-2xl">
                            View Project <ExternalLink size={12} />
                        </div>
                    </div>
                )}

                <div className="absolute top-2 right-2">
                    <LikeButton entityId={project.id} entityType="portfolio" />
                </div>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between bg-white/[0.01] overflow-hidden">
                <div className="space-y-1.5">
                    <h3 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors uppercase tracking-tight line-clamp-2 h-10">{project.title}</h3>
                    <div className="h-9">
                        <p className="text-xs text-text-secondary line-clamp-2 mt-1 font-medium leading-relaxed">{project.description}</p>
                    </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
                    <button 
                        onClick={(e) => {
                            if (hasLink) e.preventDefault();
                            setShowComments(!showComments);
                        }} 
                        className="text-[10px] text-neutral-500 font-bold hover:text-white transition uppercase relative z-10"
                    >
                        {showComments ? "Close" : "Comment"}
                    </button>
                    {hasLink && (
                        <div className="text-blue-400 group-hover:text-white transition text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                            Live Demo <ExternalLink size={10} />
                        </div>
                    )}
                </div>

                {showComments && (
                    <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                        <CommentSection entityId={project.id} entityType="portfolio" />
                    </div>
                )}
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

function EmptyState({ label }) {
    return (
        <div className="col-span-full py-20 text-center glass-card border-dashed border-white/5">
            <p className="text-neutral-600 text-sm font-medium">{label}</p>
        </div>
    );
}
