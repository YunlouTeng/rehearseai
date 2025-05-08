-- Create the interview-recordings bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('interview-recordings', 'interview-recordings', false)
ON CONFLICT (id) DO NOTHING;

-- Set bucket to private (not public)
UPDATE storage.buckets 
SET public = false 
WHERE id = 'interview-recordings';

-- Create policies for the storage bucket
-- Allow users to upload files to their own folder
CREATE POLICY "Users can upload files to their own folder"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'interview-recordings' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to select their own files
CREATE POLICY "Users can view their own files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'interview-recordings' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own files
CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'interview-recordings' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'interview-recordings' AND 
  auth.uid()::text = (storage.foldername(name))[1]
); 