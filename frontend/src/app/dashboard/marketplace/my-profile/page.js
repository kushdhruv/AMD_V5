
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { 
  User, Briefcase, Zap, Save, Plus, Trash2, Edit3, ExternalLink, X, Eye
} from 'lucide-react';

function getAvatarUrl(url, name) {
  if (url && url.startsWith("http")) return url;
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || "U")}`;
}

export default function MyProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [freelancer, setFreelancer] = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  // Profile form state
  const [form, setForm] = useState({
    full_name: "", bio: "", skills: "", location: "", hourly_rate: "",
    contact_email: "", contact_phone: "",
    github_url: "", linkedin_url: "", portfolio_url: ""
  });

  // Portfolio modal
  const [showModal, setShowModal] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState(null);
  const [portfolioForm, setPortfolioForm] = useState({
    title: "", description: "", link: "", tech_stack: ""
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { setLoading(false); return; }
      setUser(u);

      // Fetch or auto-create freelancer profile
      let { data: f } = await supabase
        .from('freelancers')
        .select('*')
        .eq('user_id', u.id)
        .maybeSingle();

      if (!f) {
        // Upsert to safely avoid duplicate key errors
        const { data: created, error } = await supabase
          .from('freelancers')
          .upsert({
            user_id: u.id,
            full_name: u.user_metadata?.full_name || u.email?.split("@")[0] || "New Freelancer",
            contact_email: u.email || "",
          }, { onConflict: 'user_id' })
          .select()
          .single();

        if (error) {
          console.error("Failed to create profile:", error);
          setLoading(false);
          return;
        }
        f = created;
      }

      setFreelancer(f);
      setForm({
        full_name: f.full_name || "",
        bio: f.bio || "",
        skills: f.skills || "",
        location: f.location || "",
        hourly_rate: f.hourly_rate || "",
        contact_email: f.contact_email || "",
        contact_phone: f.contact_phone || "",
        github_url: f.github_url || "",
        linkedin_url: f.linkedin_url || "",
        portfolio_url: f.portfolio_url || "",
      });

      // Load portfolios
      const { data: p } = await supabase
        .from('portfolios')
        .select('*')
        .eq('freelancer_id', f.id)
        .order('created_at', { ascending: false });
      setPortfolios(p || []);
      setLoading(false);
    }
    load();
  }, []);

  // ═══ Profile Save ═══
  async function saveProfile(e) {
    e.preventDefault();
    if (!freelancer) return;
    setSaving(true);

    const { error } = await supabase
      .from('freelancers')
      .update(form)
      .eq('id', freelancer.id);

    if (error) {
      showToast("❌ Failed to save: " + error.message);
    } else {
      showToast("✅ Profile saved!");
    }
    setSaving(false);
  }

  // ═══ Availability Toggle ═══
  async function setAvailability(status) {
    if (!freelancer) return;
    const { error } = await supabase
      .from('freelancers')
      .update({ availability: status })
      .eq('id', freelancer.id);

    if (!error) {
      setFreelancer({ ...freelancer, availability: status });
      showToast(`✅ Status: ${status === 'actively_looking' ? 'Actively Looking' : 'Taking a Break'}`);
    }
  }

  // ═══ Portfolio CRUD ═══
  function openAddPortfolio() {
    if (portfolios.length >= 4) {
      showToast("⚠️ Maximum 4 portfolio items allowed");
      return;
    }
    setEditingPortfolio(null);
    setPortfolioForm({ title: "", description: "", link: "", tech_stack: "" });
    setShowModal(true);
  }

  function openEditPortfolio(p) {
    setEditingPortfolio(p);
    setPortfolioForm({
      title: p.title || "",
      description: p.description || "",
      link: p.link || "",
      tech_stack: p.tech_stack || "",
    });
    setShowModal(true);
  }

  async function savePortfolio(e) {
    e.preventDefault();
    if (!freelancer) return;
    setSaving(true);

    if (editingPortfolio) {
      // Update
      const { error } = await supabase
        .from('portfolios')
        .update(portfolioForm)
        .eq('id', editingPortfolio.id);
      if (error) { showToast("❌ " + error.message); }
      else {
        setPortfolios(prev => prev.map(p => p.id === editingPortfolio.id ? { ...p, ...portfolioForm } : p));
        showToast("✅ Project updated!");
      }
    } else {
      // Insert
      const { data, error } = await supabase
        .from('portfolios')
        .insert({ ...portfolioForm, freelancer_id: freelancer.id })
        .select()
        .single();
      if (error) { showToast("❌ " + error.message); }
      else {
        setPortfolios(prev => [data, ...prev]);
        showToast("✅ Project added!");
      }
    }
    setShowModal(false);
    setSaving(false);
  }

  async function deletePortfolio(id) {
    if (!confirm("Delete this project?")) return;
    const { error } = await supabase.from('portfolios').delete().eq('id', id);
    if (!error) {
      setPortfolios(prev => prev.filter(p => p.id !== id));
      showToast("🗑️ Project deleted");
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-8 animate-pulse space-y-6">
        <div className="glass-card h-16 bg-white/[0.02]" />
        <div className="glass-card h-96 bg-white/[0.02]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-8">
        <div className="glass-card p-16 text-center text-text-secondary">
          <div className="text-4xl mb-4">🔐</div>
          <h3 className="font-bold text-white mb-2">Login Required</h3>
          <p className="text-sm">Please sign in to manage your freelancer profile.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "portfolio", label: "Portfolio", icon: Briefcase },
    { id: "availability", label: "Availability", icon: Zap },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4 md:p-8 pb-20">
      
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-neutral-800 border border-white/10 rounded-lg px-4 py-3 text-sm font-medium shadow-xl animate-fadeIn">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Your Dashboard</h1>
          <p className="text-text-secondary text-sm">Manage your freelancer profile and portfolio</p>
        </div>
        {freelancer && (
          <Link
            href={`/dashboard/marketplace/${freelancer.id}`}
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-white transition"
            target="_blank"
          >
            <Eye size={14} /> View Public Profile →
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/[0.02] p-1 rounded-xl border border-white/5">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === t.id 
                  ? 'bg-white/10 text-white' 
                  : 'text-text-secondary hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* ═══ Profile Tab ═══ */}
      {activeTab === "profile" && (
        <form onSubmit={saveProfile} className="glass-card p-6 space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-2">
            <img 
              src={getAvatarUrl(freelancer?.profile_picture_url, form.full_name)}
              alt="Avatar"
              className="w-16 h-16 rounded-xl border border-white/10"
            />
            <div>
              <p className="text-white font-bold">{form.full_name || "Freelancer"}</p>
              <p className="text-xs text-text-secondary">{user?.email}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">Full Name</label>
              <input type="text" value={form.full_name} onChange={e => setForm(f => ({...f, full_name: e.target.value}))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">Location</label>
              <input type="text" value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g., San Francisco, CA" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1.5">Professional Bio</label>
            <textarea value={form.bio} onChange={e => setForm(f => ({...f, bio: e.target.value}))} rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary resize-none" placeholder="Tell clients about your expertise..." />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1.5">Skills (comma-separated)</label>
            <input type="text" value={form.skills} onChange={e => setForm(f => ({...f, skills: e.target.value}))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary" placeholder="React, Python, Machine Learning, UI/UX" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">Contact Email</label>
              <input type="email" value={form.contact_email} onChange={e => setForm(f => ({...f, contact_email: e.target.value}))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary" placeholder="contact@example.com" />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">Phone (optional)</label>
              <input type="text" value={form.contact_phone} onChange={e => setForm(f => ({...f, contact_phone: e.target.value}))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary" placeholder="+1 555-123-4567" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">GitHub URL</label>
              <input type="url" value={form.github_url} onChange={e => setForm(f => ({...f, github_url: e.target.value}))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary" placeholder="https://github.com/username" />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">LinkedIn URL</label>
              <input type="url" value={form.linkedin_url} onChange={e => setForm(f => ({...f, linkedin_url: e.target.value}))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary" placeholder="https://linkedin.com/in/username" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">Portfolio Website</label>
              <input type="url" value={form.portfolio_url} onChange={e => setForm(f => ({...f, portfolio_url: e.target.value}))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary" placeholder="https://yoursite.com" />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">Hourly Rate</label>
              <input type="text" value={form.hourly_rate} onChange={e => setForm(f => ({...f, hourly_rate: e.target.value}))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g., $50-80/hr" />
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="w-full btn-primary text-white py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
            <Save size={16} /> {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      )}

      {/* ═══ Portfolio Tab ═══ */}
      {activeTab === "portfolio" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white">Your Projects</h3>
              <p className="text-xs text-text-secondary">{portfolios.length} / 4 projects</p>
            </div>
            <button onClick={openAddPortfolio}
              className="btn-primary text-white text-sm flex items-center gap-2">
              <Plus size={14} /> Add Project
            </button>
          </div>

          {portfolios.length > 0 ? (
            <div className="space-y-3">
              {portfolios.map(p => {
                const techStack = (p.tech_stack || "").split(",").map(s => s.trim()).filter(Boolean);
                return (
                  <div key={p.id} className="glass-card p-4 flex gap-4">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center shrink-0 overflow-hidden">
                      {p.thumbnail_url ? (
                        <img src={p.thumbnail_url} alt={p.title} className="w-full h-full object-cover" />
                      ) : (
                        <Briefcase size={20} className="text-white/20" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-white text-sm">{p.title}</h4>
                          {p.description && <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">{p.description}</p>}
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button onClick={() => openEditPortfolio(p)} className="p-1.5 rounded-lg hover:bg-white/10 text-text-secondary hover:text-white transition">
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => deletePortfolio(p.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-secondary hover:text-red-400 transition">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      {techStack.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
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
            <div className="glass-card p-12 text-center text-text-secondary">
              <div className="text-3xl mb-3">📁</div>
              <h3 className="font-bold text-white mb-1">No projects yet</h3>
              <p className="text-xs mb-4">Add up to 4 portfolio projects to showcase your work</p>
              <button onClick={openAddPortfolio} className="btn-primary text-white text-sm">
                <Plus size={14} /> Add Your First Project
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══ Availability Tab ═══ */}
      {activeTab === "availability" && (
        <div className="space-y-4">
          <div className="glass-card p-6 space-y-4">
            <div>
              <h3 className="font-bold text-white mb-1">Availability Status</h3>
              <p className="text-xs text-text-secondary">Controls your visibility on the marketplace and whether clients can see your contact details.</p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => setAvailability("actively_looking")}
                className={`w-full p-4 rounded-xl text-left border transition ${
                  freelancer?.availability === "actively_looking"
                    ? "border-green-500/40 bg-green-500/10"
                    : "border-white/10 bg-white/[0.02] hover:bg-white/5"
                }`}
              >
                <h4 className="font-bold text-white flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                  Actively Looking to Get Hired
                </h4>
                <p className="text-xs text-text-secondary mt-1">Visible on marketplace · Contact info shared with clients</p>
              </button>

              <button 
                onClick={() => setAvailability("taking_break")}
                className={`w-full p-4 rounded-xl text-left border transition ${
                  freelancer?.availability === "taking_break"
                    ? "border-yellow-500/40 bg-yellow-500/10"
                    : "border-white/10 bg-white/[0.02] hover:bg-white/5"
                }`}
              >
                <h4 className="font-bold text-white flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  Taking a Break
                </h4>
                <p className="text-xs text-text-secondary mt-1">Hidden from default listing · Contact info hidden</p>
              </button>
            </div>
          </div>

          <div className="glass-card p-6">
            <h4 className="font-bold text-white mb-3">What each status means:</h4>
            <div className="space-y-2 text-xs text-text-secondary leading-relaxed">
              <p><strong className="text-green-400">Actively Looking</strong> — Your profile appears in marketplace results. Clients can see your email, phone, and all contact details.</p>
              <p><strong className="text-yellow-400">Taking a Break</strong> — Your profile is hidden from default search. Contact details are hidden. Only professional links (GitHub, LinkedIn) remain visible.</p>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Portfolio Modal ═══ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="glass-card p-6 w-full max-w-lg space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {editingPortfolio ? "Edit Project" : "Add Project"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-text-secondary">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={savePortfolio} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5">Project Title *</label>
                <input type="text" required value={portfolioForm.title} onChange={e => setPortfolioForm(f => ({...f, title: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary" placeholder="My Amazing Project" />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5">Description</label>
                <textarea value={portfolioForm.description} onChange={e => setPortfolioForm(f => ({...f, description: e.target.value}))} rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary resize-none" placeholder="Describe what this project does..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5">Project Link</label>
                <input type="url" value={portfolioForm.link} onChange={e => setPortfolioForm(f => ({...f, link: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary" placeholder="https://myproject.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5">Tech Stack (comma-separated)</label>
                <input type="text" value={portfolioForm.tech_stack} onChange={e => setPortfolioForm(f => ({...f, tech_stack: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary" placeholder="React, Node.js, PostgreSQL" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 btn-primary text-white py-2.5 rounded-xl disabled:opacity-50">
                  {saving ? "Saving..." : "Save Project"}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-text-secondary hover:text-white hover:bg-white/10 transition text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
