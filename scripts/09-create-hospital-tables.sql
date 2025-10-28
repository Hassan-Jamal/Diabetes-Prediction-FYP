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

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  consultant_id UUID NOT NULL REFERENCES consultants(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);

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
CREATE POLICY "Hospitals can view their consultants" ON consultants
  FOR SELECT USING (hospital_id = auth.uid());

CREATE POLICY "Hospitals can manage their consultants" ON consultants
  FOR ALL USING (hospital_id = auth.uid());

-- Create RLS policies for patients
CREATE POLICY "Hospitals can view their patients" ON patients
  FOR SELECT USING (hospital_id = auth.uid());

CREATE POLICY "Hospitals can manage their patients" ON patients
  FOR ALL USING (hospital_id = auth.uid());

-- Create RLS policies for consultation_requests
CREATE POLICY "Hospitals can view their consultation requests" ON consultation_requests
  FOR SELECT USING (hospital_id = auth.uid());

CREATE POLICY "Hospitals can manage their consultation requests" ON consultation_requests
  FOR ALL USING (hospital_id = auth.uid());

-- Create RLS policies for appointments
CREATE POLICY "Hospitals can view their appointments" ON appointments
  FOR SELECT USING (hospital_id = auth.uid());

CREATE POLICY "Hospitals can manage their appointments" ON appointments
  FOR ALL USING (hospital_id = auth.uid());

SELECT 'Hospital tables created successfully!' AS status;

