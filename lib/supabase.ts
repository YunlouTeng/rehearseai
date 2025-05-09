import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import runtimeConfig from './runtime-config';

// Check if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

// Debug log helper with timestamp
const logDebug = (message: string, data?: any) => {
  const time = new Date().toLocaleTimeString();
  console.log(`[${time}] [Supabase] ${message}`, data || '');
};

// Log configuration in development (without exposing keys)
if (process.env.NODE_ENV !== 'production' && isBrowser) {
  logDebug(`URL: ${runtimeConfig.supabase.url}`);
  logDebug(`Key available: ${Boolean(runtimeConfig.supabase.anonKey)}`);
  logDebug(`Window config available: ${Boolean(window.REHEARSEAI_CONFIG?.supabase)}`);
  
  // Log browser information for debugging
  const userAgent = window.navigator.userAgent;
  const isChrome = userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Safari") > -1;
  const isSafari = userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1;
  logDebug(`Browser: ${isChrome ? 'Chrome' : isSafari ? 'Safari' : 'Other'}`);
}

// Get values from runtime config with fallbacks
const supabaseUrl = runtimeConfig.supabase.url || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = runtimeConfig.supabase.anonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key-for-development';

// Create a mock client if credentials are using the defaults
const isMockClient = supabaseUrl === 'https://example.supabase.co' || !supabaseAnonKey;

if (isMockClient && isBrowser) {
  console.warn('[Supabase] Using mock client - this will not work for authentication');
  console.warn('[Supabase] URL:', supabaseUrl);
  console.warn('[Supabase] Missing API key:', !supabaseAnonKey);
}

// Define browser-specific auth options
const getBrowserAuthOptions = () => {
  logDebug('Creating browser auth config');
  return {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
    storage: localStorage,
    // Add additional debugging for auth events
    debug: process.env.NODE_ENV !== 'production',
    // Ensure proper URL redirects - use 'implicit' as a string (matching AuthFlowType)
    flowType: 'implicit' as const
  };
};

// Create authentication options with browser-safe localStorage usage
const authOptions = isBrowser 
  ? getBrowserAuthOptions()
  : {
      // For server-side rendering, use minimal options without storage
      autoRefreshToken: false,
      persistSession: false
    };

// Log auth configuration
if (isBrowser) {
  logDebug('Auth configuration', { 
    persistSession: authOptions.persistSession,
    storage: isBrowser ? 'localStorage' : 'none'
  });
}

// Create the Supabase client with appropriate options
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: authOptions,
  global: {
    // Add request and response handling for debugging
    fetch: async (url, options) => {
      const startTime = Date.now();
      try {
        const response = await fetch(url, options);
        const endTime = Date.now();
        
        if (!response.ok && isBrowser) {
          logDebug(`API request failed: ${url}`, {
            status: response.status,
            statusText: response.statusText,
            time: endTime - startTime
          });
        }
        
        return response;
      } catch (error) {
        if (isBrowser) {
          logDebug(`API request error: ${url}`, error);
        }
        throw error;
      }
    }
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
    if (isBrowser) {
      logDebug('Getting current user');
    }
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      if (isBrowser) {
        console.error('[Supabase] Error getting current user:', error.message);
      }
      return null;
    }
    
    if (!user) {
      if (isBrowser) {
        logDebug('No user found in auth response');
      }
      return null;
    }
    
    // Log detailed user information for debugging
    if (isBrowser) {
      logDebug('Raw user data received', { 
        id: user.id,
        hasEmail: !!user.email,
        hasMetadata: !!user.user_metadata,
        createdAt: user.created_at
      });
    }
    
    const userData = {
      id: user.id,
      email: user.email || undefined,
      name: user.user_metadata?.name as string | undefined,
    };
    
    if (isBrowser) {
      logDebug('Current user retrieved', { id: userData.id, email: userData.email });
    }
    
    return userData;
  } catch (err) {
    if (isBrowser) {
      console.error('[Supabase] Exception in getCurrentUser:', err);
    }
    return null;
  }
}

export async function signOut() {
  if (isBrowser) {
    logDebug('Signing out user');
  }
  return supabase.auth.signOut();
} 