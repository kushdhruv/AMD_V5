"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabase-client';
import { useParams } from 'next/navigation';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  ExternalLink,
  ShieldAlert,
  Loader2,
  Ticket,
  User,
  Hash
} from 'lucide-react';

export default function ApprovalsPage() {
  const params = useParams();
  const appId = params?.appId as string;
  
  const [pendingTickets, setPendingTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const fetchPendingTickets = async () => {
    if (!appId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('user_tickets')
      .select('*, event_tickets(name, price)')
      .eq('event_id', appId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (!error) setPendingTickets(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPendingTickets();
  }, [appId]);

  const handleAction = async (ticketId: string, status: 'successful' | 'failed') => {
    const confirmMsg = status === 'successful' ? "Confirm this payment?" : "Reject this payment?";
    if (!confirm(confirmMsg)) return;

    const { error } = await supabase
      .from('user_tickets')
      .update({ 
        status: status,
        // If successful, generate a simple QR string if not present
        qr_code: status === 'successful' ? `DirectUPI-${ticketId}` : null
      })
      .eq('id', ticketId);

    if (error) {
      alert("Error updating ticket: " + error.message);
    } else {
      setPendingTickets(pendingTickets.filter(t => t.id !== ticketId));
    }
  };

  const filteredTickets = pendingTickets.filter(t => 
    t.user_email?.toLowerCase().includes(filter.toLowerCase()) ||
    t.proof_utr?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10 mb-20">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-widest">
          <Clock className="w-4 h-4" />
          Verification Queue
        </div>
        <h1 className="text-5xl font-black tracking-tight text-white">Approvals</h1>
        <p className="text-neutral-500 text-lg max-w-2xl font-medium">
          Verify UTR numbers and screenshots against your bank statement to approve ticket access.
        </p>
      </header>

      <div className="relative group max-w-md">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-sky-400 transition-colors" />
        <input 
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Search by Email or UTR..." 
          className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-medium focus:outline-none focus:border-sky-500/50 focus:bg-white/[0.04] transition-all text-white placeholder:text-neutral-600" 
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.02] rounded-[40px] border border-white/5">
          <ShieldAlert className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Queue Empty</h3>
          <p className="text-neutral-500 text-sm">All pending payments have been processed. Great job!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map(ticket => (
            <div key={ticket.id} className="bg-white/[0.02] border border-white/5 p-6 rounded-[32px] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.04] transition-all">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-sky-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{ticket.user_email || 'Anonymous User'}</h4>
                    <p className="text-neutral-500 text-xs font-mono">{ticket.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <p className="text-[10px] font-black text-neutral-500 uppercase mb-1">Ticket Type</p>
                      <p className="text-sm font-bold text-white truncate">{ticket.event_tickets?.name || 'Unknown'}</p>
                   </div>
                   <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <p className="text-[10px] font-black text-neutral-500 uppercase mb-1">Amount</p>
                      <p className="text-sm font-bold text-green-400">₹{ticket.event_tickets?.price || '0'}</p>
                   </div>
                   <div className="p-3 rounded-xl bg-sky-500/5 border border-sky-500/10 col-span-2 md:col-span-1">
                      <p className="text-[10px] font-black text-sky-500 uppercase mb-1">UTR / Ref No.</p>
                      <p className="text-sm font-mono font-bold text-sky-400 break-all">{ticket.proof_utr || 'N/A'}</p>
                   </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => handleAction(ticket.id, 'successful')}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-black px-6 py-4 rounded-2xl font-black transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  APPROVE
                </button>
                <button 
                  onClick={() => handleAction(ticket.id, 'failed')}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/5 hover:bg-red-500/10 text-white hover:text-red-500 px-6 py-4 rounded-2xl font-black transition-all border border-white/5 hover:border-red-500/20 active:scale-95"
                >
                  <XCircle className="w-5 h-5" />
                  REJECT
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
