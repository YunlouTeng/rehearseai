-- First, drop existing policies
DROP POLICY IF EXISTS "Users can upload files to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- Re-create policies with correct path structure
-- Allow users to upload files to their own folder
CREATE POLICY "Users can upload files to recordings folder"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'interview-recordings' AND 
  auth.uid()::text = (storage.foldername(name))[2]
);

-- Allow users to select their own files
CREATE POLICY "Users can view their own files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'interview-recordings' AND 
  auth.uid()::text = (storage.foldername(name))[2]
);

-- Allow users to update their own files
CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'interview-recordings' AND 
  auth.uid()::text = (storage.foldername(name))[2]
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'interview-recordings' AND 
  auth.uid()::text = (storage.foldername(name))[2]
);

-- Add a policy to allow public read access if needed
CREATE POLICY "Public read access for videos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'interview-recordings');

-- Instead of manually creating the 'recordings' folder, you should create it through
-- the Storage API or UI in the Supabase dashboard. 