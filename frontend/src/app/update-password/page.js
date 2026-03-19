"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
         // The user isn't logged in, meaning the link is invalid or expired
         // We won't block them entirely here in case the auth state is still loading,
         // but ideally they should be logged in from clicking the magic link.
      }
    });
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      setMessage('Password updated successfully. Redirecting to dashboard...');
      setTimeout(() => router.push('/dashboard'), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden text-white font-sans">
       <div className="absolute inset-0 bg-background" />
       <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow" />

       <div className="relative z-10 w-full max-w-md p-8 glass-card border border-white/10 shadow-2xl">
          <div className="text-center mb-8">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mb-4 text-white">
                  <ShieldCheck size={24} fill="currentColor" />
              </div>
              <h2 className="text-2xl font-bold">Set New Password</h2>
              <p className="text-text-secondary text-sm mt-2">Enter your new secure password below.</p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-text-secondary ml-1">New Password</label>
                  <div className="relative">
                      <Lock className="absolute left-3 top-2.5 text-neutral-500" size={18} />
                      <input 
                        type="password" 
                        required 
                        className="w-full bg-neutral-900/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:border-primary outline-none transition-colors"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                      />
                  </div>
              </div>

              {message && (
                  <div className="text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg p-3 text-center">
                    {message}
                  </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 mt-4 rounded-lg bg-gradient-to-r from-primary to-secondary font-bold text-sm tracking-wide hover:shadow-[0_0_20px_rgba(255,106,0,0.4)] transition-all flex items-center justify-center gap-2"
              >
                {loading ? "Updating..." : <>Update Password <ArrowRight size={16} /></>}
              </button>
          </form>
       </div>
    </div>
  );
}
