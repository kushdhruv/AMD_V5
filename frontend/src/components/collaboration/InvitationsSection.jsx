"use client";

import { useState, useEffect } from 'react';
import { Mail, Check, X, Users, Loader2 } from 'lucide-react';
import { getPendingInvites, acceptInvite, declineInvite } from '@/lib/supabase/collaboration';

export default function InvitationsSection() {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // ID of the invite being processed

  useEffect(() => {
    async function fetchInvites() {
      try {
        const data = await getPendingInvites();
        setInvites(data || []);
      } catch (err) {
        console.error("Failed to fetch invites:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchInvites();
  }, []);

  const handleAccept = async (id) => {
    setActionLoading(id);
    try {
      await acceptInvite(id);
      setInvites(prev => prev.filter(i => i.id !== id));
      // Reload page to show new collaborated items
      window.location.reload();
    } catch (err) {
      alert("Failed to accept invite: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (id) => {
    setActionLoading(id);
    try {
      await declineInvite(id);
      setInvites(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      alert("Failed to decline invite: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return null;
  if (invites.length === 0) return null;

  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Users className="text-primary" size={18} />
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Collaboration Invites</h2>
        <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
          {invites.length} NEW
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {invites.map((invite) => (
          <div key={invite.id} className="bg-neutral-900/50 border border-primary/20 rounded-2xl p-4 flex items-center justify-between gap-4 group hover:border-primary/40 transition shadow-lg shadow-primary/5">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Mail size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate capitalize">
                   {invite.entity_type} collaboration
                </p>
                <p className="text-neutral-500 text-xs truncate">
                  Invited by <span className="text-neutral-300">{invite.inviter?.display_name || invite.inviter?.email || "Someone"}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAccept(invite.id)}
                disabled={!!actionLoading}
                className="bg-primary hover:bg-orange-600 disabled:opacity-50 text-white p-2 rounded-lg transition"
                title="Accept"
              >
                {actionLoading === invite.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              </button>
              <button
                onClick={() => handleDecline(invite.id)}
                disabled={!!actionLoading}
                className="bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-400 p-2 rounded-lg transition"
                title="Decline"
              >
                {actionLoading === invite.id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
