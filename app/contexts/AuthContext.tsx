'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, User, getCurrentUser } from '../../lib/supabase';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ data?: any, error: Error | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Console log helper with timestamp for debugging
const logWithTime = (message: string, data?: any) => {
  const time = new Date().toLocaleTimeString();
  console.log(`[${time}] ${message}`, data || '');
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize user session
  useEffect(() => {
    logWithTime('AuthProvider: Initializing');
    
    // Get initial user
    const initUser = async () => {
      try {
        // First check for existing session
        const { data } = await supabase.auth.getSession();
        logWithTime('AuthProvider: Initial session check', data.session ? 'Has session' : 'No session');
        
        if (data.session) {
          const user = await getCurrentUser();
          logWithTime('AuthProvider: Setting initial user', user);
          setUser(user);
        } else {
          logWithTime('AuthProvider: No initial user');
          setUser(null);
        }
      } catch (error) {
        console.error('Error getting initial user:', error);
      } finally {
        setIsLoading(false);
        logWithTime('AuthProvider: Initialization complete');
      }
    };

    // Set up auth state change listener
    const setupAuthListener = () => {
      logWithTime('AuthProvider: Setting up auth listener');
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        logWithTime(`AuthProvider: Auth state changed - ${event}`, session ? 'With session' : 'No session');
        
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const user = await getCurrentUser();
            logWithTime('AuthProvider: User signed in', user);
            
            if (user) {
              setUser(user);
              setIsLoading(false);
              logWithTime('AuthProvider: User state updated after sign in');
              
              // Force a brief timeout to ensure state is updated before any redirects
              setTimeout(() => {
                logWithTime('AuthProvider: State update confirmed after sign in');
              }, 100);
            } else {
              logWithTime('AuthProvider: Failed to get user data after sign in');
              setIsLoading(false);
            }
          } catch (err) {
            console.error('Error setting user after sign in:', err);
            setIsLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          logWithTime('AuthProvider: User signed out');
          setUser(null);
          setIsLoading(false);
        } else if (event === 'TOKEN_REFRESHED') {
          logWithTime('AuthProvider: Token refreshed');
          try {
            const user = await getCurrentUser();
            if (user) {
              setUser(user);
              logWithTime('AuthProvider: User updated after token refresh');
            }
            setIsLoading(false);
          } catch (err) {
            console.error('Error refreshing user after token refresh:', err);
            setIsLoading(false);
          }
        } else {
          // Always make sure we're not stuck in loading state
          setIsLoading(false);
        }
      });
      
      return subscription;
    };

    initUser();
    const subscription = setupAuthListener();

    return () => {
      logWithTime('AuthProvider: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      logWithTime('AuthContext: Signing in user', email);
      const response = await supabase.auth.signInWithPassword({ email, password });
      
      if (response.error) {
        logWithTime('AuthContext: Sign in error', response.error.message);
      } else {
        logWithTime('AuthContext: Sign in successful', response.data.user?.id);
      }
      
      return response;
    } catch (error) {
      logWithTime('AuthContext: Sign in exception', error);
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return { error: new Error('Cannot reset password during server-side rendering') };
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOutUser = async () => {
    logWithTime('AuthContext: Signing out user');
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut: signOutUser,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 