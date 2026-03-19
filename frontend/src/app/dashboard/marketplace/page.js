
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { 
  Search, MapPin, DollarSign, Github, Linkedin, Globe,
  Briefcase, ChevronDown, Users, UserPlus, ExternalLink, Star
} from 'lucide-react';

const SKILL_OPTIONS = [
  "JavaScript", "Python", "React", "Node.js", "TypeScript",
  "FastAPI", "Machine Learning", "UI/UX", "DevOps", "Mobile Dev",
  "Next.js", "Flutter", "Rust", "Go", "AWS"
];

// ═══════════════════════════════════════════════
// Demo / fallback data so the marketplace looks
// alive even before real users sign up
// ═══════════════════════════════════════════════
const DEMO_FREELANCERS = [
  {
    id: "demo-1",
    full_name: "Ananya Sharma",
    bio: "Full-stack developer specializing in React, Next.js and Node.js. I build performant web apps with stunning UIs. 4+ years shipping production code for startups.",
    skills: "React, Next.js, Node.js, TypeScript, Tailwind CSS",
    profile_picture_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    availability: "actively_looking",
    location: "Bangalore, India",
    hourly_rate: "$40-60/hr",
    github_url: "https://github.com",
    linkedin_url: "https://linkedin.com",
    portfolio_url: "https://example.com",
    contact_email: "ananya@demo.com",
    is_demo: true,
    portfolios: [
      {
        id: "dp-1",
        title: "SaaS Analytics Dashboard",
        description: "Real-time analytics dashboard with interactive charts, dark mode, and team collaboration features.",
        thumbnail_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
        tech_stack: "React, D3.js, Node.js, PostgreSQL",
        link: "#",
      },
      {
        id: "dp-2",
        title: "E-Commerce Mobile App",
        description: "Full-featured shopping app with AR try-on, wishlist, and payment integration.",
        thumbnail_url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80",
        tech_stack: "React Native, Stripe, Firebase",
        link: "#",
      },
    ],
  },
  {
    id: "demo-2",
    full_name: "Marcus Chen",
    bio: "ML engineer & data scientist. I turn messy data into actionable insights and deploy production ML pipelines. Published researcher in NLP.",
    skills: "Python, Machine Learning, TensorFlow, FastAPI, AWS",
    profile_picture_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    availability: "actively_looking",
    location: "San Francisco, CA",
    hourly_rate: "$80-120/hr",
    github_url: "https://github.com",
    linkedin_url: "https://linkedin.com",
    contact_email: "marcus@demo.com",
    is_demo: true,
    portfolios: [
      {
        id: "dp-3",
        title: "AI Content Moderation System",
        description: "Automated content moderation pipeline processing 10K+ images/day with 99.2% accuracy.",
        thumbnail_url: "https://images.unsplash.com/photo-1555949963-aa79dcee578d?auto=format&fit=crop&w=800&q=80",
        tech_stack: "Python, PyTorch, FastAPI, Redis",
        link: "#",
      },
      {
        id: "dp-4",
        title: "Stock Prediction Dashboard",
        description: "LSTM-based stock price predictions with interactive backtesting and portfolio optimization.",
        thumbnail_url: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80",
        tech_stack: "Python, TensorFlow, Plotly, AWS",
        link: "#",
      },
      {
        id: "dp-5",
        title: "NLP Chatbot Framework",
        description: "Open-source conversational AI framework with multi-language support and custom fine-tuning.",
        thumbnail_url: "https://images.unsplash.com/photo-1531746790095-e0905944b8fd?auto=format&fit=crop&w=800&q=80",
        tech_stack: "Python, Transformers, Docker",
        link: "#",
      },
    ],
  },
  {
    id: "demo-3",
    full_name: "Priya Desai",
    bio: "UI/UX designer who codes. I create pixel-perfect interfaces and design systems. Previously at a Y-Combinator startup.",
    skills: "UI/UX, Figma, React, Tailwind CSS, Framer Motion",
    profile_picture_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
    availability: "actively_looking",
    location: "Mumbai, India",
    hourly_rate: "$35-55/hr",
    github_url: "https://github.com",
    portfolio_url: "https://example.com",
    contact_email: "priya@demo.com",
    is_demo: true,
    portfolios: [
      {
        id: "dp-6",
        title: "Fintech Design System",
        description: "Complete design system with 80+ components, accessibility-first approach, dark/light themes.",
        thumbnail_url: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80",
        tech_stack: "Figma, React, Storybook",
        link: "#",
      },
      {
        id: "dp-7",
        title: "Travel Booking Platform",
        description: "End-to-end travel booking experience with immersive destination pages and seamless checkout.",
        thumbnail_url: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80",
        tech_stack: "Next.js, Tailwind CSS, Framer Motion",
        link: "#",
      },
    ],
  },
  {
    id: "demo-4",
    full_name: "Jake Morrison",
    bio: "DevOps & Cloud architect. I automate infrastructure, optimize CI/CD pipelines, and make deployments boring (in a good way).",
    skills: "AWS, Docker, Kubernetes, Terraform, Go, CI/CD",
    profile_picture_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    availability: "taking_break",
    location: "Austin, TX",
    hourly_rate: "$90-130/hr",
    github_url: "https://github.com",
    linkedin_url: "https://linkedin.com",
    contact_email: "jake@demo.com",
    is_demo: true,
    portfolios: [
      {
        id: "dp-8",
        title: "Multi-Cloud Infrastructure",
        description: "Zero-downtime multi-cloud deployment across AWS and GCP with automated failover.",
        thumbnail_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
        tech_stack: "Terraform, Kubernetes, AWS, GCP",
        link: "#",
      },
    ],
  },
];

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

  return (
    <div className="glass-card overflow-hidden group flex-shrink-0 w-72 hover:ring-1 hover:ring-primary/30 transition-all">
      {/* Thumbnail */}
      {project.thumbnail_url ? (
        <div className="relative aspect-video overflow-hidden">
          <img
            src={project.thumbnail_url}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {project.link && project.link !== "#" && (
            <a href={project.link} target="_blank" rel="noopener noreferrer"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur p-1.5 rounded-lg inline-flex">
              <ExternalLink size={12} className="text-white" />
            </a>
          )}
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
          <Briefcase size={28} className="text-white/10" />
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="font-bold text-white text-sm leading-snug group-hover:text-blue-400 transition-colors">
          {project.title}
        </h3>
        {project.description && (
          <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{project.description}</p>
        )}
        {techStack.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {techStack.slice(0, 3).map(t => (
              <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-primary/5 text-primary/80 border border-primary/10">
                {t}
              </span>
            ))}
            {techStack.length > 3 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] text-text-secondary">+{techStack.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// Per-freelancer section with projects
// ═══════════════════════════════════════
function FreelancerSection({ freelancer }) {
  const skills = (freelancer.skills || "").split(",").map(s => s.trim()).filter(Boolean);
  const avatar = getAvatarUrl(freelancer.profile_picture_url, freelancer.full_name);
  const projects = freelancer.portfolios || [];
  const isAvailable = freelancer.availability === "actively_looking";
  const profileHref = freelancer.is_demo ? "#" : `/dashboard/marketplace/${freelancer.id}`;

  return (
    <div className="space-y-4">
      {/* Freelancer header */}
      <Link href={profileHref} className="glass-card p-5 flex items-start gap-4 hover:bg-white/5 transition-all group">
        <img src={avatar} alt={freelancer.full_name}
          className="w-14 h-14 rounded-xl border border-white/10 object-cover shrink-0" />
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">{freelancer.full_name}</h3>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
              isAvailable ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-green-400' : 'bg-yellow-400'}`} />
              {isAvailable ? 'Available' : 'On Break'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-text-secondary flex-wrap">
            {freelancer.location && <span className="flex items-center gap-1"><MapPin size={11} /> {freelancer.location}</span>}
            {freelancer.hourly_rate && <span className="flex items-center gap-1"><DollarSign size={11} /> {freelancer.hourly_rate}</span>}
            <span className="flex items-center gap-1"><Briefcase size={11} /> {projects.length} project{projects.length !== 1 ? 's' : ''}</span>
          </div>
          {freelancer.bio && (
            <p className="text-xs text-text-secondary line-clamp-1 leading-relaxed">{freelancer.bio}</p>
          )}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {skills.slice(0, 5).map(s => <SkillBadge key={s} skill={s} />)}
            {skills.length > 5 && (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-primary/10 text-primary">+{skills.length - 5}</span>
            )}
          </div>
        </div>
      </Link>

      {/* Projects row — side by side, horizontally scrollable */}
      {projects.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pl-1">
          {projects.map(p => (
            <ProjectCard key={p.id} project={p} freelancer={freelancer} />
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
      setFreelancers(data || []);
    }
    setLoading(false);
  }, [searchQuery, skillFilter, availabilityFilter]);

  useEffect(() => { loadFreelancers(); }, [loadFreelancers]);

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
            Explore <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Talent</span>
          </h1>
          <p className="text-text-secondary text-sm">Discover skilled freelancers and their best work</p>
        </div>
        <Link
          href="/dashboard/marketplace/my-profile"
          className="btn-primary text-white flex items-center gap-2 shrink-0"
        >
          <UserPlus size={16} />
          {myProfileId ? 'Edit Your Profile' : 'Join as Freelancer'}
        </Link>
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

      {/* ═══ Freelancer Sections — projects grouped per creator ═══ */}
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
    </div>
  );
}
