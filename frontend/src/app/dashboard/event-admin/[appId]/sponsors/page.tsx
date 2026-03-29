"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabase-client';
import { useParams } from 'next/navigation';
import { 
  Award, 
  Trash2, 
  Edit3, 
  Plus, 
  Loader2, 
  ExternalLink, 
  Calendar, 
  CheckCircle2, 
  XCircle,
  Clock,
  LayoutGrid,
  Image as ImageIcon,
  Save,
  ChevronRight
} from 'lucide-react';

export default function SponsorsAdminPage() {
  const params = useParams();
  const appId = params?.appId as string;
  
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<any>(null);
  
  const initialSponsorState = {
    name: '',
    logo_url: '',
    description: '',
    website_url: '',
    tier: 'Silver',
    is_active: true,
    start_time: '',
    end_time: ''
  };
  
  const [newSponsor, setNewSponsor] = useState(initialSponsorState);

  const fetchSponsors = async () => {
    if (!appId) return;
    const { data, error } = await supabase
      .from('sponsors')
      .select('*')
      .eq('event_id', appId)
      .order('tier', { ascending: true }) // Platinum > Gold > Silver (alphabetical or custom order needed)
      .order('order_index', { ascending: true });

    if (!error && data) setSponsors(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSponsors();
    
    const channel = supabase
      .channel('sponsors_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'sponsors',
        filter: `event_id=eq.${appId}`
      }, () => {
        fetchSponsors();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [appId]);

  const handleSave = async () => {
    const sponsorData = editingSponsor || newSponsor;
    if (!sponsorData.name) return;

    setIsSaving(true);
    const payload = {
      ...sponsorData,
      event_id: appId,
      start_time: sponsorData.start_time || null,
      end_time: sponsorData.end_time || null
    };

    let error;
    if (editingSponsor) {
      const { error: err } = await supabase
        .from('sponsors')
        .update(payload)
        .eq('id', editingSponsor.id);
      error = err;
    } else {
      const { error: err } = await supabase
        .from('sponsors')
        .insert([payload]);
      error = err;
    }

    if (!error) {
      setShowModal(false);
      setEditingSponsor(null);
      setNewSponsor(initialSponsorState);
      fetchSponsors();
    } else {
      alert("Error saving sponsor: " + error.message);
    }
    setIsSaving(false);
  };

  const deleteSponsor = async (id: string) => {
    if (!confirm("Remove this sponsorship?")) return;
    await supabase.from('sponsors').delete().eq('id', id);
    fetchSponsors();
  };

  const toggleActive = async (sponsor: any) => {
    await supabase
      .from('sponsors')
      .update({ is_active: !sponsor.is_active })
      .eq('id', sponsor.id);
    fetchSponsors();
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
      case 'Gold': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-12">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-[0.3em]">
            <Award className="w-4 h-4" />
            Partnership Portal
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-white">Sponsors</h1>
          <p className="text-neutral-500 text-lg max-w-2xl font-medium">
            Manage your high-value partners. Control visibility, tiers, and scheduling across all platforms.
          </p>
        </div>
        <button 
          onClick={() => {
            setEditingSponsor(null);
            setNewSponsor(initialSponsorState);
            setShowModal(true);
          }}
          className="group relative flex items-center gap-4 px-10 py-5 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-[2rem] transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-indigo-500/20 overflow-hidden"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          Add Partner
        </button>
      </header>

      {/* Sponsors List By Tier */}
      <div className="space-y-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-white/[0.02] border border-white/5 rounded-[40px] animate-pulse" />
            ))}
          </div>
        ) : sponsors.length === 0 ? (
          <div className="py-32 text-center space-y-8 bg-white/[0.01] border border-dashed border-white/10 rounded-[60px]">
            <div className="w-24 h-24 bg-white/[0.03] rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-white/5">
              <Award className="w-12 h-12 text-neutral-800" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-white">No active partners</h3>
              <p className="text-neutral-500 text-lg font-medium">Start inviting sponsors to your event to see them here.</p>
            </div>
          </div>
        ) : (
          ['Platinum', 'Gold', 'Silver'].map(tier => {
            const tierSponsors = sponsors.filter(s => s.tier === tier);
            if (tierSponsors.length === 0) return null;
            
            return (
              <section key={tier} className="space-y-8">
                <div className="flex items-center gap-4">
                  <h2 className={`text-sm font-black uppercase tracking-[0.4em] px-4 py-1 rounded-full border ${getTierColor(tier)}`}>
                    {tier} Partners
                  </h2>
                  <div className="flex-1 h-px bg-white/5" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tierSponsors.map((sponsor) => (
                    <div 
                      key={sponsor.id}
                      className="group relative bg-white/[0.02] border border-white/10 rounded-[40px] p-8 transition-all hover:bg-white/[0.04] hover:border-indigo-500/30 hover:shadow-3xl overflow-hidden"
                    >
                      {/* Status Indicator */}
                      <div className="absolute top-6 right-6">
                        {sponsor.is_active ? (
                          <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </div>
                        ) : (
                          <div className="px-3 py-1 bg-neutral-500/10 border border-neutral-500/20 text-neutral-500 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                            <XCircle className="w-3 h-3" /> Inactive
                          </div>
                        )}
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center gap-6">
                          <div className="w-20 h-20 bg-white/[0.03] rounded-3xl border border-white/5 flex items-center justify-center p-4 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                            {sponsor.logo_url ? (
                              <img src={sponsor.logo_url} alt={sponsor.name} className="w-full h-full object-contain" />
                            ) : (
                              <ImageIcon className="w-8 h-8 text-neutral-700" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-2xl font-black text-white group-hover:text-indigo-400 transition-colors">
                              {sponsor.name}
                            </h3>
                            <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mt-1">Tier: {sponsor.tier}</p>
                          </div>
                        </div>

                        <p className="text-neutral-400 text-sm leading-relaxed font-medium line-clamp-2 min-h-[40px]">
                          {sponsor.description || "No description provided."}
                        </p>

                        <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                          <button 
                            onClick={() => {
                              setEditingSponsor(sponsor);
                              setShowModal(true);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-white transition-all"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button 
                            onClick={() => deleteSponsor(sponsor.id)}
                            className="p-3 bg-white/[0.03] hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 text-neutral-600 hover:text-red-500 rounded-2xl transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          {sponsor.website_url && (
                             <a 
                                href={sponsor.website_url} 
                                target="_blank" 
                                className="p-3 bg-white/[0.03] hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/20 text-neutral-600 hover:text-indigo-400 rounded-2xl transition-all"
                             >
                                <ExternalLink className="w-3.5 h-3.5" />
                             </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>

      {/* Creation/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-2xl bg-black/80 animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[48px] overflow-hidden shadow-3xl animate-in zoom-in-95 duration-200">
            <div className="p-12 space-y-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-2xl shadow-indigo-500/20">
                  <Handshake className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-4xl font-black tracking-tighter text-white">
                    {editingSponsor ? 'Edit Partner' : 'New Strategic Partner'}
                  </h2>
                  <p className="text-neutral-500 font-medium text-lg">Define how this sponsor appears in the app.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 px-1 italic">Sponsor Name</label>
                  <input 
                    type="text"
                    placeholder="e.g. Acme Corp"
                    value={editingSponsor?.name ?? newSponsor.name}
                    onChange={(e) => editingSponsor ? setEditingSponsor({...editingSponsor, name: e.target.value}) : setNewSponsor({...newSponsor, name: e.target.value})}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-8 text-white font-bold focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-neutral-800"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 px-1 italic">Partnership Tier</label>
                  <select 
                    value={editingSponsor?.tier ?? newSponsor.tier}
                    onChange={(e) => editingSponsor ? setEditingSponsor({...editingSponsor, tier: e.target.value}) : setNewSponsor({...newSponsor, tier: e.target.value})}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-8 text-white font-bold focus:outline-none focus:border-indigo-500/50 transition-all appearance-none"
                  >
                    <option value="Platinum" className="bg-[#0a0a0a]">Platinum (Hero)</option>
                    <option value="Gold" className="bg-[#0a0a0a]">Gold (Grid)</option>
                    <option value="Silver" className="bg-[#0a0a0a]">Silver (List)</option>
                  </select>
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 px-1 italic">Logo URL (Premium Design Required)</label>
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                       <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-700" />
                       <input 
                         type="text"
                         placeholder="https://example.com/logo.png"
                         value={editingSponsor?.logo_url ?? newSponsor.logo_url}
                         onChange={(e) => editingSponsor ? setEditingSponsor({...editingSponsor, logo_url: e.target.value}) : setNewSponsor({...newSponsor, logo_url: e.target.value})}
                         className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 pl-16 pr-8 text-white font-medium focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-neutral-800"
                       />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 px-1 italic">Partner Website / CTA Link</label>
                  <div className="flex-1 relative">
                       <ExternalLink className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-700" />
                       <input 
                         type="text"
                         placeholder="https://acmecorp.com"
                         value={editingSponsor?.website_url ?? newSponsor.website_url}
                         onChange={(e) => editingSponsor ? setEditingSponsor({...editingSponsor, website_url: e.target.value}) : setNewSponsor({...newSponsor, website_url: e.target.value})}
                         className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 pl-16 pr-8 text-white font-medium focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-neutral-800"
                       />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 px-1 italic">Start Time (Optional)</label>
                  <input 
                    type="datetime-local"
                    value={editingSponsor?.start_time ?? newSponsor.start_time}
                    onChange={(e) => editingSponsor ? setEditingSponsor({...editingSponsor, start_time: e.target.value}) : setNewSponsor({...newSponsor, start_time: e.target.value})}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-8 text-white font-bold focus:outline-none focus:border-indigo-500/50 transition-all [color-scheme:dark]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 px-1 italic">End Time (Optional)</label>
                  <input 
                    type="datetime-local"
                    value={editingSponsor?.end_time ?? newSponsor.end_time}
                    onChange={(e) => editingSponsor ? setEditingSponsor({...editingSponsor, end_time: e.target.value}) : setNewSponsor({...newSponsor, end_time: e.target.value})}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-8 text-white font-bold focus:outline-none focus:border-indigo-500/50 transition-all [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="flex gap-6 pt-4">
                <button 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-5 text-sm font-black uppercase tracking-[0.3em] text-neutral-600 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving || !(editingSponsor?.name ?? newSponsor.name)}
                  className="flex-[2] py-5 bg-indigo-600 text-white text-sm font-black uppercase tracking-[0.3em] rounded-[1.5rem] hover:bg-white hover:text-black hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-2xl shadow-indigo-600/30"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {editingSponsor ? 'Update Partner' : 'Confirm Launch'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Handshake(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m11 17 2 2 6-6" />
            <path d="m8 14 2 2 6-6" />
            <path d="M13 22H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v6" />
            <path d="m5 8 6 4 8-4" />
        </svg>
    )
}
