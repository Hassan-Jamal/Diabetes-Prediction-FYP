-- Create hospitals table for managing hospital profile information
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  registration_id TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create consultants table
CREATE TABLE IF NOT EXISTS consultants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  specialization VARCHAR(255),
  phone VARCHAR(20),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consultant_id UUID REFERENCES consultants(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  age INTEGER,
  gender VARCHAR(10),
  date_of_birth DATE,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create consultation_requests table
CREATE TABLE IF NOT EXISTS consultation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  consultant_id UUID REFERENCES consultants(id) ON DELETE SET NULL,
  request_date DATE NOT NULL,
  request_time VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create appointments table with proper schema
-- First, check if appointments table exists and fix structure if needed
DO $$ 
BEGIN
  -- Check if appointments table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
    RAISE NOTICE 'Appointments table exists, checking structure...';
    
    -- Check if it has old column names (appointment_date, appointment_time)
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'appointments' AND column_name = 'appointment_date'
    ) THEN
      RAISE NOTICE 'Found old column names, migrating appointments table...';
      
      -- Drop the old table and recreate with correct structure
      DROP TABLE IF EXISTS appointments CASCADE;
      
      -- Recreate the table with correct structure
      CREATE TABLE appointments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
      
      RAISE NOTICE 'Appointments table migrated successfully';
    ELSE
      RAISE NOTICE 'Appointments table structure is correct';
    END IF;
  ELSE
    RAISE NOTICE 'Appointments table does not exist, creating it...';
    
    -- Create the table
    CREATE TABLE appointments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_hospitals_email ON hospitals(email);
CREATE INDEX IF NOT EXISTS idx_consultants_hospital_id ON consultants(hospital_id);
CREATE INDEX IF NOT EXISTS idx_consultants_status ON consultants(status);
CREATE INDEX IF NOT EXISTS idx_patients_hospital_id ON patients(hospital_id);
CREATE INDEX IF NOT EXISTS idx_patients_consultant_id ON patients(consultant_id);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_hospital_id ON consultation_requests(hospital_id);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_status ON consultation_requests(status);
CREATE INDEX IF NOT EXISTS idx_appointments_hospital_id ON appointments(hospital_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);

-- Enable Row Level Security
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultants ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for hospitals
DROP POLICY IF EXISTS "Hospitals can view their own data" ON hospitals;
DROP POLICY IF EXISTS "Hospitals can update their own data" ON hospitals;
DROP POLICY IF EXISTS "Hospitals can insert their own data" ON hospitals;

CREATE POLICY "Hospitals can view their own data" ON hospitals
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Hospitals can update their own data" ON hospitals
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "Hospitals can insert their own data" ON hospitals
  FOR INSERT WITH CHECK (id = auth.uid());

-- Create RLS policies for consultants
DROP POLICY IF EXISTS "Hospitals can view their consultants" ON consultants;
DROP POLICY IF EXISTS "Hospitals can manage their consultants" ON consultants;

CREATE POLICY "Hospitals can view their consultants" ON consultants
  FOR SELECT USING (hospital_id = auth.uid());

CREATE POLICY "Hospitals can manage their consultants" ON consultants
  FOR ALL USING (hospital_id = auth.uid());

-- Create RLS policies for patients
DROP POLICY IF EXISTS "Hospitals can view their patients" ON patients;
DROP POLICY IF EXISTS "Hospitals can manage their patients" ON patients;

CREATE POLICY "Hospitals can view their patients" ON patients
  FOR SELECT USING (hospital_id = auth.uid());

CREATE POLICY "Hospitals can manage their patients" ON patients
  FOR ALL USING (hospital_id = auth.uid());

-- Create RLS policies for consultation_requests
DROP POLICY IF EXISTS "Hospitals can view their consultation requests" ON consultation_requests;
DROP POLICY IF EXISTS "Hospitals can manage their consultation requests" ON consultation_requests;

CREATE POLICY "Hospitals can view their consultation requests" ON consultation_requests
  FOR SELECT USING (hospital_id = auth.uid());

CREATE POLICY "Hospitals can manage their consultation requests" ON consultation_requests
  FOR ALL USING (hospital_id = auth.uid());

-- Create RLS policies for appointments
DROP POLICY IF EXISTS "Hospitals can view their appointments" ON appointments;
DROP POLICY IF EXISTS "Hospitals can manage their appointments" ON appointments;

CREATE POLICY "Hospitals can view their appointments" ON appointments
  FOR SELECT USING (hospital_id = auth.uid());

CREATE POLICY "Hospitals can manage their appointments" ON appointments
  FOR ALL USING (hospital_id = auth.uid());

-- Create function to update updated_at timestamp for hospitals
CREATE OR REPLACE FUNCTION update_hospitals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at for hospitals
DROP TRIGGER IF EXISTS trigger_update_hospitals_updated_at ON hospitals;
CREATE TRIGGER trigger_update_hospitals_updated_at
    BEFORE UPDATE ON hospitals
    FOR EACH ROW
    EXECUTE FUNCTION update_hospitals_updated_at();

-- Insert hospital profiles for existing users who don't have profiles
-- This will create profiles for users who registered before the hospitals table was created
INSERT INTO hospitals (id, name, email, phone, address, registration_id, created_at, updated_at)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'organization_name', au.email, 'Unknown Hospital') as name,
    au.email,
    au.raw_user_meta_data->>'phone' as phone,
    au.raw_user_meta_data->>'address' as address,
    au.raw_user_meta_data->>'hospital_id' as registration_id,
    au.created_at,
    CURRENT_TIMESTAMP
FROM auth.users au
LEFT JOIN hospitals h ON au.id = h.id
WHERE au.raw_user_meta_data->>'role' = 'hospital'
AND h.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Show the results
SELECT 
    COUNT(*) as total_hospitals,
    COUNT(CASE WHEN registration_id IS NOT NULL THEN 1 END) as hospitals_with_id
FROM hospitals;

-- Show sample hospital profiles
SELECT 
    id,
    name,
    email,
    registration_id,
    created_at
FROM hospitals
LIMIT 5;

SELECT 'Hospital tables created successfully and profiles auto-created!' AS status;

