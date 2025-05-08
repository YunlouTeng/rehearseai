import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Use default values for development to prevent crashes
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key-for-development';

// Create a mock client if credentials are using the defaults
const isMockClient = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Configure with options for better behavior in production environments like Netlify
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email || undefined,
    name: user.user_metadata?.name as string | undefined,
  };
}

export async function signOut() {
  return supabase.auth.signOut();
} 