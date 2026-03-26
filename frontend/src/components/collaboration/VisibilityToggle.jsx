"use client";

import { useState } from 'react';
import { Eye, EyeOff, Globe, Lock, Loader2 } from 'lucide-react';
import { toggleVisibility } from '@/lib/supabase/collaboration';

export default function VisibilityToggle({ entityId, entityType, initialIsPublic }) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
        const newState = !isPublic;
        await toggleVisibility(entityId, entityType, newState);
        setIsPublic(newState);
    } catch (err) {
        console.error("Failed to toggle visibility:", err);
        alert("Failed to update visibility. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
        isPublic 
          ? 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20' 
          : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-700'
      }`}
      title={isPublic ? "Visible in Marketplace" : "Private (only you can see)"}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : isPublic ? (
        <Globe size={14} />
      ) : (
        <Lock size={14} />
      )}
      <span className="text-[10px] font-bold uppercase tracking-wider">
        {loading ? "Updating..." : isPublic ? "Public" : "Private"}
      </span>
    </button>
  );
}
