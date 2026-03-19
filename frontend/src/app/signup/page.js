
"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, Lock, Mail, User, ArrowRight } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    // 1. Sign up
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: name }
        }
    });

    if (error) {
        alert(error.message);
    } else {
        // 2. Insert into profiles (if using a trigger, may not be needed, but good practice)
        // For now, we rely on Supabase Auth.
        alert('Signup successful! Check your email for verification.');
        router.push('/login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden text-white font-sans">
       {/* Background */}
       <div className="absolute inset-0 bg-background" />
       <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[120px] animate-pulse-slow" />

       <div className="relative z-10 w-full max-w-md p-8 glass-card border border-white/10 shadow-2xl">
          <div className="text-center mb-8">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mb-4 text-white">
                  <Zap size={24} fill="currentColor" />
              </div>
              <h2 className="text-2xl font-bold">Create Account</h2>
              <p className="text-text-secondary text-sm mt-2">Join the AI Event Revolution</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-text-secondary ml-1">Full Name</label>
                  <div className="relative">
                      <User className="absolute left-3 top-2.5 text-neutral-500" size={18} />
                      <input 
                        type="text" 
                        required 
                        className="w-full bg-neutral-900/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:border-primary outline-none transition-colors"
                        placeholder="John Doe"
                        value={name}
                        onChange={e => setName(e.target.value)}
                      />
                  </div>
              </div>

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
                  <label className="text-xs font-bold uppercase text-text-secondary ml-1">Password</label>
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
                {loading ? "Creating Account..." : <>Get Started <ArrowRight size={16} /></>}
              </button>
          </form>

          <p className="text-center text-xs text-text-secondary mt-6">
              Already have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
       </div>
    </div>
  );
}
