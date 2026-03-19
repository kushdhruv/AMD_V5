
"use client";

import { useState, useEffect } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { addDemoCredits } from "@/lib/economy";

export default function SettingsPage() {
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user?.email);
        setUserId(user?.id);
      }
    })();
  }, []);

  const handleDemoCredits = async () => {
    if (!userId) return;
    setLoading(true);
    const success = await addDemoCredits(userId);
    setLoading(false);
    if (success) {
      alert("1000 Demo credits granted successfully! Refresh to see balance.");
    } else {
      alert("Failed to grant demo credits.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
        <SettingsIcon className="text-neutral-500" />
        Settings
      </h1>

      <div className="space-y-6">
        <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
          <h3 className="font-bold text-white mb-4">Account</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-neutral-800">
              <span className="text-neutral-400 text-sm">Email</span>
              <span className="text-white text-sm">{userEmail || "—"}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-neutral-800">
              <span className="text-neutral-400 text-sm">Plan</span>
              <span className="text-primary text-sm font-bold">Free Tier</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-neutral-800">
              <span className="text-neutral-400 text-sm">Developer Testing</span>
              <button 
                onClick={handleDemoCredits}
                disabled={loading || !userId}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {loading ? "Adding..." : "Get 1000 Demo Credits"}
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30 opacity-50">
          <h3 className="font-bold text-white mb-4">API Keys (Coming Soon)</h3>
          <p className="text-sm text-neutral-500">Manage your custom API keys for higher rate limits.</p>
        </div>
      </div>
    </div>
  );
}
