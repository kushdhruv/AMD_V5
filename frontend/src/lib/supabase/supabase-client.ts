import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      get(name: string) {
        if (typeof document === 'undefined') return undefined;
        const cookie = document.cookie.split('; ').find((row) => row.startsWith(`${name}=`));
        return cookie ? decodeURIComponent(cookie.split('=')[1]) : undefined;
      },
      set(name: string, value: string, options: any) {
        if (typeof document === 'undefined') return;
        let cookieString = `${name}=${encodeURIComponent(value)}`;
        if (options.path) cookieString += `; path=${options.path}`;
        if (options.maxAge) cookieString += `; max-age=${options.maxAge}`;
        
        const hostname = window.location.hostname;
        const isSecure = window.location.protocol === 'https:';
        
        if (options.domain && hostname !== 'localhost' && hostname !== '127.0.0.1') {
          cookieString += `; domain=${options.domain}`;
        }
        
        if (options.secure && isSecure) cookieString += '; secure';
        if (options.sameSite) cookieString += `; samesite=${options.sameSite}`;
        
        console.log(`[Supabase Cookie Set] ${name} (Secure: ${isSecure})`);
        document.cookie = cookieString;
      },
      remove(name: string, options: any) {
        if (typeof document === 'undefined') return;
        document.cookie = `${name}=; path=${options.path || '/'}; max-age=0; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
      },
    },
  }
);

// FORCE SYNC: Migrate LocalStorage session to Cookies for SSR compatibility
export const syncSessionToCookies = async () => {
  if (typeof window === 'undefined') return;
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1].split('.')[0];
  if (!projectRef) return;

  const cookieName = `sb-${projectRef}-auth-token`;
  const cookieValue = JSON.stringify(session);
  const isSecure = window.location.protocol === 'https:';
  
  let cookieString = `${cookieName}=${encodeURIComponent(cookieValue)}; path=/; max-age=3600; samesite=Lax`;
  if (isSecure) cookieString += '; secure';
  
  console.log(`[Supabase Manual Sync] Setting ${cookieName}`);
  document.cookie = cookieString;
};

if (typeof window !== 'undefined') {
  console.log("[Supabase Sync] Initializing cookie sync...");
  
  supabase.auth.onAuthStateChange((event, session) => {
    console.log(`[Supabase Auth Event] ${event}`);
    if (session) syncSessionToCookies();
  });

  syncSessionToCookies();
}
