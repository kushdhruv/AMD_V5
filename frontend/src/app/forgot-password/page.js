"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    if (error) {
      alert(error.message);
    } else {
      setMessage('Password reset instructions sent. Please check your email.');
    }
    setLoading(false);
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
              <h2 className="text-2xl font-bold">Reset Password</h2>
              <p className="text-text-secondary text-sm mt-2">Enter your email to receive recovery instructions</p>
          </div>

          <form onSubmit={handleReset} className="space-y-4">
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
                {loading ? "Sending..." : <>Send Reset Link <ArrowRight size={16} /></>}
              </button>
          </form>

          <p className="text-center text-xs text-text-secondary mt-6">
              Remembered your password? <Link href="/login" className="text-primary hover:underline">Back to Login</Link>
          </p>
       </div>
    </div>
  );
}
