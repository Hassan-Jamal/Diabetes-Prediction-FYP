-- Verify and update consultation_requests table
-- This script ensures the consultation_requests table has all required columns

-- Check if is_urgent column exists, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'consultation_requests' AND column_name = 'is_urgent'
  ) THEN
    ALTER TABLE consultation_requests ADD COLUMN is_urgent BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Check if hospital_id column exists (should already exist from previous setup)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'consultation_requests' AND column_name = 'hospital_id'
  ) THEN
    -- Get user's hospital ID from auth
    -- This assumes the hospital was created using auth.users
    ALTER TABLE consultation_requests ADD COLUMN hospital_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_consultation_requests_hospital_id ON consultation_requests(hospital_id);
  END IF;
END $$;

-- Check if updated_at column exists, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'consultation_requests' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE consultation_requests ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_consultation_requests_patient_id ON consultation_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_consultant_id ON consultation_requests(consultant_id);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_status ON consultation_requests(status);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_date ON consultation_requests(request_date);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_is_urgent ON consultation_requests(is_urgent);

-- Ensure RLS is enabled
ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Hospitals can view their consultation requests" ON consultation_requests;
DROP POLICY IF EXISTS "Hospitals can manage their consultation requests" ON consultation_requests;

-- Create RLS policies
CREATE POLICY "Hospitals can view their consultation requests" ON consultation_requests
  FOR SELECT USING (hospital_id = auth.uid());

CREATE POLICY "Hospitals can manage their consultation requests" ON consultation_requests
  FOR ALL USING (hospital_id = auth.uid());

SELECT 'Consultation requests table verified and updated!' AS status;

