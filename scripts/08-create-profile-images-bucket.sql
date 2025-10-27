-- Create storage bucket for lab profile images
-- Note: This must be run AFTER creating the bucket in Supabase Dashboard

-- First, create the bucket in Supabase Dashboard:
-- 1. Go to Storage
-- 2. Create new bucket
-- 3. Name: lab-profile-images
-- 4. Make it public
-- 5. Save

-- Then run this SQL to add RLS policies:
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow labs to upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Labs can view profile images" ON storage.objects;
DROP POLICY IF EXISTS "Labs can delete profile images" ON storage.objects;

-- Create policies for profile image upload
CREATE POLICY "Allow labs to upload their own images" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'lab-profile-images' 
  AND (storage.foldername(name))[1] = 'labs'
);

CREATE POLICY "Labs can view profile images" 
ON storage.objects 
FOR SELECT 
TO authenticated, anon
USING (bucket_id = 'lab-profile-images');

CREATE POLICY "Labs can update their own images" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'lab-profile-images' 
  AND (storage.foldername(name))[1] = 'labs'
)
WITH CHECK (
  bucket_id = 'lab-profile-images' 
  AND (storage.foldername(name))[1] = 'labs'
);

CREATE POLICY "Labs can delete their own images" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'lab-profile-images' 
  AND (storage.foldername(name))[1] = 'labs'
);

SELECT 'Profile images bucket policies created!' AS status;

