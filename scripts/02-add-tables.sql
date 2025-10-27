-- Add lab_tests table for managing laboratory tests
CREATE TABLE IF NOT EXISTS lab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_id UUID NOT NULL,
  test_name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lab_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lab_tests_lab_id ON lab_tests(lab_id);

-- Add lab_requests table for managing booking requests
CREATE TABLE IF NOT EXISTS lab_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name VARCHAR(255) NOT NULL,
  patient_id UUID NOT NULL,
  lab_id UUID NOT NULL,
  test_type VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  date DATE NOT NULL,
  time VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lab_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lab_requests_lab_id ON lab_requests(lab_id);
CREATE INDEX IF NOT EXISTS idx_lab_requests_status ON lab_requests(status);
CREATE INDEX IF NOT EXISTS idx_lab_requests_patient_id ON lab_requests(patient_id);

-- Add lab_reports table for managing uploaded reports
CREATE TABLE IF NOT EXISTS lab_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_id UUID NOT NULL,
  patient_id TEXT NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  report_type VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lab_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lab_reports_lab_id ON lab_reports(lab_id);
CREATE INDEX IF NOT EXISTS idx_lab_reports_uploaded_at ON lab_reports(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_lab_reports_patient_id ON lab_reports(patient_id);

-- Enable Row Level Security (RLS)
ALTER TABLE lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for lab_tests
CREATE POLICY "Labs can view their own tests" ON lab_tests FOR SELECT USING (lab_id = auth.uid());
CREATE POLICY "Labs can insert their own tests" ON lab_tests FOR INSERT WITH CHECK (lab_id = auth.uid());
CREATE POLICY "Labs can update their own tests" ON lab_tests FOR UPDATE USING (lab_id = auth.uid());
CREATE POLICY "Labs can delete their own tests" ON lab_tests FOR DELETE USING (lab_id = auth.uid());

-- Create policies for lab_requests
CREATE POLICY "Labs can view their own requests" ON lab_requests FOR SELECT USING (lab_id = auth.uid());
CREATE POLICY "Labs can update their own requests" ON lab_requests FOR UPDATE USING (lab_id = auth.uid());

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Labs can view their own reports" ON lab_reports;
DROP POLICY IF EXISTS "Labs can insert their own reports" ON lab_reports;
DROP POLICY IF EXISTS "Labs can update their own reports" ON lab_reports;
DROP POLICY IF EXISTS "Labs can delete their own reports" ON lab_reports;

-- Create policies for lab_reports
CREATE POLICY "Labs can view their own reports" ON lab_reports FOR SELECT USING (lab_id = auth.uid());
CREATE POLICY "Labs can insert their own reports" ON lab_reports FOR INSERT WITH CHECK (lab_id = auth.uid());
CREATE POLICY "Labs can update their own reports" ON lab_reports FOR UPDATE USING (lab_id = auth.uid());
CREATE POLICY "Labs can delete their own reports" ON lab_reports FOR DELETE USING (lab_id = auth.uid());

-- ==========================================
-- MIGRATION SCRIPT: Update existing lab_reports table
-- Run this if the table already exists with old column structure
-- ==========================================

DO $$ 
BEGIN
  -- Add patient_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lab_reports' AND column_name = 'patient_id'
  ) THEN
    ALTER TABLE lab_reports ADD COLUMN patient_id TEXT;
    -- Set temporary values for existing rows
    UPDATE lab_reports SET patient_id = 'temp_' || id WHERE patient_id IS NULL;
    ALTER TABLE lab_reports ALTER COLUMN patient_id SET NOT NULL;
  END IF;

  -- Rename test_type to report_type if test_type exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lab_reports' AND column_name = 'test_type'
  ) THEN
    ALTER TABLE lab_reports RENAME COLUMN test_type TO report_type;
  END IF;

  -- Rename report_file_url to file_url if report_file_url exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lab_reports' AND column_name = 'report_file_url'
  ) THEN
    ALTER TABLE lab_reports RENAME COLUMN report_file_url TO file_url;
    -- Make it NOT NULL if it contains data
    ALTER TABLE lab_reports ALTER COLUMN file_url SET NOT NULL;
  END IF;

  -- Remove patient_id NOT NULL constraint if we just added it with temp values
  -- User should populate this properly based on their data
END $$;

