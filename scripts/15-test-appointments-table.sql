-- Test appointments table access
-- This script tests if the appointments table exists and can be accessed

-- Check if appointments table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') 
    THEN 'Appointments table exists' 
    ELSE 'Appointments table does NOT exist' 
  END AS table_status;

-- Check appointments table structure
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
    THEN 'Appointments table has data' 
    ELSE 'Appointments table is empty' 
  END AS data_status;

-- Count appointments if table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
    RAISE NOTICE 'Total appointments: %', (SELECT COUNT(*) FROM appointments);
  ELSE
    RAISE NOTICE 'Appointments table does not exist';
  END IF;
END $$;

SELECT 'Appointments table test completed!' AS status;
