# Fix Storage RLS Error - Step by Step Guide

## Problem
You're getting this error when uploading reports:
```
StorageApiError: new row violates row-level security policy
```

## Solution

You have **two options** to fix this:

---

## Option 1: Make the Bucket Public (EASIEST) ⭐

This is the simplest solution and works well for development.

### Steps:
1. Go to your **Supabase Dashboard**
2. Click **Storage** in the left sidebar
3. Click on the **`lab-reports`** bucket
4. Find the **"Public bucket"** toggle
5. **Turn it ON** (enable public access)
6. Save

That's it! Now try uploading again.

---

## Option 2: Set Up Proper RLS Policies (MORE SECURE)

If you want to keep the bucket private, run this SQL script:

### Steps:
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Paste and run this script:

```sql
-- Make bucket public by default (easiest solution)
UPDATE storage.buckets SET public = true WHERE name = 'lab-reports';

-- Enable RLS on storage.objects
-- (This is usually enabled by default)

-- Drop any existing policies
DROP POLICY IF EXISTS "Labs can upload reports" ON storage.objects;
DROP POLICY IF EXISTS "Labs can view their own reports" ON storage.objects;
DROP POLICY IF EXISTS "Labs can delete their own reports" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload to lab-reports" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view lab-reports" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete from lab-reports" ON storage.objects;

-- Create simple policies that allow authenticated users to access the bucket
CREATE POLICY "Anyone can upload to lab-reports" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'lab-reports');

CREATE POLICY "Anyone can view lab-reports" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'lab-reports');

CREATE POLICY "Anyone can delete from lab-reports" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'lab-reports');

SELECT 'Storage RLS policies created! You can now upload files.' AS status;
```

3. Click **Run**
4. Try uploading a report again

---

## Verify the Fix

After applying either option:

1. Try uploading a report in your app
2. Check the browser console for these logs:
   - `[v0] Uploading file: [filename]`
   - `[v0] File uploaded successfully: [data]`
   - `[v0] Public URL: [url]`
3. If you see `[v0] Upload error:` instead, check the error details

---

## Troubleshooting

### If Option 1 doesn't work:
- Make sure the bucket name is exactly `lab-reports` (case-sensitive)
- Check that the bucket exists in Supabase Storage
- Refresh your browser after making the change

### If Option 2 doesn't work:
- Check that you're logged in as a lab user
- Verify the bucket exists by running: `SELECT * FROM storage.buckets WHERE name = 'lab-reports';`
- Make sure you have the correct permissions in Supabase

### Still getting errors?
Check your browser console for detailed error messages and share them for further debugging.

---

## Quick Test

Try uploading a small test file (PDF or image):
1. Log in as a lab user
2. Go to `/lab/upload-report`
3. Fill out the form and select a file
4. Click "Upload Report"

You should see:
- ✅ Success toast message
- ✅ File appears in the reports table
- ✅ No console errors

---

**Next Step:** Once this works, your upload feature is complete! 🎉

