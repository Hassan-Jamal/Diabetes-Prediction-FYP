# Hospital Consultant Management Module - Setup Guide

## 📋 Overview

This module enables hospitals to fully manage their consultants including viewing, approving/rejecting registration requests, adding new consultants, and viewing detailed profiles.

## 🗄️ Database Setup

### Run SQL Script

Go to Supabase SQL Editor and run:
```sql
-- Copy and paste: scripts/09-create-hospital-tables.sql
```

This creates all necessary tables with RLS policies already configured.

### Important: Update Patients Schema

**Currently**, the workload calculation in the API uses a placeholder (0). You need to add a `consultant_id` field to the `patients` table:

```sql
-- Add consultant_id to patients table
ALTER TABLE patients ADD COLUMN IF NOT EXISTS consultant_id UUID REFERENCES consultants(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_patients_consultant_id ON patients(consultant_id);
```

Then update the API query in `app/api/hospital/consultants/route.ts` to properly calculate workload:

```typescript
const { count } = await supabase
  .from("patients")
  .select("id", { count: "exact", head: true })
  .eq("consultant_id", consultant.id)
```

## 📁 Pages Created

### 1. `/hospital/consultants` - Consultant List
**Features:**
- ✅ Search by name, email, or specialization
- ✅ Filter by status (all, approved, pending, rejected)
- ✅ Status badges (green/yellow/red)
- ✅ Workload display
- ✅ Approve/Reject buttons for pending consultants
- ✅ View Details button
- ✅ Add Consultant button
- ✅ Empty state when no consultants
- ✅ Loading skeletons

### 2. `/hospital/add-consultant` - Add Consultant Form
**Features:**
- ✅ Name, email, specialization fields
- ✅ Specialization dropdown with 8 options
- ✅ Form validation
- ✅ Toast notifications
- ✅ Redirect to list after success

### 3. `/hospital/consultants/[id]` - Consultant Detail
**Features:**
- ✅ Full profile display
- ✅ Workload summary
- ✅ Assigned patients list (if applicable)
- ✅ Status badge
- ✅ Back button

## 🔌 API Endpoints

### GET `/api/hospital/consultants`
**Returns:** List of all consultants with workload

**Response:**
```json
{
  "consultants": [
    {
      "id": "uuid",
      "name": "Dr. John Smith",
      "email": "john@hospital.com",
      "specialization": "Cardiologist",
      "status": "approved",
      "workload": 15,
      "created_at": "2025-01-20T10:00:00Z"
    }
  ]
}
```

### GET `/api/hospital/consultants/[id]`
**Returns:** Single consultant with details and patients

**Response:**
```json
{
  "id": "uuid",
  "name": "Dr. John Smith",
  "email": "john@hospital.com",
  "specialization": "Cardiologist",
  "status": "approved",
  "workload": 15,
  "patients": [
    {
      "id": "uuid",
      "name": "Jane Doe",
      "age": 45,
      "gender": "Female"
    }
  ],
  "created_at": "2025-01-20T10:00:00Z"
}
```

### POST `/api/hospital/consultants`
**Creates:** New consultant

**Body:**
```json
{
  "name": "Dr. Jane Smith",
  "email": "jane@hospital.com",
  "specialization": "Endocrinologist",
  "status": "approved"
}
```

### PATCH `/api/hospital/consultants/[id]`
**Updates:** Consultant status or other fields

**Body:**
```json
{
  "status": "approved"
}
```

## 🎨 UI Components

### Status Badges
- 🟢 **Approved** - Green background
- 🟡 **Pending** - Amber background
- 🔴 **Rejected** - Red background

### Specializations Available
- Cardiologist
- Endocrinologist
- Neurologist
- Oncologist
- Pediatrician
- Psychiatrist
- General Practitioner
- Other

## 🧪 Testing

### Step 1: Create Test Consultants

Run this SQL to add test data:

```sql
-- Assuming you're logged in as a hospital user
INSERT INTO consultants (hospital_id, name, email, specialization, status)
VALUES 
  (auth.uid(), 'Dr. Sarah Johnson', 'sarah@hospital.com', 'Cardiologist', 'approved'),
  (auth.uid(), 'Dr. Michael Chen', 'michael@hospital.com', 'Endocrinologist', 'pending'),
  (auth.uid(), 'Dr. Emily Davis', 'emily@hospital.com', 'Neurologist', 'approved'),
  (auth.uid(), 'Dr. Robert Wilson', 'robert@hospital.com', 'General Practitioner', 'rejected');

SELECT 'Test consultants created!' AS status;
```

### Step 2: Test the Interface

1. **Login as hospital user**
2. **Navigate to `/hospital/consultants`**
3. **Verify:**
   - Consultants list displays correctly
   - Search functionality works
   - Status filter works
   - Approve/Reject buttons appear for pending consultants
4. **Click "Add Consultant"**:
   - Fill out form
   - Submit
   - Verify new consultant appears in list
5. **Click "View Details"**:
   - Should navigate to consultant detail page
   - Should show full profile information

## 🔒 Security

- ✅ RLS policies ensure hospitals only see their own consultants
- ✅ All queries filtered by `hospital_id = auth.uid()`
- ✅ Only authenticated hospital users can access
- ✅ No data leaks between hospitals

## 📊 Features Implemented

### ✅ Core Features
- [x] View all consultants
- [x] Search functionality
- [x] Status filtering
- [x] Approve pending consultants
- [x] Reject pending consultants
- [x] Add new consultant
- [x] View consultant details
- [x] Workload calculation
- [x] Toast notifications
- [x] Loading states
- [x] Empty states
- [x] Confirmation dialogs

### 🎨 UI/UX
- [x] Responsive design
- [x] Modern card layouts
- [x] Status badges
- [x] Hover effects
- [x] Loading skeletons
- [x] Empty state messages
- [x] Search with real-time filtering
- [x] Dropdown filters

## 🐛 Troubleshooting

### No consultants showing

**Possible Causes:**
- No consultants in database
- RLS policies not set up
- Wrong hospital_id

**Solutions:**
- Add test consultants using SQL above
- Verify RLS policies in Supabase
- Check `hospital_id` matches logged-in user

### Workload showing 0

**Cause:** `patients` table doesn't have `consultant_id` field yet

**Solution:** Run the ALTER TABLE query above to add `consultant_id` to patients table

### Approve/Reject not working

**Possible Causes:**
- Network error
- RLS policy blocking update
- Invalid consultant ID

**Solutions:**
- Check browser console for errors
- Verify RLS policies allow updates
- Check database for consultant record

## 🚀 Next Steps

After this module works, you can add:

1. **Patient Assignment**: Assign patients to consultants
2. **Workload Charts**: Visual representation of consultant workload
3. **Consultant Schedule**: Calendar view of appointments
4. **Consultant Ratings**: Patient feedback system
5. **Export Reports**: PDF generation for consultant data

---

**Status:** ✅ Complete and Ready for Testing

