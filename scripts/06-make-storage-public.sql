-- Quick fix: Make lab-reports bucket public
-- This allows anyone to upload/view/delete files (suitable for development)

UPDATE storage.buckets 
SET public = true 
WHERE name = 'lab-reports';

SELECT 'Bucket lab-reports is now public!' AS status;

-- Verify the change
SELECT name, public, created_at 
FROM storage.buckets 
WHERE name = 'lab-reports';

-- ==========================================
-- IMPORTANT:
-- This makes the bucket public, meaning anyone with the URL can access files.
-- This is fine for development but NOT recommended for production.
--
-- For production, use Option 2 with proper RLS policies instead.
-- ==========================================

