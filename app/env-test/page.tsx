'use client';

import { useState, useEffect } from 'react';
import runtimeConfig from '../../lib/runtime-config';

// Define type for window config
declare global {
  interface Window {
    REHEARSEAI_CONFIG?: {
      supabase?: {
        url?: string;
        anonKey?: string;
      };
    };
  }
}

export default function EnvTestPage() {
  const [config, setConfig] = useState<any>(null);
  const [windowConfig, setWindowConfig] = useState<any>(null);
  const [envVars, setEnvVars] = useState<any>(null);

  useEffect(() => {
    // Get values from runtime config
    setConfig({
      supabaseUrl: runtimeConfig.supabase.url,
      supabaseKeyFirstChars: runtimeConfig.supabase.anonKey 
        ? `${runtimeConfig.supabase.anonKey.substring(0, 5)}...` 
        : 'not set'
    });

    // Get values from window config
    if (typeof window !== 'undefined' && window.REHEARSEAI_CONFIG) {
      const config = window.REHEARSEAI_CONFIG;
      setWindowConfig({
        supabaseUrl: config.supabase?.url || 'not set',
        supabaseKeyFirstChars: config.supabase?.anonKey
          ? `${config.supabase.anonKey.substring(0, 5)}...`
          : 'not set'
      });
    } else {
      setWindowConfig({ status: 'Window config not available' });
    }

    // Get values from process.env
    setEnvVars({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not set',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 5)}...`
        : 'not set'
    });
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Environment Variables Test</h1>
      
      <div className="mb-6 p-4 bg-white shadow rounded">
        <h2 className="font-bold mb-2">Runtime Config Values:</h2>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
          {JSON.stringify(config, null, 2)}
        </pre>
      </div>
      
      <div className="mb-6 p-4 bg-white shadow rounded">
        <h2 className="font-bold mb-2">Window Config Values:</h2>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
          {JSON.stringify(windowConfig, null, 2)}
        </pre>
      </div>
      
      <div className="mb-6 p-4 bg-white shadow rounded">
        <h2 className="font-bold mb-2">process.env Values:</h2>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
          {JSON.stringify(envVars, null, 2)}
        </pre>
      </div>
      
      <div className="mt-6">
        <p className="text-red-600 font-bold">
          Note: If you see "example.supabase.co" or "not set" values, your environment variables are not being loaded properly.
        </p>
      </div>
    </div>
  );
} 