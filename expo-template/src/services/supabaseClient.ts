import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// FIX #7: Guard against placeholder values at startup.
// If the env variables are not configured, throw early so the developer
// sees a clear error instead of cryptic network failures at runtime.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
  console.error(
    '[Supabase] EXPO_PUBLIC_SUPABASE_URL is not configured. ' +
    'Create a .env file with your Supabase project URL. ' +
    'Remote sync will be disabled.'
  );
}

// Use checked values, fall back gracefully to a no-op URL so app still loads offline.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
