
"use client";

import { useEffect, useState } from "react";
import { Coins, Plus } from "lucide-react";
import { getUserEconomy } from "@/lib/economy";
import { supabase } from "@/lib/supabase/client";
import Link from 'next/link';

export function CreditsBadge() {
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCredits = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { credits: c } = await getUserEconomy(user.id);
      setCredits(c);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
    
    // Optional: Subscribe to changes or just refresh interval
    // For MVP, just fetch on mount.
    const interval = setInterval(fetchCredits, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="h-8 w-24 bg-white/5 rounded-full animate-pulse" />;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-yellow-500/30 text-yellow-500 text-sm font-bold shadow-[0_0_10px_rgba(234,179,8,0.1)]">
        <Coins size={14} />
        <span>{credits ?? 0}</span>
      </div>
      <Link href="/dashboard/pricing" className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white hover:scale-110 transition-transform shadow-[0_0_10px_rgba(255,106,0,0.4)]">
        <Plus size={16} />
      </Link>
    </div>
  );
}
