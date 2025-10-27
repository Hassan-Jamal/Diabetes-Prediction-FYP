-- Fix RLS policies for lab_reports table
-- This script corrects any issues with Row Level Security policies

-- Step 1: Drop existing policies
DROP POLICY IF EXISTS "Labs can view their own reports" ON lab_reports;
DROP POLICY IF EXISTS "Labs can insert their own reports" ON lab_reports;
DROP POLICY IF EXISTS "Labs can update their own reports" ON lab_reports;
DROP POLICY IF EXISTS "Labs can delete their own reports" ON lab_reports;

-- Step 2: Recreate policies with correct syntax
CREATE POLICY "Labs can view their own reports" ON lab_reports 
  FOR SELECT USING (lab_id = auth.uid());

CREATE POLICY "Labs can insert their own reports" ON lab_reports 
  FOR INSERT WITH CHECK (lab_id = auth.uid());

CREATE POLICY "Labs can update their own reports" ON lab_reports 
  FOR UPDATE USING (lab_id = auth.uid());

CREATE POLICY "Labs can delete their own reports" ON lab_reports 
  FOR DELETE USING (lab_id = auth.uid());

SELECT 'RLS policies updated successfully!' AS status;

-- ==========================================
-- TROUBLESHOOTING:
-- If you still get RLS errors after running this:
-- 
-- 1. Check that you're logged in (auth.uid() is not null)
-- 2. Verify your user has the 'lab' role in user_metadata
-- 3. Check the console for the exact lab_id being used
-- ==========================================

