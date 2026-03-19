
"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { 
  ArrowLeft, MapPin, DollarSign, Github, Linkedin, Globe,
  Mail, Phone, ExternalLink, Briefcase, Calendar
} from 'lucide-react';

function getAvatarUrl(url, name) {
  if (url && url.startsWith("http")) return url;
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || "U")}`;
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const now = new Date();
  const then = new Date(dateStr);
  const days = Math.floor((now - then) / 86400000);
  if (days < 1) return "Today";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default function FreelancerDetailPage() {
  const { id } = useParams();
  const [freelancer, setFreelancer] = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: f, error } = await supabase
        .from('freelancers')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !f) {
        setLoading(false);
        return;
      }
      setFreelancer(f);

      const { data: p } = await supabase
        .from('portfolios')
        .select('*')
        .eq('freelancer_id', id)
        .order('created_at', { ascending: false });

      setPortfolios(p || []);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8 animate-pulse">
        <div className="glass-card h-64 bg-white/[0.02]" />
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="glass-card p-16 text-center text-text-secondary">
          <div className="text-4xl mb-4">😕</div>
          <h3 className="font-bold text-white mb-2">Freelancer not found</h3>
          <Link href="/dashboard/marketplace" className="text-primary hover:underline text-sm">← Back to marketplace</Link>
        </div>
      </div>
    );
  }

  const skills = (freelancer.skills || "").split(",").map(s => s.trim()).filter(Boolean);
  const avatar = getAvatarUrl(freelancer.profile_picture_url, freelancer.full_name);
  const isAvailable = freelancer.availability === "actively_looking";

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-8 pb-20">
      
      {/* Back button */}
      <Link href="/dashboard/marketplace" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-white transition">
        <ArrowLeft size={16} /> Back to marketplace
      </Link>

      {/* Profile Hero */}
      <div className="glass-card p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <img 
            src={avatar} 
            alt={freelancer.full_name}
            className="w-24 h-24 rounded-2xl border-2 border-white/10 object-cover shrink-0"
          />
          
          <div className="flex-1 space-y-4">
            {/* Name + Availability */}
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{freelancer.full_name}</h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isAvailable 
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                  : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
                {isAvailable ? 'Actively Looking' : 'Taking a Break'}
              </span>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
              {freelancer.location && (
                <span className="flex items-center gap-1.5"><MapPin size={14}/> {freelancer.location}</span>
              )}
              {freelancer.hourly_rate && (
                <span className="flex items-center gap-1.5"><DollarSign size={14}/> {freelancer.hourly_rate}</span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar size={14}/> Joined {timeAgo(freelancer.created_at)}
              </span>
            </div>

            {/* Bio */}
            <p className="text-sm text-text-secondary leading-relaxed">
              {freelancer.bio || "No bio provided."}
            </p>

            {/* Skills */}
            <div className="flex flex-wrap gap-2">
              {skills.map(s => (
                <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-white">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contact & Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contact Info — only show if actively looking */}
        {isAvailable && (freelancer.contact_email || freelancer.contact_phone) && (
          <div className="glass-card p-5 space-y-3">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-2">Contact</h3>
            {freelancer.contact_email && (
              <a href={`mailto:${freelancer.contact_email}`} className="flex items-center gap-3 text-sm text-text-secondary hover:text-blue-400 transition">
                <Mail size={16} className="text-blue-400 shrink-0" />
                {freelancer.contact_email}
              </a>
            )}
            {freelancer.contact_phone && (
              <a href={`tel:${freelancer.contact_phone}`} className="flex items-center gap-3 text-sm text-text-secondary hover:text-blue-400 transition">
                <Phone size={16} className="text-green-400 shrink-0" />
                {freelancer.contact_phone}
              </a>
            )}
          </div>
        )}

        {/* Links */}
        {(freelancer.github_url || freelancer.linkedin_url || freelancer.portfolio_url) && (
          <div className="glass-card p-5 space-y-3">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-2">Links</h3>
            {freelancer.github_url && (
              <a href={freelancer.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-text-secondary hover:text-white transition">
                <Github size={16} className="shrink-0" />
                GitHub
                <ExternalLink size={12} className="ml-auto opacity-30" />
              </a>
            )}
            {freelancer.linkedin_url && (
              <a href={freelancer.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-text-secondary hover:text-white transition">
                <Linkedin size={16} className="text-blue-500 shrink-0" />
                LinkedIn
                <ExternalLink size={12} className="ml-auto opacity-30" />
              </a>
            )}
            {freelancer.portfolio_url && (
              <a href={freelancer.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-text-secondary hover:text-white transition">
                <Globe size={16} className="text-purple-400 shrink-0" />
                Portfolio
                <ExternalLink size={12} className="ml-auto opacity-30" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Portfolio */}
      <div>
        <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
          <Briefcase size={14} /> Portfolio ({portfolios.length})
        </h2>
        
        {portfolios.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolios.map(p => {
              const techStack = (p.tech_stack || "").split(",").map(s => s.trim()).filter(Boolean);
              return (
                <div key={p.id} className="glass-card overflow-hidden group">
                  {/* Thumbnail */}
                  {p.thumbnail_url ? (
                    <div className="aspect-video bg-neutral-800 overflow-hidden">
                      <img 
                        src={p.thumbnail_url} 
                        alt={p.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                      <Briefcase size={32} className="text-white/10" />
                    </div>
                  )}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm">{p.title}</h4>
                      {p.link && (
                        <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-white transition">
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                    {p.description && (
                      <p className="text-xs text-text-secondary line-clamp-2">{p.description}</p>
                    )}
                    {techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {techStack.map(t => (
                          <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-text-secondary">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card p-10 text-center text-text-secondary">
            <div className="text-3xl mb-3">📁</div>
            <p className="text-sm">No portfolio items yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
