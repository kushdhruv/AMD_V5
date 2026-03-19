
"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { 
  Home, Zap, Globe, Smartphone, Layers, ShoppingBag, 
  Settings, LogOut, Menu, X, PlusCircle, Newspaper 
} from 'lucide-react';
import { CreditsBadge } from "@/components/layout/credits-badge";

const SidebarItem = ({ icon: Icon, label, href, active, onClick }) => (
  <Link 
    href={href} 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active 
        ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(255,106,0,0.1)]' 
        : 'text-text-secondary hover:bg-white/5 hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </Link>
);

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push('/login');
      setUser(user);
    };
    getUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const closeMobile = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen text-white font-sans overflow-hidden">
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-50 h-full w-64 bg-background-secondary border-r border-white/5 flex flex-col transition-all duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20 lg:w-64'}
      `}>
        {/* Logo */}
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 hover:bg-white/5 transition-colors">
          <Link href="/" className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shrink-0">
               <Zap size={18} fill="currentColor" />
            </div>
            <span className={`ml-3 font-bold text-lg tracking-tight transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden lg:block'}`}>
              AI Event OS
            </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 text-text-secondary hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-20 md:pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <div className={`text-xs font-bold text-text-secondary uppercase mb-2 px-2 ${!sidebarOpen && 'md:hidden lg:block'}`}>Main</div>
            <SidebarItem icon={Home} label="Home" href="/dashboard" active={pathname === '/dashboard'} onClick={closeMobile} />
            
            <div className={`text-xs font-bold text-text-secondary uppercase mt-6 mb-2 px-2 ${!sidebarOpen && 'md:hidden lg:block'}`}>Builders</div>
            <SidebarItem icon={Globe} label="WebsiteBuilder" href="/dashboard/website-builder" active={pathname.startsWith('/dashboard/website-builder')} onClick={closeMobile} />
            <SidebarItem icon={Smartphone} label="AppBuilder V2" href="/dashboard/app-builder-v2" active={pathname.startsWith('/dashboard/app-builder-v2')} onClick={closeMobile} />
            <SidebarItem icon={PlusCircle} label="Generators" href="/dashboard/generators" active={pathname.startsWith('/dashboard/generators')} onClick={closeMobile} />
            
            <div className={`text-xs font-bold text-text-secondary uppercase mt-6 mb-2 px-2 ${!sidebarOpen && 'md:hidden lg:block'}`}>Explore</div>
            <SidebarItem icon={ShoppingBag} label="Marketplace" href="/dashboard/marketplace" active={pathname.startsWith('/dashboard/marketplace')} onClick={closeMobile} />
            <SidebarItem icon={Newspaper} label="What's New" href="/dashboard/whats-new" active={pathname.startsWith('/dashboard/whats-new')} onClick={closeMobile} />
            
            <div className="h-4" /> {/* Spacer */}
            <SidebarItem icon={Zap} label="Pricing" href="/dashboard/pricing" active={pathname.startsWith('/dashboard/pricing')} onClick={closeMobile} />
            <SidebarItem icon={Settings} label="Settings" href="/dashboard/settings" active={pathname.startsWith('/dashboard/settings')} onClick={closeMobile} />
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                    {user?.email?.[0].toUpperCase() || 'U'}
                </div>
                <div className={`flex-1 overflow-hidden transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden lg:block'}`}>
                    <div className="text-sm font-bold truncate">{user?.user_metadata?.full_name || 'User'}</div>
                    <div className="text-xs text-text-secondary truncate">{user?.email}</div>
                </div>
            </div>
            <button 
                onClick={handleSignOut}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/5 text-text-secondary hover:text-red-400 transition-colors ${!sidebarOpen && 'justify-center'}`}
            >
                <LogOut size={18} />
                <span className={`${sidebarOpen ? 'block' : 'hidden md:hidden lg:block'}`}>Sign Out</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header (Desktop & Mobile) */}
        <header className="h-16 border-b border-white/5 bg-background/50 backdrop-blur flex items-center px-6 justify-between shrink-0">
            <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 md:hidden">
                    <Menu size={24} />
                </button>
                <span className="font-bold text-lg md:hidden">Dashboard</span>
                <h2 className="hidden md:block font-bold text-lg opacity-80 capitalize">
                    {pathname.split('/').pop().replace(/-/g, ' ')}
                </h2>
            </div>
            
            <div className="flex items-center gap-4">
                <CreditsBadge />
            </div>
        </header>

        <main className="flex-1 overflow-y-auto relative">
            {children}
        </main>
      </div>

    </div>
  );
}
