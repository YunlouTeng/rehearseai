'use client';

import { useState } from 'react';
import { supabase, isSupabaseMock } from '../../lib/supabase';

export default function SupabaseConnectionTest() {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runConnectionTest() {
    setIsLoading(true);
    setError(null);
    setTestResults(null);
    
    try {
      // Check if using mock client
      if (isSupabaseMock) {
        throw new Error('Using mock Supabase client. Check your environment variables.');
      }

      // Test 1: Auth service
      const authResult = await supabase.auth.getSession();
      
      // Test 2: Database connection
      const dbResult = await supabase
        .from('practice_sessions')
        .select('id')
        .limit(1);
      
      // Test 3: Storage access
      const storageResult = await supabase
        .storage
        .listBuckets();

      setTestResults({
        success: true,
        auth: {
          status: authResult.error ? 'error' : 'success',
          error: authResult.error?.message,
          session: authResult.data?.session ? 'active' : 'none'
        },
        database: {
          status: dbResult.error ? 'error' : 'success',
          error: dbResult.error?.message,
          data: dbResult.data
        },
        storage: {
          status: storageResult.error ? 'error' : 'success',
          error: storageResult.error?.message,
          buckets: storageResult.data?.map(b => b.name)
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Supabase Connection Test</h2>
      
      <button
        onClick={runConnectionTest}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isLoading ? 'Testing...' : 'Test Connection'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      {testResults && (
        <div className="mt-4">
          <h3 className="font-bold text-lg">
            Test Results: 
            <span className={testResults.success ? "text-green-600" : "text-red-600"}>
              {testResults.success ? " SUCCESS" : " FAILED"}
            </span>
          </h3>
          
          <div className="mt-2 space-y-3">
            <div className="p-2 border rounded">
              <p className="font-semibold">Auth Service:</p>
              <p className={`${testResults.auth.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                Status: {testResults.auth.status}
              </p>
              {testResults.auth.error && <p className="text-red-600">Error: {testResults.auth.error}</p>}
              <p>Session: {testResults.auth.session}</p>
            </div>
            
            <div className="p-2 border rounded">
              <p className="font-semibold">Database:</p>
              <p className={`${testResults.database.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                Status: {testResults.database.status}
              </p>
              {testResults.database.error && <p className="text-red-600">Error: {testResults.database.error}</p>}
            </div>
            
            <div className="p-2 border rounded">
              <p className="font-semibold">Storage:</p>
              <p className={`${testResults.storage.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                Status: {testResults.storage.status}
              </p>
              {testResults.storage.error && <p className="text-red-600">Error: {testResults.storage.error}</p>}
              {testResults.storage.buckets && (
                <div>
                  <p className="font-semibold mt-1">Available buckets:</p>
                  <ul className="list-disc pl-5">
                    {testResults.storage.buckets.length > 0 ? (
                      testResults.storage.buckets.map((bucket: string, i: number) => (
                        <li key={i}>{bucket}</li>
                      ))
                    ) : (
                      <li>No buckets found</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 