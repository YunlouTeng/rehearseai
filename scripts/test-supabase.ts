// Load environment variables from .env.local
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { testSupabaseConnection } from '../lib/test-supabase-connection';

async function main() {
  console.log('=== SUPABASE CONNECTION TEST ===');
  
  const result = await testSupabaseConnection();
  
  console.log('\n=== TEST RESULTS ===');
  console.log(JSON.stringify(result, null, 2));
  
  if (!result.success) {
    console.error('\n❌ Supabase connection test failed!');
    process.exit(1);
  }
  
  console.log('\n✅ Supabase connection test successful!');
}

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
}); 