-- Create appointments table for hospital appointment management
-- This script creates the appointments table with proper relationships and RLS policies

-- First, check if the table exists and fix structure if needed
DO $$ 
BEGIN
  -- Check if appointments table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
    RAISE NOTICE 'Appointments table exists, checking structure...';
    
    -- Check if date column exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'appointments' AND column_name = 'date'
    ) THEN
      RAISE NOTICE 'Date column missing, dropping and recreating table...';
      
      -- Drop the table if it has wrong structure
      DROP TABLE IF EXISTS appointments CASCADE;
      
      -- Recreate the table with correct structure
      CREATE TABLE appointments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        hospital_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        consultant_id UUID REFERENCES consultants(id) ON DELETE SET NULL,
        patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        time TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
        type VARCHAR(50) NOT NULL CHECK (type IN ('consultation', 'lab_test', 'follow_up')),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      RAISE NOTICE 'Appointments table recreated with correct structure';
    ELSE
      RAISE NOTICE 'Date column exists, table structure is correct';
    END IF;
  ELSE
    RAISE NOTICE 'Appointments table does not exist, creating it...';
    
    -- Create the table
    CREATE TABLE appointments (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      hospital_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      consultant_id UUID REFERENCES consultants(id) ON DELETE SET NULL,
      patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      time TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
      type VARCHAR(50) NOT NULL CHECK (type IN ('consultation', 'lab_test', 'follow_up')),
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    RAISE NOTICE 'Appointments table created successfully';
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_hospital_id ON appointments(hospital_id);
CREATE INDEX IF NOT EXISTS idx_appointments_consultant_id ON appointments(consultant_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_type ON appointments(type);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Hospitals can view their own appointments" ON appointments;
DROP POLICY IF EXISTS "Hospitals can insert their own appointments" ON appointments;
DROP POLICY IF EXISTS "Hospitals can update their own appointments" ON appointments;
DROP POLICY IF EXISTS "Hospitals can delete their own appointments" ON appointments;

-- Create RLS policies
CREATE POLICY "Hospitals can view their own appointments" ON appointments
  FOR SELECT USING (hospital_id = auth.uid());

CREATE POLICY "Hospitals can insert their own appointments" ON appointments
  FOR INSERT WITH CHECK (hospital_id = auth.uid());

CREATE POLICY "Hospitals can update their own appointments" ON appointments
  FOR UPDATE USING (hospital_id = auth.uid());

CREATE POLICY "Hospitals can delete their own appointments" ON appointments
  FOR DELETE USING (hospital_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_appointments_updated_at ON appointments;
CREATE TRIGGER trigger_update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_appointments_updated_at();

-- Insert some sample appointments for testing
-- Note: Uncomment and modify the following lines with actual IDs from your database
-- INSERT INTO appointments (hospital_id, consultant_id, patient_id, date, time, status, type, notes) VALUES
--   ('hospital-uuid-1', 'consultant-uuid-1', 'patient-uuid-1', '2024-01-15', '10:00 AM', 'scheduled', 'consultation', 'Regular checkup'),
--   ('hospital-uuid-1', 'consultant-uuid-2', 'patient-uuid-2', '2024-01-16', '02:30 PM', 'scheduled', 'lab_test', 'Blood work'),
--   ('hospital-uuid-1', 'consultant-uuid-1', 'patient-uuid-3', '2024-01-17', '09:15 AM', 'completed', 'follow_up', 'Follow-up consultation');

-- Debug and verify appointments table
-- Check if appointments table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') 
    THEN '✅ Appointments table exists' 
    ELSE '❌ Appointments table does NOT exist' 
  END AS table_status;

-- Check table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'appointments' 
ORDER BY ordinal_position;

-- Check if there are any appointments
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM appointments LIMIT 1) 
    THEN '✅ Appointments table has data' 
    ELSE '❌ Appointments table is empty - Create some appointments first' 
  END AS data_status;

-- Count appointments
SELECT COUNT(*) as total_appointments FROM appointments;

-- Show sample appointments (if any exist)
SELECT 
  id,
  hospital_id,
  patient_id,
  consultant_id,
  date,
  time,
  status,
  type
FROM appointments 
LIMIT 5;

-- Check if current user has any appointments
SELECT 
  COUNT(*) as user_appointments
FROM appointments 
WHERE hospital_id = auth.uid();

SELECT 'Appointments table structure verified and fixed! Debug completed!' AS status;
