-- Migration script for lab_reports table
-- Run this ONLY if you already have lab_reports table with old column structure
-- This script handles migrating from old columns to new columns

-- Step 1: Drop existing policies to allow modifications
DROP POLICY IF EXISTS "Labs can view their own reports" ON lab_reports;
DROP POLICY IF EXISTS "Labs can insert their own reports" ON lab_reports;
DROP POLICY IF EXISTS "Labs can update their own reports" ON lab_reports;
DROP POLICY IF EXISTS "Labs can delete their own reports" ON lab_reports;

-- Step 2: Add patient_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lab_reports' AND column_name = 'patient_id'
  ) THEN
    ALTER TABLE lab_reports ADD COLUMN patient_id TEXT;
    -- Set temporary values for existing rows
    UPDATE lab_reports SET patient_id = 'temp_' || id WHERE patient_id IS NULL;
    ALTER TABLE lab_reports ALTER COLUMN patient_id SET NOT NULL;
    RAISE NOTICE 'Added patient_id column';
  END IF;
END $$;

-- Step 3: Rename test_type to report_type if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lab_reports' AND column_name = 'test_type'
  ) THEN
    ALTER TABLE lab_reports RENAME COLUMN test_type TO report_type;
    RAISE NOTICE 'Renamed test_type to report_type';
  END IF;
END $$;

-- Step 4: Rename report_file_url to file_url if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lab_reports' AND column_name = 'report_file_url'
  ) THEN
    ALTER TABLE lab_reports RENAME COLUMN report_file_url TO file_url;
    RAISE NOTICE 'Renamed report_file_url to file_url';
    -- Make it NOT NULL if needed
    ALTER TABLE lab_reports ALTER COLUMN file_url SET NOT NULL;
  END IF;
END $$;

-- Step 5: Recreate policies
CREATE POLICY "Labs can view their own reports" ON lab_reports 
  FOR SELECT USING (lab_id = auth.uid());

CREATE POLICY "Labs can insert their own reports" ON lab_reports 
  FOR INSERT WITH CHECK (lab_id = auth.uid());

CREATE POLICY "Labs can update their own reports" ON lab_reports 
  FOR UPDATE USING (lab_id = auth.uid()) WITH CHECK (lab_id = auth.uid());

CREATE POLICY "Labs can delete their own reports" ON lab_reports 
  FOR DELETE USING (lab_id = auth.uid());

-- Step 6: Add index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_lab_reports_patient_id ON lab_reports(patient_id);

-- ==========================================
-- IMPORTANT NOTES:
-- 1. If you have existing data, you may need to populate patient_id manually
-- 2. Update patient_id values from 'temp_' to actual patient IDs
-- 3. Make sure all file_url values are populated before setting NOT NULL
-- ==========================================

SELECT 'Migration complete! The lab_reports table has been updated.' AS status;

