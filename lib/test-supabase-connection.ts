import { supabase, isSupabaseMock } from './supabase';

/**
 * Tests the Supabase connection and performs basic operations
 * to verify that the integration is working correctly.
 */
async function testSupabaseConnection() {
  console.log('Starting Supabase connection test...');
  
  if (isSupabaseMock) {
    console.error('⚠️ Using mock Supabase client. Check your environment variables.');
    return {
      success: false,
      error: 'Missing Supabase credentials in environment variables'
    };
  }

  try {
    // Test 1: Verify authentication service is available
    console.log('Testing authentication service...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      throw new Error(`Auth service error: ${authError.message}`);
    }
    console.log('✅ Auth service is working');

    // Test 2: Verify database connection by querying the practice_sessions table
    console.log('Testing database connection...');
    const { data: dbData, error: dbError } = await supabase
      .from('practice_sessions')
      .select('id')
      .limit(1);
    
    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }
    console.log('✅ Database connection is working');

    // Test 3: Verify storage bucket access
    console.log('Testing storage access...');
    const { data: buckets, error: storageError } = await supabase
      .storage
      .listBuckets();
    
    if (storageError) {
      throw new Error(`Storage error: ${storageError.message}`);
    }
    console.log('✅ Storage access is working');
    console.log('Available buckets:', buckets.map(b => b.name).join(', '));

    return {
      success: true,
      authStatus: authData.session ? 'authenticated' : 'not authenticated',
      databaseStatus: 'connected',
      storageStatus: 'accessible',
      buckets: buckets.map(b => b.name)
    };
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export { testSupabaseConnection }; 