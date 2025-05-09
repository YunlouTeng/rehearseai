'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';

// Helper to check if we're in Chrome browser
const isChrome = () => {
  if (typeof window === 'undefined') return false;
  const userAgent = window.navigator.userAgent;
  return userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Safari") > -1;
};

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [chromeUser, setChromeUser] = useState<any>(null);
  const [showSetupError, setShowSetupError] = useState(false);

  // Check for Chrome localStorage fallback user data
  useEffect(() => {
    setIsClient(true);
    
    // For Chrome, check if we have a direct user in localStorage
    if (isChrome() && !user) {
      try {
        console.log('AuthGuard: Chrome detected, checking localStorage for user data');
        const storedUser = localStorage.getItem('rehearseai-user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          console.log('AuthGuard: Found user data in Chrome localStorage');
          setChromeUser(userData);
        }
      } catch (err) {
        console.error('Error reading user from localStorage:', err);
      }
    }
  }, [user]);

  // Handle initial load
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    // Show setup error if loading takes more than 2 seconds 
    // but only if we're not on login/signup pages
    if (isLoading && typeof window !== 'undefined') {
      const path = window.location.pathname;
      const isAuthPage = path.includes('/login') || path.includes('/signup');
      
      if (!isAuthPage) {
        timeoutId = setTimeout(() => {
          setShowSetupError(true);
        }, 2000);
      }
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading]);

  // If we're still in the server-rendering phase, render nothing to avoid hydration errors
  if (!isClient) {
    return null;
  }

  // If chrome-specific user is available, render content
  if (isChrome() && chromeUser) {
    console.log('AuthGuard: Using Chrome localStorage user:', chromeUser.id);
    return <>{children}</>;
  }

  // If user is available or we're still loading, render content
  if (user || isLoading) {
    return <>{children}</>;
  }

  // Show setup error with instructions
  if (showSetupError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">Configuration Issue Detected</h2>
          <p className="mb-4">
            There seems to be an issue with your Supabase connection. This could be due to:
          </p>
          <ul className="list-disc ml-5 mb-4 space-y-2">
            <li>Missing or incorrect environment variables</li>
            <li>Supabase project not properly set up</li>
            <li>Network connectivity issues</li>
          </ul>
          <div className="bg-gray-100 p-3 rounded mb-4 text-sm">
            <p className="font-bold">Debugging tip:</p>
            <p>Check your .env.local file for proper Supabase URL and anon key.</p>
          </div>
          <div className="flex space-x-4">
            <Link href="/setup-error" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex-1 text-center">
              View Detailed Error
            </Link>
            <Link href="/login" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex-1 text-center">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Default: Redirect to login
  router.push('/login');
  return null;
} 