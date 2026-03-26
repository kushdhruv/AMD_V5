"use client";

import { useState } from 'react';
import { Users, X, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { inviteCollaborator } from '@/lib/supabase/collaboration';

export default function CollaborationModal({ isOpen, onClose, entityId, entityType, entityName }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }

  if (!isOpen) return null;

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setStatus(null);

    try {
      await inviteCollaborator(email, entityId, entityType);
      setStatus({ 
        type: 'success', 
        message: `Invitation sent to ${email}. They'll see it on their dashboard.` 
      });
      setEmail('');
    } catch (err) {
      console.error(err);
      setStatus({ 
        type: 'error', 
        message: err.message || "Failed to send invitation. Please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Share Collaboration</h2>
              <p className="text-neutral-500 text-xs">Invite others to edit "{entityName}"</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-neutral-800 rounded-lg text-neutral-500 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {status && (
            <div className={`p-4 rounded-xl flex items-start gap-3 border ${
              status.type === 'success' 
                ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {status.type === 'success' ? <CheckCircle2 size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
              <p className="text-sm">{status.message}</p>
            </div>
          )}

          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                Receiver's Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder:text-neutral-700 outline-none focus:ring-1 focus:ring-primary transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-primary hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-primary/20"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
              {loading ? "Sending..." : "Send Invitation"}
            </button>
          </form>

          <div className="pt-4 border-t border-neutral-800/50">
            <p className="text-[10px] text-neutral-500 text-center leading-relaxed">
              Collaborators will be granted <strong>Editor</strong> access. 
              They can modify, rename, and update this builder project.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
