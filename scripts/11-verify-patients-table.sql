-- Verify and create patients table if needed
-- This script ensures the patients table exists with the correct schema

-- Add consultant_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' AND column_name = 'consultant_id'
  ) THEN
    ALTER TABLE patients ADD COLUMN consultant_id UUID REFERENCES consultants(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_patients_consultant_id ON patients(consultant_id);
  END IF;
END $$;

-- Ensure other required columns exist
DO $$ 
BEGIN
  -- Add age column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' AND column_name = 'age'
  ) THEN
    ALTER TABLE patients ADD COLUMN age INTEGER;
  END IF;

  -- Add gender column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' AND column_name = 'gender'
  ) THEN
    ALTER TABLE patients ADD COLUMN gender VARCHAR(10);
  END IF;

  -- Add date_of_birth column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE patients ADD COLUMN date_of_birth DATE;
  END IF;

  -- Add address column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' AND column_name = 'address'
  ) THEN
    ALTER TABLE patients ADD COLUMN address TEXT;
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_patients_hospital_id ON patients(hospital_id);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);

-- Enable RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Hospitals can view their patients" ON patients;
DROP POLICY IF EXISTS "Hospitals can manage their patients" ON patients;

-- Create RLS policies
CREATE POLICY "Hospitals can view their patients" ON patients
  FOR SELECT USING (hospital_id = auth.uid());

CREATE POLICY "Hospitals can manage their patients" ON patients
  FOR ALL USING (hospital_id = auth.uid());

SELECT 'Patients table verified and updated!' AS status;

