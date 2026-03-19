
"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Zap, Lock, Mail, ArrowRight, X, Github, Chrome } from 'lucide-react'; // Chrome as Google placeholder
import { motion, AnimatePresence } from 'framer-motion';

export function LoginModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
        setMode(initialMode);
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialMode]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let error;
    if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        error = signInError;
    } else {
        const { error: signUpError } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            }
        });
        error = signUpError;
    }

    if (error) {
        alert(error.message);
    } else {
        if (mode === 'signup') {
            alert('Check your email for the confirmation link!');
        }
        router.push('/dashboard');
        onClose();
    } 
    setLoading(false);
  };

  const handleSocialLogin = async (provider) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) alert(error.message);
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md"
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md pointer-events-auto"
            >
               <div className="relative p-8 glass-card border border-white/10 shadow-2xl overflow-hidden bg-[#0A0A0A]">
                    {/* Close Button */}
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                    >
                        <X size={20} />
                    </button>

                  <div className="text-center mb-6">
                      <div className="w-12 h-12 mx-auto bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mb-4 text-white">
                          <Zap size={24} fill="currentColor" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">
                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                      </h2>
                      <p className="text-text-secondary text-sm mt-2">
                        {mode === 'login' ? 'Sign in to your AI Event OS account' : 'Start building your event tech stack'}
                      </p>
                  </div>

                  {/* Social Login */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button 
                        onClick={() => handleSocialLogin('google')}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-white/5 transition-colors text-sm font-medium"
                    >
                        <Chrome size={18} /> Google
                    </button>
                    <button 
                         onClick={() => handleSocialLogin('github')}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-white/5 transition-colors text-sm font-medium"
                    >
                        <Github size={18} /> GitHub
                    </button>
                  </div>

                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0A0A0A] px-2 text-text-secondary">Or continue with</span></div>
                  </div>

                  <form onSubmit={handleAuth} className="space-y-4">
                      <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-text-secondary ml-1">Email</label>
                          <div className="relative">
                              <Mail className="absolute left-3 top-2.5 text-neutral-500" size={18} />
                              <input 
                                type="email" 
                                required 
                                className="w-full bg-neutral-900/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-primary outline-none transition-colors placeholder:text-neutral-600"
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
                                className="w-full bg-neutral-900/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-primary outline-none transition-colors placeholder:text-neutral-600"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                              />
                          </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-3 mt-4 rounded-lg bg-gradient-to-r from-primary to-secondary font-bold text-sm tracking-wide text-white hover:shadow-[0_0_20px_rgba(255,106,0,0.4)] transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? "Processing..." : <>{mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={16} /></>}
                      </button>
                  </form>

                  <p className="text-center text-xs text-text-secondary mt-6">
                      {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                      <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-primary hover:underline font-bold">
                        {mode === 'login' ? 'Create one free' : 'Sign In'}
                      </button>
                  </p>
               </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
