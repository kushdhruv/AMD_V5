"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Filter, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  XCircle,
  Star,
  MapPin,
  Tag,
  Store,
  Activity
} from 'lucide-react';

export default function StallsAdminPage() {
  const params = useParams();
  const appId = params?.appId as string;
  
  const [stalls, setStalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStalls = async () => {
    if (!appId) return;
    const { data, error } = await supabase
      .from('stalls')
      .select('*')
      .eq('event_id', appId)
      .order('is_featured', { ascending: false });

    if (!error && data) setStalls(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStalls();
  }, [appId]);

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    setStalls(stalls.map(s => s.id === id ? { ...s, is_featured: !currentStatus } : s));
    await supabase.from('stalls').update({ is_featured: !currentStatus }).eq('id', id);
  };

  const toggleOpen = async (id: string, currentStatus: boolean) => {
    setStalls(stalls.map(s => s.id === id ? { ...s, is_open: !currentStatus } : s));
    await supabase.from('stalls').update({ is_open: !currentStatus }).eq('id', id);
  };

  const addMockStall = async () => {
    if (!appId) return;
    const newStall = {
      event_id: appId,
      name: `Premium Stall ${Math.floor(Math.random() * 1000)}`,
      category: 'Gourmet',
      description: 'Hand-crafted snacks and beverages for premium attendees.',
      location: 'Main Pavilion, Slot B3',
      price_range: '₹200-500',
      is_featured: false,
      is_open: true,
      emoji: '🍣'
    };
    const { data, error } = await supabase.from('stalls').insert([newStall]).select();
    if (!error && data) {
      setStalls([data[0], ...stalls]);
    }
  };

  const filteredStalls = stalls.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest">
            <Store className="w-4 h-4" />
            Marketplace Engine
          </div>
          <h1 className="text-5xl font-black tracking-tight">Stalls & Vendors</h1>
          <p className="text-neutral-500 text-lg max-w-2xl">
            Control the commercial landscape of your event with real-time updates and featured placement.
          </p>
        </div>
        <button 
          onClick={addMockStall}
          className="group relative flex items-center gap-3 px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-white/10 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity" />
          <Plus className="w-5 h-5" />
          Add New Stall
        </button>
      </header>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Stalls', value: stalls.length, icon: Store, color: 'text-blue-400' },
          { label: 'Featured', value: stalls.filter(s => s.is_featured).length, icon: Star, color: 'text-amber-400' },
          { label: 'Active Now', value: stalls.filter(s => s.is_open).length, icon: Activity, color: 'text-emerald-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex items-center justify-between backdrop-blur-3xl">
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-black mt-1">{stat.value}</p>
            </div>
            <div className={`p-4 rounded-2xl bg-white/[0.03] ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-blue-400 transition-colors" />
          <input 
            type="text"
            placeholder="Search stalls by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-medium focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.04] transition-all placeholder:text-neutral-600"
          />
        </div>
      </div>

      {/* Stalls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="aspect-[4/5] bg-white/[0.02] border border-white/5 rounded-[40px] animate-pulse" />
          ))
        ) : filteredStalls.map((stall) => (
          <div 
            key={stall.id} 
            className="group relative bg-white/[0.02] border border-white/5 rounded-[40px] p-8 transition-all hover:bg-white/[0.04] hover:border-white/10 hover:shadow-2xl hover:shadow-blue-500/5 overflow-hidden"
          >
            {/* Background Accent */}
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none ${stall.is_featured ? 'bg-amber-500' : 'bg-blue-500'}`} />

            <div className="relative z-10 space-y-6">
              <header className="flex justify-between items-start">
                <div className="w-16 h-16 rounded-[24px] bg-white/[0.03] border border-white/5 flex items-center justify-center text-4xl shadow-inner">
                  {stall.emoji}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => toggleFeatured(stall.id, stall.is_featured)}
                    className={`p-3 rounded-2xl transition-all ${stall.is_featured ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' : 'bg-white/[0.03] text-neutral-500 hover:text-white border border-transparent'}`}
                    title="Feature this stall"
                  >
                    <Star className="w-5 h-5 fill-current" />
                  </button>
                  <button 
                    className="p-3 rounded-2xl bg-white/[0.03] border border-transparent text-neutral-500 hover:text-white hover:border-white/10 transition-all"
                    title="Edit details"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                </div>
              </header>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 bg-white/[0.05] px-2 py-0.5 rounded-md">
                    {stall.category}
                  </span>
                  {stall.is_open ? (
                    <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                      <div className="w-1 h-1 rounded-full bg-emerald-400" /> Open
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-black text-red-500 uppercase tracking-widest">
                      <div className="w-1 h-1 rounded-full bg-red-500" /> Closed
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-black tracking-tight group-hover:text-blue-400 transition-colors">
                  {stall.name}
                </h3>
                <p className="text-neutral-500 text-sm mt-3 line-clamp-2 leading-relaxed">
                  {stall.description}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5">
                <div className="flex items-center gap-3 text-sm text-neutral-400">
                  <MapPin className="w-4 h-4 text-neutral-600" />
                  <span className="font-bold">{stall.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-400">
                  <Tag className="w-4 h-4 text-neutral-600" />
                  <span className="font-bold">{stall.price_range}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => toggleOpen(stall.id, stall.is_open)}
                  className={`flex-1 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] transition-all border
                    ${stall.is_open 
                      ? 'bg-neutral-900 text-neutral-400 border-white/5 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20' 
                      : 'bg-emerald-500 text-black border-transparent shadow-lg shadow-emerald-500/20'}`}
                >
                  {stall.is_open ? 'Force Close' : 'Open Stall'}
                </button>
                <button 
                  onClick={async () => {
                    if (confirm('Are you sure you want to delete this vendor?')) {
                      setStalls(stalls.filter(s => s.id !== stall.id));
                      await supabase.from('stalls').delete().eq('id', stall.id);
                    }
                  }}
                  className="p-4 rounded-[20px] bg-red-500/5 text-red-500 border border-red-500/10 hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredStalls.length === 0 && !loading && (
        <div className="py-20 text-center space-y-6 bg-white/[0.01] border border-dashed border-white/10 rounded-[40px]">
          <div className="w-20 h-20 bg-white/[0.03] rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-10 h-10 text-neutral-700" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black">No vendors found</h3>
            <p className="text-neutral-500 font-medium">Try adjusting your search or add a new stall.</p>
          </div>
          <button onClick={addMockStall} className="text-blue-400 font-black uppercase tracking-widest text-xs hover:text-blue-300 transition-colors">
            + Quick Add Stall
          </button>
        </div>
      )}
    </div>
  );
}
