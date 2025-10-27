# Supabase Database Setup Guide

## How to Apply SQL Files

### Option 1: Using Supabase SQL Editor (Simplest) ✅

1. Go to your Supabase dashboard → [SQL Editor](https://supabase.com/dashboard)

2. Click **New Query**

3. Copy and paste the content from `scripts/02-add-tables.sql`

4. Click **Run** or press `Ctrl+Enter`

5. Refresh your Supabase **Table Editor** to see the new tables:
   - `lab_tests`
   - `lab_requests`
   - `lab_reports`

### Option 2: Using Supabase CLI (For project-based setup)

If you have Supabase CLI installed and configured:

```bash
# Make sure you're in the project root
cd D:\Diabetes_Prediction_System

# Apply the migrations
npx supabase db push
```

This command will run all SQL files in your `supabase/migrations/` folder.

## What Gets Created

### Tables Created:
1. **lab_tests** - Stores tests offered by labs
2. **lab_requests** - Stores booking requests from patients
3. **lab_reports** - Stores uploaded test reports

### Security:
- ✅ Row Level Security (RLS) enabled
- ✅ Users can only access their own data
- ✅ Authentication required for all operations

### Indexes:
- Optimized for query performance
- Quick filtering by `lab_id` and `status`

## Verification

After running the SQL, verify in Supabase:

1. **Table Editor** → Check tables exist
2. **Authentication** → Check user is created
3. **Database** → Check RLS policies are active

## Test the Integration

1. Start your app: `npm run dev`
2. Login as a lab user
3. Navigate to `/lab/tests`
4. Add a test
5. Check Supabase dashboard to see the data

## Troubleshooting

### If tables don't appear:
- Make sure you ran the SQL in the correct database
- Check for errors in the SQL Editor output
- Refresh the Supabase dashboard

### If you get permission errors:
- Verify RLS policies are created
- Check your environment variables are correct
- Ensure you're authenticated in the app

### If API returns empty data:
- Check that you're logged in
- Verify the lab_id matches your user ID
- Check the Supabase logs for errors

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Quick Start

1. ✅ Run the SQL in Supabase SQL Editor
2. ✅ Check environment variables in `.env.local`
3. ✅ Start the app: `npm run dev`
4. ✅ Login and test CRUD operations

## Need Help?

- Check `docs/supabase-integration.md` for detailed implementation guide
- Review the API route code for examples
- Check Supabase logs in the dashboard

