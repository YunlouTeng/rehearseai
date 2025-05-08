'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isSupabaseMock } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isAuthenticated, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Check if Supabase is initialized correctly
  useEffect(() => {
    const checkSupabaseConfig = async () => {
      try {
        // Get the current config
        const { data } = await supabase.auth.getSession();
        
        setDebugInfo(prev => prev + `\nSession check: ${data.session ? 'Has session' : 'No session'}`);
        setDebugInfo(prev => prev + `\nUsing mock client: ${isSupabaseMock}`);
        
        // Try to get configuration from window
        if (typeof window !== 'undefined') {
          const hasConfig = !!window.REHEARSEAI_CONFIG?.supabase?.anonKey;
          setDebugInfo(prev => prev + `\nWindow config found: ${hasConfig}`);
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
    setDebugInfo('Form submitted');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setIsLoading(true);
      setDebugInfo(prev => prev + '\nAttempting sign in');
      
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
        setDebugInfo(prev => prev + `\nSign in error: ${error.message}`);
        return;
      }
      
      setDebugInfo(prev => prev + '\nSign in successful');
      // Login successful, redirect will happen via useEffect
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during login';
      setError(errorMessage);
      setDebugInfo(prev => prev + `\nException: ${errorMessage}`);
    } finally {
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
        
        {/* Debug information - only visible in development */}
        {process.env.NODE_ENV !== 'production' && debugInfo && (
          <div className="mt-8 p-4 bg-gray-100 rounded-md">
            <h3 className="font-bold mb-2">Debug Information:</h3>
            <pre className="text-xs whitespace-pre-wrap">{debugInfo}</pre>
          </div>
        )}
      </div>
    </div>
  );
} 