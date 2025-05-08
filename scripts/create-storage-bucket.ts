// Load environment variables from .env.local
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { supabase, isSupabaseMock } from '../lib/supabase';

async function createStorageBucket() {
  console.log('=== CREATING SUPABASE STORAGE BUCKET ===');
  
  if (isSupabaseMock) {
    console.error('⚠️ Using mock Supabase client. Check your environment variables.');
    process.exit(1);
  }
  
  try {
    // First check if the bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw new Error(`Failed to list buckets: ${listError.message}`);
    }
    
    console.log('Existing buckets:', buckets.map(b => b.name).join(', ') || 'None');
    
    // Check if interview-recordings bucket exists
    const bucketExists = buckets.some(b => b.name === 'interview-recordings');
    
    if (bucketExists) {
      console.log('✅ "interview-recordings" bucket already exists');
    } else {
      // Create the interview-recordings bucket
      console.log('Creating "interview-recordings" bucket...');
      const { data, error } = await supabase.storage.createBucket('interview-recordings', { 
        public: true,
        fileSizeLimit: 50000000, // 50MB limit
        allowedMimeTypes: ['video/webm', 'video/mp4']
      });
      
      if (error) {
        throw new Error(`Failed to create bucket: ${error.message}`);
      }
      
      console.log('✅ Successfully created "interview-recordings" bucket');
    }
    
    // Set up RLS policies for the bucket
    console.log('Setting up Row Level Security policies...');
    const policies = [
      // Allow authenticated users to upload files
      {
        name: 'Allow authenticated uploads',
        definition: `
          CREATE POLICY "Allow authenticated uploads" 
          ON storage.objects 
          FOR INSERT 
          TO authenticated 
          WITH CHECK (bucket_id = 'interview-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);
        `
      },
      // Allow users to update and delete their own files
      {
        name: 'Allow users to manage their own files',
        definition: `
          CREATE POLICY "Allow users to manage their own files" 
          ON storage.objects 
          FOR ALL 
          TO authenticated 
          USING (bucket_id = 'interview-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);
        `
      },
      // Allow public read access to all files
      {
        name: 'Allow public read access',
        definition: `
          CREATE POLICY "Allow public read access" 
          ON storage.objects 
          FOR SELECT 
          TO public 
          USING (bucket_id = 'interview-recordings');
        `
      }
    ];
    
    console.log('Note: RLS policies need to be set up in the Supabase dashboard or using SQL');
    console.log('Please apply these policies manually if needed:');
    policies.forEach(policy => {
      console.log(`\n--- ${policy.name} ---`);
      console.log(policy.definition);
    });
    
    console.log('\n✅ Storage bucket setup complete!');
    console.log('\nTo fully set up your app, you also need to create the practice_sessions table.');
    console.log('You can do this in the Supabase dashboard or by running:');
    console.log('\nnpm run create-table');
    
    return { success: true };
  } catch (error) {
    console.error('\n❌ Storage bucket creation failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Run if called directly
if (require.main === module) {
  createStorageBucket().then(result => {
    if (!result.success) {
      process.exit(1);
    }
  });
}

export { createStorageBucket }; 