-- Fix RLS policies for Supabase Storage bucket
-- This script sets up proper policies for the lab-reports storage bucket

-- First, let's check if the bucket exists and its current policies
SELECT name, public FROM storage.buckets WHERE name = 'lab-reports';

-- Enable RLS on the storage.objects table if not already enabled
-- (This is usually enabled by default, but let's ensure it)

-- Drop existing policies on storage.objects for lab-reports bucket
DROP POLICY IF EXISTS "Labs can upload reports" ON storage.objects;
DROP POLICY IF EXISTS "Labs can view their own reports" ON storage.objects;
DROP POLICY IF EXISTS "Labs can delete their own reports" ON storage.objects;

-- Create policies for storage.objects
-- Policy 1: Labs can upload files to their own folder
CREATE POLICY "Labs can upload reports" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'lab-reports' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Labs can view files in their own folder
CREATE POLICY "Labs can view their own reports" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'lab-reports' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Labs can delete files in their own folder
CREATE POLICY "Labs can delete their own reports" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'lab-reports' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Alternative: Simpler policy that allows authenticated labs to upload/view/delete in the entire bucket
-- This is less secure but easier to debug
-- Uncomment the lines below and comment out the above policies if needed

-- Drop policies
DROP POLICY IF EXISTS "Any authenticated lab can upload reports" ON storage.objects;
DROP POLICY IF EXISTS "Any authenticated lab can view reports" ON storage.objects;
DROP POLICY IF EXISTS "Any authenticated lab can delete reports" ON storage.objects;

-- Create simpler policies for debugging
CREATE POLICY "Any authenticated lab can upload reports" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'lab-reports' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Any authenticated lab can view reports" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'lab-reports' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Any authenticated lab can delete reports" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'lab-reports' 
  AND auth.role() = 'authenticated'
);

SELECT 'Storage RLS policies updated! You can now upload files to the lab-reports bucket.' AS status;

