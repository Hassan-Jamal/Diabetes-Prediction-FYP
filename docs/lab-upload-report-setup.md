# Lab Upload Report Setup Guide

This guide explains how to set up the Lab Upload Report feature, including Supabase Storage and database configuration.

## 🎯 Overview

The Lab Upload Report feature allows laboratory users to:
- Upload lab reports (PDF or images) to Supabase Storage
- Save report metadata to the database
- View and download uploaded reports

## 📋 Prerequisites

- Supabase project with authentication enabled
- Database access to run SQL scripts
- Storage bucket created in Supabase

## 🗄️ Database Setup

### Step 1: Create the Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Configure the bucket:
   - **Name**: `lab-reports`
   - **Public**: `Yes` (set to public for easy access, or use private with signed URLs)
   - **File size limit**: `10 MB` (or adjust as needed)
5. Click **Create bucket**

### Step 2: Add Storage Policy (for Private Buckets)

If you're using a private bucket, add this policy to allow authenticated labs to upload:

```sql
-- Policy for public access (if bucket is public, skip this)
-- For private buckets, create a policy to allow authenticated labs to read/write
```

For now, using a public bucket is recommended for simplicity.

### Step 3: Run Database Migration

Run the updated SQL script to create the `lab_reports` table:

```bash
# Option 1: Using Supabase SQL Editor
# Go to SQL Editor in your Supabase Dashboard
# Copy and paste the contents of scripts/02-add-tables.sql
# Click "Run"

# Option 2: Using Supabase CLI
supabase db push
```

The updated `lab_reports` table structure:
```sql
CREATE TABLE IF NOT EXISTS lab_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_id UUID NOT NULL,
  patient_id TEXT NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  report_type VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lab_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
```

### Step 4: Verify RLS Policies

The RLS policies should already be enabled. Verify they're working:

```sql
-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'lab_reports';

-- Expected policies:
-- "Labs can view their own reports"
-- "Labs can insert their own reports"
-- "Labs can update their own reports"
-- "Labs can delete their own reports"
```

## 🔧 Configuration

### Environment Variables

Ensure your `.env.local` file has the correct Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 🎨 Features

### Upload Form

- **Patient Selection**: Dropdown with mock patient data
- **Report Type**: Text input for report description
- **File Upload**: Accepts PDF, JPEG, and PNG files (max 10MB)
- **Validation**: Client-side validation for required fields and file type/size
- **Loading State**: Shows "Uploading..." with spinner during upload

### Upload Process

1. User fills out the form and selects a file
2. File is uploaded to Supabase Storage bucket `lab-reports`
3. Public URL is generated for the uploaded file
4. Metadata is saved to `lab_reports` table
5. Success toast notification is shown
6. Form is cleared and reports table is refreshed

### Reports Table

- Displays all reports uploaded by the logged-in lab
- Shows patient name, report type, and upload date
- "View" button opens the report in a new tab
- Responsive design for mobile and desktop

## 🧪 Testing

1. **Start the Application**:
   ```bash
   npm run dev
   ```

2. **Login as Lab User**:
   - Navigate to `/lab/login`
   - Login with lab credentials

3. **Test Upload**:
   - Go to `/lab/upload-report`
   - Fill out the form
   - Select a test file (PDF or image)
   - Click "Upload Report"
   - Verify success toast appears
   - Check the reports table for the new upload

4. **Test View Report**:
   - Click "View" on any uploaded report
   - Verify the file opens in a new tab

## 📁 File Structure

```
app/
├── lab/
│   └── upload-report/
│       └── page.tsx          # Main upload page component
├── api/
│   └── lab/
│       └── reports/
│           └── route.ts      # API endpoint for GET and POST
scripts/
├── 02-add-tables.sql        # Database schema (updated)
lib/
└── supabase/
    └── client.ts            # Supabase browser client
```

## 🔐 Security Considerations

### Current Implementation

- **Public Bucket**: Files are accessible to anyone with the URL
- **RLS Policies**: Database access is restricted to logged-in labs
- **Client-Side Validation**: File type and size validation

### Future Enhancements (Optional)

For production, consider:

1. **Private Bucket**: 
   - Change bucket to private
   - Use signed URLs for temporary access
   - Implement URL expiration

2. **File Encryption**:
   - Encrypt files before upload
   - Store decryption keys securely

3. **Virus Scanning**:
   - Scan uploaded files before storing
   - Block malicious files

## 🐛 Troubleshooting

### "Upload failed" Error

**Possible Causes**:
- Storage bucket doesn't exist
- Missing RLS policies
- Invalid file type or size
- Network error

**Solutions**:
- Verify bucket `lab-reports` exists
- Check Supabase dashboard → Storage
- Ensure file is PDF, JPEG, or PNG under 10MB
- Check browser console for detailed errors

### "Failed to save report metadata" Error

**Possible Causes**:
- `lab_reports` table doesn't exist
- Missing RLS policies
- Invalid data format

**Solutions**:
- Run the SQL migration script
- Check RLS policies in Supabase dashboard
- Verify all form fields are filled

### Reports Not Showing

**Possible Causes**:
- API endpoint not returning data
- RLS policies blocking access
- Empty database

**Solutions**:
- Check browser Network tab for API response
- Verify lab_id matches logged-in user
- Check Supabase logs for errors

## 📝 Mock Data

Currently using mock patient data:
```javascript
const mockPatients = [
  { id: "patient1", name: "Ali Ahmed" },
  { id: "patient2", name: "Fatima Khan" },
  { id: "patient3", name: "Usman Tariq" },
  { id: "patient4", name: "Ahmed Hassan" },
  { id: "patient5", name: "Sara Malik" },
]
```

### Future Enhancement: Real Patient Data

To connect to real patient data:

1. Create a `patients` table in Supabase
2. Update the dropdown to fetch from `/api/patients`
3. Store patient relationships properly

## 🚀 Production Checklist

Before deploying to production:

- [ ] Change storage bucket to private
- [ ] Implement signed URLs for file access
- [ ] Add file encryption
- [ ] Set up virus scanning
- [ ] Add rate limiting for uploads
- [ ] Implement file size quotas per lab
- [ ] Add comprehensive error logging
- [ ] Test with large files
- [ ] Set up backup strategy for uploaded files
- [ ] Configure CDN for faster file access
- [ ] Add audit logging for uploads

## 📚 Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js File Upload Patterns](https://nextjs.org/docs/pages/api-reference/components/next/image)

---

**Last Updated**: October 2024

