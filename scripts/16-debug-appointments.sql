-- Debug appointments table and data
-- Run this in Supabase SQL Editor to check the appointments table

-- 1. Check if appointments table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') 
    THEN '✅ Appointments table exists' 
    ELSE '❌ Appointments table does NOT exist - Run scripts/13-create-appointments-table.sql' 
  END AS table_status;

-- 2. Check table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'appointments' 
ORDER BY ordinal_position;

-- 3. Check if there are any appointments
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM appointments LIMIT 1) 
    THEN '✅ Appointments table has data' 
    ELSE '❌ Appointments table is empty - Create some appointments first' 
  END AS data_status;

-- 4. Count appointments
SELECT COUNT(*) as total_appointments FROM appointments;

-- 5. Show sample appointments (if any exist)
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

-- 6. Check if current user has any appointments
-- Replace 'your-hospital-id' with actual hospital ID from auth.users
SELECT 
  COUNT(*) as user_appointments
FROM appointments 
WHERE hospital_id = auth.uid();

SELECT 'Debug completed! Check the results above.' AS status;
