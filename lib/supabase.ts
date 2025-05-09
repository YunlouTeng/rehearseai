import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import runtimeConfig from './runtime-config';

// Log configuration in development (without exposing keys)
if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
  console.log(`[Supabase] URL: ${runtimeConfig.supabase.url}`);
  console.log(`[Supabase] Key available: ${Boolean(runtimeConfig.supabase.anonKey)}`);
  console.log(`[Supabase] Window config available: ${Boolean(window.REHEARSEAI_CONFIG?.supabase)}`);
  
  // Log browser information for debugging
  const userAgent = window.navigator.userAgent;
  const isChrome = userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Safari") > -1;
  const isSafari = userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1;
  console.log(`[Supabase] Browser: ${isChrome ? 'Chrome' : isSafari ? 'Safari' : 'Other'}`);
}

// Get values from runtime config with fallbacks
const supabaseUrl = runtimeConfig.supabase.url || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = runtimeConfig.supabase.anonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key-for-development';

// Create a mock client if credentials are using the defaults
const isMockClient = supabaseUrl === 'https://example.supabase.co' || !supabaseAnonKey;

if (isMockClient && typeof window !== 'undefined') {
  console.warn('[Supabase] Using mock client - this will not work for authentication');
  console.warn('[Supabase] URL:', supabaseUrl);
  console.warn('[Supabase] Missing API key:', !supabaseAnonKey);
}

// Determine storage type based on browser
// localStorage is more reliable in Chrome due to third-party cookie issues
const getStorageType = () => {
  if (typeof window !== 'undefined') {
    const userAgent = window.navigator.userAgent;
    const isChrome = userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Safari") > -1;
    
    if (isChrome) {
      console.log('[Supabase] Using localStorage for Chrome');
      return 'localStorage';
    }
  }
  // Default to using cookies with fallback to localStorage
  return 'cookieStorage';
};

// Always use localStorage with Supabase Auth
// This is more reliable for cross-browser compatibility including Chrome
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
    storage: localStorage
  }
});

// Add a flag to check if we're using a mock client
export const isSupabaseMock = isMockClient;

// Auth helpers
export type User = {
  id: string;
  email?: string;
  name?: string;
};

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('[Supabase] Error getting current user:', error.message);
      return null;
    }
    
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email || undefined,
      name: user.user_metadata?.name as string | undefined,
    };
  } catch (err) {
    console.error('[Supabase] Exception in getCurrentUser:', err);
    return null;
  }
}

export async function signOut() {
  return supabase.auth.signOut();
} 