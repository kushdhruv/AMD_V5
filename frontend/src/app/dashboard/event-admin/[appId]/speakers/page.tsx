"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabase-client';
import { useParams } from 'next/navigation';
import { 
  Plus, 
  Trash2, 
  UsersRound,
  Image as ImageIcon,
  Type,
  AlignLeft,
  Briefcase,
  ToggleLeft,
  ToggleRight,
  Loader2
} from 'lucide-react';

export default function SpeakersAdminPage() {
  const params = useParams();
  const appId = params?.appId as string;
  
  const [speakers, setSpeakers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newBio, setNewBio] = useState("");
  const [newLogoUrl, setNewLogoUrl] = useState("");

  const fetchSpeakers = async () => {
    if (!appId) return;
    const { data, error } = await supabase
      .from('speakers')
      .select('*')
      .eq('event_id', appId)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false });
    
    if (!error) setSpeakers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSpeakers();
  }, [appId]);

  const addSpeaker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return alert("Speaker name is required");

    const { data, error } = await supabase
      .from('speakers')
      .insert({
        event_id: appId,
        name: newName,
        title: newTitle,
        bio: newBio,
        logo_url: newLogoUrl || null,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      alert("Error adding speaker: " + error.message);
    } else {
      setSpeakers([data, ...speakers]);
      setShowForm(false);
      setNewName("");
      setNewTitle("");
      setNewBio("");
      setNewLogoUrl("");
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('speakers')
      .update({ is_active: !currentStatus })
      .eq('id', id);
      
    if (!error) {
      setSpeakers(speakers.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s));
    }
  };

  const deleteSpeaker = async (id: string) => {
    if (!confirm("Remove this speaker?")) return;
    const { error } = await supabase.from('speakers').delete().eq('id', id);
    if (!error) {
      setSpeakers(speakers.filter(s => s.id !== id));
    }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10 mb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest">
            <UsersRound className="w-4 h-4" />
            Guest Management
          </div>
          <h1 className="text-5xl font-black tracking-tight text-white">Speakers</h1>
          <p className="text-neutral-500 text-lg max-w-2xl font-medium">
            Manage your event's standout guests, keynote speakers, and performers.
          </p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-4 rounded-2xl font-black transition-all hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          {showForm ? 'CANCEL' : 'ADD SPEAKER'}
        </button>
      </header>

      {showForm && (
        <form onSubmit={addSpeaker} className="bg-white/[0.02] border border-white/5 p-8 rounded-[40px] space-y-6 backdrop-blur-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-neutral-500 uppercase tracking-widest pl-2">Full Name</label>
              <div className="relative group">
                <Type className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" />
                <input required value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Jane Doe" className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-medium focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.04] transition-all text-white placeholder:text-neutral-600" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-neutral-500 uppercase tracking-widest pl-2">Title / Role</label>
              <div className="relative group">
                <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" />
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Chief Executive Officer" className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-medium focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.04] transition-all text-white placeholder:text-neutral-600" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-neutral-500 uppercase tracking-widest pl-2">Photo URL (Optional)</label>
            <div className="relative group">
              <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" />
              <input value={newLogoUrl} onChange={e => setNewLogoUrl(e.target.value)} placeholder="https://example.com/photo.jpg" className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-medium focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.04] transition-all text-white placeholder:text-neutral-600" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-neutral-500 uppercase tracking-widest pl-2">Short Bio</label>
            <div className="relative group h-24">
              <AlignLeft className="absolute left-5 top-5 w-5 h-5 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" />
              <textarea value={newBio} onChange={e => setNewBio(e.target.value)} placeholder="A brief description of the speaker..." className="w-full h-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-medium focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.04] transition-all text-white resize-none placeholder:text-neutral-600" />
            </div>
          </div>

          <button type="submit" className="w-full py-4 rounded-2xl bg-white/[0.05] hover:bg-indigo-500/10 text-white hover:text-indigo-400 border border-white/5 hover:border-indigo-500/30 font-black tracking-widest uppercase transition-all">
            Add Speaker
          </button>
        </form>
      )}

      {loading ? (
         <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
         </div>
      ) : speakers.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.02] rounded-[40px] border border-white/5">
          <UsersRound className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Speakers Added</h3>
          <p className="text-neutral-500 text-sm">Add speakers to showcase them in the mobile app schedule.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {speakers.map(speaker => (
            <div key={speaker.id} className={`p-6 rounded-[32px] border transition-all ${speaker.is_active ? 'bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20' : 'bg-white/[0.02] border-white/5 grayscale opacity-50'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/10 overflow-hidden flex items-center justify-center">
                  {speaker.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={speaker.logo_url} alt={speaker.name} className="w-full h-full object-cover" />
                  ) : (
                    <UsersRound className={`w-8 h-8 ${speaker.is_active ? 'text-indigo-400' : 'text-neutral-500'}`} />
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleStatus(speaker.id, speaker.is_active)} className="text-neutral-500 hover:text-white transition-colors">
                    {speaker.is_active ? <ToggleRight className="w-6 h-6 text-indigo-500" /> : <ToggleLeft className="w-6 h-6" />}
                  </button>
                  <button onClick={() => deleteSpeaker(speaker.id)} className="text-neutral-500 hover:text-red-500 transition-colors">
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-xl font-black text-white mb-1 tracking-tight">{speaker.name}</h3>
              <p className="text-indigo-400 font-bold mb-4 text-sm">{speaker.title || 'Guest Speaker'}</p>
              
              <p className="text-neutral-400 text-sm line-clamp-3 leading-relaxed">
                {speaker.bio || 'No biography provided.'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
