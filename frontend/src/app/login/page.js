
"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, Lock, Mail, ArrowRight, Github } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else router.push('/dashboard');
    setLoading(false);
  };

  const handleOAuthLogin = async (provider) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      alert(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden text-white font-sans">
       {/* Background */}
       <div className="absolute inset-0 bg-background" />
       <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow" />

       <div className="relative z-10 w-full max-w-md p-8 glass-card border border-white/10 shadow-2xl">
          <div className="text-center mb-8">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mb-4 text-white">
                  <Zap size={24} fill="currentColor" />
              </div>
              <h2 className="text-2xl font-bold">Welcome Back</h2>
              <p className="text-text-secondary text-sm mt-2">Sign in to your AI Event OS account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-text-secondary ml-1">Email</label>
                  <div className="relative">
                      <Mail className="absolute left-3 top-2.5 text-neutral-500" size={18} />
                      <input 
                        type="email" 
                        required 
                        className="w-full bg-neutral-900/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:border-primary outline-none transition-colors"
                        placeholder="you@university.edu"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                  </div>
              </div>

              <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                      <label className="text-xs font-bold uppercase text-text-secondary">Password</label>
                      <Link href="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
                  </div>
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

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 mt-4 rounded-lg bg-gradient-to-r from-primary to-secondary font-bold text-sm tracking-wide hover:shadow-[0_0_20px_rgba(255,106,0,0.4)] transition-all flex items-center justify-center gap-2"
              >
                {loading ? "Signing In..." : <>Sign In <ArrowRight size={16} /></>}
              </button>
          </form>

          <div className="mt-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-text-secondary uppercase tracking-widest font-semibold">Or</span>
              <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
              <button 
                type="button" 
                disabled={loading}
                onClick={() => handleOAuthLogin('google')}
                className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
              </button>
              <button 
                type="button" 
                disabled={loading}
                onClick={() => handleOAuthLogin('github')}
                className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                  <Github className="w-4 h-4" />
                  GitHub
              </button>
          </div>

          <p className="text-center text-xs text-text-secondary mt-6">
              Don't have an account? <Link href="/signup" className="text-primary hover:underline">Create one free</Link>
          </p>
       </div>
    </div>
  );
}
