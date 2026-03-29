"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabase-client';
import { useParams } from 'next/navigation';
import { 
  Ticket, 
  Plus, 
  Trash2, 
  CreditCard, 
  Banknote,
  Tag,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Zap,
  Loader2
} from 'lucide-react';

export default function TicketsAdminPage() {
  const params = useParams();
  const appId = params?.appId as string;
  
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const fetchTickets = async () => {
    if (!appId) return;
    const { data, error } = await supabase
      .from('event_tickets')
      .select('*')
      .eq('event_id', appId)
      .order('created_at', { ascending: false });
    
    if (!error) setTickets(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, [appId]);

  const addTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice) return alert("Name and price are required");
    
    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum) || priceNum < 0) return alert("Invalid price");

    const { data, error } = await supabase
      .from('event_tickets')
      .insert({
        event_id: appId,
        name: newName,
        price: priceNum,
        description: newDesc,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      alert("Error adding ticket: " + error.message);
    } else {
      setTickets([data, ...tickets]);
      setShowForm(false);
      setNewName("");
      setNewPrice("");
      setNewDesc("");
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('event_tickets')
      .update({ is_active: !currentStatus })
      .eq('id', id);
      
    if (!error) {
      setTickets(tickets.map(t => t.id === id ? { ...t, is_active: !currentStatus } : t));
    }
  };

  const deleteTicket = async (id: string) => {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    const { error } = await supabase.from('event_tickets').delete().eq('id', id);
    if (!error) {
      setTickets(tickets.filter(t => t.id !== id));
    } else {
      alert("Cannot delete ticket. It might be linked to user purchases.");
    }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10 mb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-green-400 font-bold text-xs uppercase tracking-widest">
            <Ticket className="w-4 h-4" />
            Revenue & Access
          </div>
          <h1 className="text-5xl font-black tracking-tight text-white">Tickets</h1>
          <p className="text-neutral-500 text-lg max-w-2xl font-medium">
            Generate QR entry tickets, set dynamic pricing, and control global access to your event.
          </p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black px-6 py-4 rounded-2xl font-black transition-all hover:shadow-lg hover:shadow-green-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          {showForm ? 'CANCEL' : 'NEW TICKET'}
        </button>
      </header>

      {showForm && (
        <form onSubmit={addTicket} className="bg-white/[0.02] border border-white/5 p-8 rounded-[40px] space-y-6 backdrop-blur-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-neutral-500 uppercase tracking-widest pl-2">Ticket Name</label>
              <div className="relative group">
                <Tag className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-green-400 transition-colors" />
                <input required value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. VIP Access, General Entry" className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-medium focus:outline-none focus:border-green-500/50 focus:bg-white/[0.04] transition-all text-white placeholder:text-neutral-600" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-neutral-500 uppercase tracking-widest pl-2">Price (INR)</label>
              <div className="relative group">
                <Banknote className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-green-400 transition-colors" />
                <input required type="number" step="0.01" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="0.00 for free entry" className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-medium focus:outline-none focus:border-green-500/50 focus:bg-white/[0.04] transition-all text-white placeholder:text-neutral-600" />
                {newPrice === "0" && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1 bg-sky-500/20 text-sky-400 rounded-full border border-sky-500/20 text-[10px] font-bold uppercase">
                    <Zap className="w-3 h-3" /> Bypasses Payments
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-neutral-500 uppercase tracking-widest pl-2">Description</label>
            <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="What does this ticket grant access to?" className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 px-6 text-sm font-medium focus:outline-none focus:border-green-500/50 focus:bg-white/[0.04] transition-all text-white h-24 resize-none placeholder:text-neutral-600" />
          </div>
          <button type="submit" className={`w-full py-4 rounded-2xl font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${newPrice === "0" ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30' : 'bg-white/[0.05] hover:bg-green-500/10 text-white hover:text-green-400 border border-white/5 hover:border-green-500/30'}`}>
            {newPrice === "0" ? <Zap className="w-4 h-4" /> : null}
            {newPrice === "0" ? 'DEPLOY FREE PASS' : 'DEPLOY PAID TICKET'}
          </button>
        </form>
      )}

      {loading ? (
         <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
         </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.02] rounded-[40px] border border-white/5">
          <Ticket className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Tickets Active</h3>
          <p className="text-neutral-500 text-sm">Create a ticket to enable the checkout UI in the mobile app.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map(ticket => (
            <div key={ticket.id} className={`p-6 rounded-[32px] border transition-all ${ticket.is_active ? 'bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20' : 'bg-white/[0.02] border-white/5 grayscale opacity-50'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/10">
                  <CreditCard className={`w-5 h-5 ${ticket.is_active ? 'text-green-400' : 'text-neutral-500'}`} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleStatus(ticket.id, ticket.is_active)} className="text-neutral-500 hover:text-white transition-colors">
                    {ticket.is_active ? <ToggleRight className="w-6 h-6 text-green-500" /> : <ToggleLeft className="w-6 h-6" />}
                  </button>
                  <button onClick={() => deleteTicket(ticket.id)} className="text-neutral-500 hover:text-red-500 transition-colors">
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-2xl font-black text-white mb-1 tracking-tight">{ticket.name}</h3>
              <p className="text-neutral-400 text-sm line-clamp-2 h-10 mb-6">{ticket.description || 'No description provided'}</p>
              
              <div className="flex items-end justify-between pt-6 border-t border-white/5">
                <div>
                  <p className="text-[10px] font-black tracking-widest uppercase text-neutral-500 mb-1">Price</p>
                  <p className="text-3xl font-black text-white">
                    {ticket.price > 0 ? `₹${ticket.price}` : 'FREE'}
                  </p>
                </div>
                {ticket.is_active && (
                  <div className="flex items-center gap-1 text-green-400 text-[10px] font-bold uppercase tracking-widest bg-green-500/10 px-3 py-1.5 rounded-full">
                    <Zap className="w-3 h-3" /> Live
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
