-- Create labs table for managing laboratory profile information
CREATE TABLE IF NOT EXISTS labs (
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

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_labs_email ON labs(email);
CREATE INDEX IF NOT EXISTS idx_labs_registration_id ON labs(registration_id);

-- Enable Row Level Security (RLS)
ALTER TABLE labs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Labs can view their own data" ON labs;
DROP POLICY IF EXISTS "Labs can update their own data" ON labs;
DROP POLICY IF EXISTS "Labs can insert their own data" ON labs;

-- Create RLS policies
CREATE POLICY "Labs can view their own data" ON labs
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Labs can update their own data" ON labs
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "Labs can insert their own data" ON labs
  FOR INSERT WITH CHECK (id = auth.uid());

SELECT 'Labs table created successfully!' AS status;

-- ==========================================
-- Note: Storage bucket needs to be created manually in Supabase Dashboard
-- Bucket name: lab-profile-images
-- Make it public
-- ==========================================

