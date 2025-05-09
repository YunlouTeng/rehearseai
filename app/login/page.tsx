'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isSupabaseMock } from '@/lib/supabase';

// Check if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isAuthenticated, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [browserInfo, setBrowserInfo] = useState<string>('');

  // Detect browser
  useEffect(() => {
    if (isBrowser) {
      const userAgent = window.navigator.userAgent;
      const isChrome = userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Safari") > -1;
      const isSafari = userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1;
      
      setBrowserInfo(`Browser: ${isChrome ? 'Chrome' : isSafari ? 'Safari' : 'Other'}`);
      
      // Check for third-party cookie blocking (common in Chrome)
      if (isChrome) {
        // Add specific Chrome debugging for cookies and localStorage
        try {
          // Test localStorage
          localStorage.setItem('authTest', 'test');
          const testValue = localStorage.getItem('authTest');
          localStorage.removeItem('authTest');
          
          setDebugInfo(prev => prev + `\nLocalStorage test: ${testValue === 'test' ? 'Working' : 'Failed'}`);
        } catch (e) {
          setDebugInfo(prev => prev + `\nLocalStorage error: ${e instanceof Error ? e.message : String(e)}`);
        }
        
        // Test cookies
        try {
          document.cookie = "authTestCookie=test; path=/; SameSite=Lax";
          const hasCookie = document.cookie.indexOf('authTestCookie=test') !== -1;
          setDebugInfo(prev => prev + `\nCookie test: ${hasCookie ? 'Working' : 'Failed'}`);
        } catch (e) {
          setDebugInfo(prev => prev + `\nCookie error: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
    }
  }, []);

  // Check if Supabase is initialized correctly
  useEffect(() => {
    const checkSupabaseConfig = async () => {
      try {
        // Get the current config
        const { data } = await supabase.auth.getSession();
        
        setDebugInfo(prev => prev + `\nSession check: ${data.session ? 'Has session' : 'No session'}`);
        setDebugInfo(prev => prev + `\nUsing mock client: ${isSupabaseMock}`);
        
        // Try to get configuration from window
        if (isBrowser && window.REHEARSEAI_CONFIG) {
          const hasConfig = !!(window.REHEARSEAI_CONFIG.supabase?.anonKey);
          setDebugInfo(prev => prev + `\nWindow config found: ${hasConfig}`);
          
          // Show the actual URL (but not the key for security reasons)
          if (window.REHEARSEAI_CONFIG.supabase?.url) {
            setDebugInfo(prev => prev + `\nURL: ${window.REHEARSEAI_CONFIG.supabase.url}`);
          }
        }
      } catch (err) {
        setDebugInfo(prev => prev + `\nError checking config: ${err instanceof Error ? err.message : String(err)}`);
      }
    };
    
    checkSupabaseConfig();
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    setDebugInfo(prev => prev + `\nAuth state: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}`);
    setDebugInfo(prev => prev + `\nAuth loading: ${authLoading}`);
    
    if (isAuthenticated) {
      setDebugInfo(prev => prev + '\nRedirecting to practice page');
      router.push('/practice');
    }
  }, [isAuthenticated, router, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDebugInfo(prev => `Form submitted\n${browserInfo}\n${prev}`);

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setIsLoading(true);
      setDebugInfo(prev => prev + '\nAttempting sign in');
      
      // Call Supabase directly for more control and debugging
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        setError(error.message);
        setDebugInfo(prev => prev + `\nSign in error: ${error.message}`);
        return;
      }
      
      // Log session information for debugging
      setDebugInfo(prev => prev + '\nSign in successful');
      setDebugInfo(prev => prev + `\nSession: ${data.session ? 'Created' : 'Missing'}`);
      
      if (data.session) {
        setDebugInfo(prev => prev + `\nUser ID: ${data.session.user.id.substring(0, 8)}...`);
        
        // Create a forced auth check mechanism
        const maxRetries = 3;
        let retries = 0;
        let success = false;
        
        const checkAuthState = async () => {
          try {
            // Force a new user check after successful login
            const { data: userData } = await supabase.auth.getUser();
            
            if (userData.user) {
              setDebugInfo(prev => prev + `\nForced auth check: User found`);
              success = true;
              
              // Force a full page navigation
              if (isBrowser) {
                setDebugInfo(prev => prev + '\nNavigating to practice page...');
                window.location.href = '/practice';
              }
              return;
            }
            
            setDebugInfo(prev => prev + `\nForced auth check: No user found (attempt ${retries + 1})`);
            
            // Try a few more times with a delay
            retries++;
            if (retries < maxRetries) {
              setDebugInfo(prev => prev + `\nRetrying auth check in 1 second...`);
              setTimeout(checkAuthState, 1000);
            } else if (!success) {
              setDebugInfo(prev => prev + `\nAuth check failed after ${maxRetries} attempts, forcing navigation`);
              // Force navigation even if checks fail
              if (isBrowser) {
                window.location.href = '/practice';
              }
            }
          } catch (err) {
            setDebugInfo(prev => prev + `\nError in forced auth check: ${err instanceof Error ? err.message : String(err)}`);
            // Force navigation even if checks fail
            if (isBrowser && !success && retries >= maxRetries - 1) {
              window.location.href = '/practice';
            }
          }
        };
        
        // Start the auth check process
        setTimeout(checkAuthState, 1000);
      } else {
        setDebugInfo(prev => prev + '\nWarning: No session after login!');
        setIsLoading(false);
      }
      
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during login';
      setError(errorMessage);
      setDebugInfo(prev => prev + `\nException: ${errorMessage}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white shadow rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Log in to RehearseAI</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              required
            />
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-md font-medium text-white 
              ${isLoading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
        
        {/* Debug information - always visible for troubleshooting browser issues */}
        {debugInfo && (
          <div className="mt-8 p-4 bg-gray-100 rounded-md">
            <h3 className="font-bold mb-2">Debug Information:</h3>
            <div className="text-xs mb-2">{browserInfo}</div>
            <pre className="text-xs whitespace-pre-wrap">{debugInfo}</pre>
          </div>
        )}
      </div>
    </div>
  );
} 