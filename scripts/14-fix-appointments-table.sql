-- Fix appointments table structure
-- This script checks and fixes the appointments table if it exists with wrong structure

-- First, check if the table exists and what columns it has
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

SELECT 'Appointments table structure verified and fixed!' AS status;
