"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabase-client';
import { useParams } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
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
  
  const [showModal, setShowModal] = useState(false);
  const [editingStall, setEditingStall] = useState<any>(null);
  const [newStall, setNewStall] = useState({
    name: '',
    category: 'food',
    description: '',
    location: '',
    price_range: '₹',
    emoji: '🏪',
    is_featured: false,
    is_open: true,
    contact: { phone: '', whatsapp: '', upi: '' },
    menu: [] as any[]
  });

  const [newMenuItem, setNewMenuItem] = useState({ name: '', price: '', description: '', isVeg: true, emoji: '🍕' });

  const fetchStalls = async () => {
    if (!appId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('stalls')
      .select('*')
      .eq('event_id', appId)
      .order('created_at', { ascending: false });

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

  const resetForm = () => {
    setNewStall({
      name: '',
      category: 'food',
      description: '',
      location: '',
      price_range: '₹',
      emoji: '🏪',
      is_featured: false,
      is_open: true,
      contact: { phone: '', whatsapp: '', upi: '' },
      menu: []
    });
    setEditingStall(null);
    setShowModal(false);
  };

  const handleSaveStall = async () => {
    if (!appId || !newStall.name) return;

    // Supabase payload construction
    // Only include rating/review_count if they exist in editingStall or are explicitly needed
    const payload: any = { 
      ...newStall, 
      event_id: appId
    };

    // If we're editing, preserve metadata
    if (editingStall) {
      if (editingStall.rating !== undefined) payload.rating = editingStall.rating;
      if (editingStall.review_count !== undefined) payload.review_count = editingStall.review_count;
    } else {
      // Default metadata for new stalls
      payload.rating = 4.5;
      payload.review_count = 0;
    }
    
    let result;
    if (editingStall) {
      result = await supabase.from('stalls').update(payload).eq('id', editingStall.id).select();
    } else {
      result = await supabase.from('stalls').insert([payload]).select();
    }

    if (result.error) {
      console.error("[Admin] Failed to save stall:", result.error.message);
      alert("Error: " + result.error.message);
    } else if (result.data) {
      await fetchStalls();
      resetForm();
      alert(editingStall ? "✅ Stall updated!" : "✅ Stall added!");
    }
  };

  const addMenuItem = () => {
    if (!newMenuItem.name || !newMenuItem.price) return;
    setNewStall({
      ...newStall,
      menu: [...(newStall.menu || []), { ...newMenuItem, id: Math.random().toString(36).substr(2, 9), price: Number(newMenuItem.price) }]
    });
    setNewMenuItem({ name: '', price: '', description: '', isVeg: true, emoji: '🍕' });
  };

  const removeMenuItem = (id: string) => {
    setNewStall({ ...newStall, menu: (newStall.menu || []).filter((m: any) => m.id !== id) });
  };

  const filteredStalls = stalls.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10 relative">
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
          onClick={() => setShowModal(true)}
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

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-blue-400 transition-colors" />
        <input 
          type="text"
          placeholder="Search stalls by name or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-medium focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.04] transition-all placeholder:text-neutral-600"
        />
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
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 transition-opacity pointer-events-none ${stall.is_featured ? 'bg-amber-500/20' : 'bg-blue-500/20'}`} />

            <div className="relative z-10 space-y-6 flex flex-col h-full">
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
                    onClick={() => {
                      setEditingStall(stall);
                      setNewStall({
                        ...stall,
                        contact: stall.contact || { phone: '', whatsapp: '', upi: '' },
                        menu: stall.menu || []
                      });
                      setShowModal(true);
                    }}
                    className="p-3 rounded-2xl bg-white/[0.03] border border-transparent text-neutral-500 hover:text-white hover:border-white/10 transition-all"
                    title="Edit details"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                </div>
              </header>

              <div className="flex-1">
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
          <button onClick={() => setShowModal(true)} className="text-blue-400 font-black uppercase tracking-widest text-xs hover:text-blue-300 transition-colors">
            + Quick Add Stall
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-6 backdrop-blur-md bg-black/40">
          <div className="bg-neutral-950 border border-white/10 w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 relative">
            <div className="p-10 space-y-8 max-h-[85vh] overflow-y-auto">
              <header className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-black tracking-tight">{editingStall ? 'Edit Vendor' : 'New Vendor Profile'}</h2>
                  <p className="text-neutral-500 font-medium">Configure how this stall appears in the mobile app.</p>
                </div>
                <button onClick={resetForm} className="p-4 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                  <XCircle className="w-6 h-6" />
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Left Column: Basic Info */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Vendor Detail</label>
                    <div className="flex gap-4">
                      <input 
                        type="text" 
                        placeholder="🏪" 
                        value={newStall.emoji}
                        onChange={(e) => setNewStall({ ...newStall, emoji: e.target.value })}
                        className="w-20 bg-white/5 border border-white/5 rounded-2xl py-4 text-center text-2xl focus:outline-none focus:border-blue-500/50"
                      />
                      <input 
                        type="text" 
                        placeholder="Stall Name" 
                        value={newStall.name}
                        onChange={(e) => setNewStall({ ...newStall, name: e.target.value })}
                        className="flex-1 bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white font-medium focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Category</label>
                      <select 
                        value={newStall.category}
                        onChange={(e) => setNewStall({ ...newStall, category: e.target.value })}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white font-medium focus:outline-none focus:border-blue-500/50 appearance-none pointer-events-auto"
                      >
                        <option value="food">🍱 Food & Beverages</option>
                        <option value="merch">👕 Merchandise</option>
                        <option value="service">🔧 Service</option>
                        <option value="sponsor">💎 Sponsor</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Price Range</label>
                      <input 
                        type="text" 
                        placeholder="₹100 - ₹500" 
                        value={newStall.price_range}
                        onChange={(e) => setNewStall({ ...newStall, price_range: e.target.value })}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white font-medium focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Description</label>
                    <textarea 
                      placeholder="What do they sell/do?"
                      rows={3}
                      value={newStall.description}
                      onChange={(e) => setNewStall({ ...newStall, description: e.target.value })}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white font-medium focus:outline-none focus:border-blue-500/50 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Location / Booth No.</label>
                    <input 
                      type="text" 
                      placeholder="Main Gate, Spot #4" 
                      value={newStall.location}
                      onChange={(e) => setNewStall({ ...newStall, location: e.target.value })}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white font-medium focus:outline-none focus:border-blue-500/50"
                    />
                  </div>

                  <div className="pt-4 space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Contact Info</label>
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder="Phone No" 
                        value={newStall.contact.phone}
                        onChange={(e) => setNewStall({ ...newStall, contact: { ...newStall.contact, phone: e.target.value } })}
                        className="bg-white/5 border border-white/5 rounded-2xl py-3 px-6 text-sm focus:outline-none focus:border-blue-500/50"
                      />
                      <input 
                        type="text" 
                        placeholder="UPI ID" 
                        value={newStall.contact.upi}
                        onChange={(e) => setNewStall({ ...newStall, contact: { ...newStall.contact, upi: e.target.value } })}
                        className="bg-white/5 border border-white/5 rounded-2xl py-3 px-6 text-sm focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column: Menu Management */}
                <div className="space-y-6 flex flex-col h-full border-l border-white/5 pl-10">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">Catalog / Menu Items</label>
                    <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">{newStall.menu.length} items</span>
                  </div>

                  <div className="flex-1 space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                    {newStall.menu?.map((item: any) => (
                      <div key={item.id} className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex items-center justify-between group/item">
                        <div className="flex items-center gap-4">
                          <span className="text-xl">{item.emoji}</span>
                          <div>
                            <p className="text-sm font-bold">{item.name}</p>
                            <p className="text-xs text-neutral-500">₹{item.price}</p>
                          </div>
                        </div>
                        <button onClick={() => removeMenuItem(item.id)} className="p-2 rounded-xl bg-red-500/10 text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {(!newStall.menu || newStall.menu.length === 0) && (
                      <div className="h-40 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl text-xs text-neutral-600 font-bold uppercase tracking-widest gap-3">
                        <Store className="w-8 h-8 opacity-20" />
                        Empty Catalog
                      </div>
                    )}
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[35px] space-y-4 shadow-inner">
                    <div className="grid grid-cols-4 gap-3">
                      <input 
                        type="text" placeholder="🍕" value={newMenuItem.emoji}
                        onChange={(e) => setNewMenuItem({ ...newMenuItem, emoji: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-2xl py-2 text-center text-xl focus:outline-none"
                      />
                      <input 
                        type="text" placeholder="Item Name" value={newMenuItem.name}
                        onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                        className="col-span-3 bg-white/5 border border-white/10 rounded-2xl py-2 px-4 text-sm focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="number" placeholder="Price" value={newMenuItem.price}
                        onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-2xl py-2 px-4 text-sm focus:outline-none"
                      />
                      <button 
                        onClick={addMenuItem}
                        className="bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20"
                      >
                        Add Item
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <footer className="flex gap-4 pt-10 border-t border-white/5">
                <button 
                  onClick={resetForm}
                  className="flex-1 py-5 rounded-[28px] text-xs font-black uppercase tracking-widest bg-white/5 text-neutral-400 hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveStall}
                  className="flex-[2] py-5 rounded-[28px] text-xs font-black uppercase tracking-widest bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-500/20 transition-all"
                >
                  {editingStall ? 'Save Changes' : 'Launch Stall'}
                </button>
              </footer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
