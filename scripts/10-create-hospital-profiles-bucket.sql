-- Create hospital-profiles bucket in Supabase Storage
-- Run this in the Supabase SQL Editor

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('hospital-profiles', 'hospital-profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to hospital-profiles bucket
CREATE POLICY "Allow authenticated users to upload hospital profiles"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hospital-profiles');

-- Allow authenticated users to view hospital profiles
CREATE POLICY "Allow authenticated users to view hospital profiles"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'hospital-profiles');

-- Allow authenticated users to update hospital profiles
CREATE POLICY "Allow authenticated users to update hospital profiles"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'hospital-profiles');

-- Allow authenticated users to delete hospital profiles
CREATE POLICY "Allow authenticated users to delete hospital profiles"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'hospital-profiles');

