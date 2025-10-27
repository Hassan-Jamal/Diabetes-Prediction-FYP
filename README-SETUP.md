# Supabase Setup Instructions

## 1. Run SQL Scripts in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the following scripts in order:

### Step 1: Run `scripts/01-init-database.sql`
Creates users, sessions, and password reset tables

### Step 2: Run `scripts/02-add-tables.sql`
Creates the lab management tables:
- `lab_tests` - Store tests offered by labs
- `lab_requests` - Store booking requests
- `lab_reports` - Store uploaded reports
- Enables Row Level Security (RLS) policies

## 2. Verify Tables Created

Check that these tables exist:
- ✅ `lab_tests`
- ✅ `lab_requests`  
- ✅ `lab_reports`

## 3. Test the Application

The API routes now use Supabase with proper authentication:

- **GET** `/api/lab/tests` - Fetch all tests
- **POST** `/api/lab/tests` - Create new test
- **PATCH** `/api/lab/tests/[id]` - Update test
- **DELETE** `/api/lab/tests/[id]` - Delete test

- **GET** `/api/lab/requests` - Fetch all requests
- **PATCH** `/api/lab/requests/[id]` - Update request status

## 4. Environment Variables

Ensure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Features Implemented

✅ Full CRUD operations for lab tests
✅ Authentication-based data access
✅ Row Level Security (RLS) enabled
✅ Proper error handling
✅ Mock data fallback for development

## Database Schema

### lab_tests
```sql
- id (UUID)
- lab_id (UUID) → FK to auth.users
- test_name (VARCHAR)
- price (DECIMAL)
- description (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### lab_requests
```sql
- id (UUID)
- patient_name (VARCHAR)
- patient_id (UUID)
- lab_id (UUID) → FK to auth.users
- test_type (VARCHAR)
- status (VARCHAR: pending/accepted/rejected)
- date (DATE)
- time (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### lab_reports
```sql
- id (UUID)
- lab_id (UUID) → FK to auth.users
- patient_name (VARCHAR)
- test_type (VARCHAR)
- report_file_url (TEXT)
- uploaded_at (TIMESTAMP)
```

## Next Steps

1. Add sample data to test CRUD operations
2. Test in the application UI
3. Monitor Supabase dashboard for data changes
4. Customize RLS policies as needed

