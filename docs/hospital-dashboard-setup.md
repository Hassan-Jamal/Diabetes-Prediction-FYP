# Hospital Dashboard Setup Guide

This guide explains how to set up and use the Hospital Dashboard Overview feature.

## 📋 Prerequisites

- Supabase project with authentication enabled
- Database access to run SQL scripts
- Hospital user account created

## 🗄️ Database Setup

### Step 1: Run the Hospital Tables Migration

Go to your Supabase Dashboard → SQL Editor and run:

```sql
-- Copy and paste the contents of scripts/09-create-hospital-tables.sql
```

This creates the following tables:
- `hospitals` - Hospital profile information
- `consultants` - Hospital consultants/doctors
- `patients` - Hospital patients
- `consultation_requests` - Patient consultation requests
- `appointments` - Scheduled appointments

### Step 2: Enable Row Level Security (RLS)

The SQL script automatically:
- ✅ Enables RLS on all tables
- ✅ Creates policies for data access
- ✅ Adds performance indexes

### Step 3: Create Storage Bucket (Optional)

For hospital profile images:

1. Go to **Storage** in Supabase Dashboard
2. Create bucket: `hospital-profile-images`
3. Make it public
4. Add policies:

```sql
-- Storage policies for hospital profile images
CREATE POLICY "Allow hospitals to upload their own images" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'hospital-profile-images');

CREATE POLICY "Anyone can view hospital profile images" 
ON storage.objects 
FOR SELECT 
TO authenticated, anon
USING (bucket_id = 'hospital-profile-images');
```

## 🎨 Dashboard Features

### Summary Cards

The dashboard displays 4 key metrics:

1. **Total Consultants** - Count of all active consultants
2. **Total Patients** - Count of all registered patients
3. **Pending Consultations** - Count of pending consultation requests
4. **Active Appointments** - Count of scheduled/completed appointments

### Analytics Chart

- **Trend Visualization**: Line chart showing consultation requests over last 7 days
- **Data Source**: `consultation_requests` table filtered by `hospital_id`
- **Format**: Date vs. count of requests

## 🔧 API Endpoints

### GET `/api/hospital/dashboard-summary`

Returns counts for all summary cards:
```json
{
  "totalConsultants": 15,
  "totalPatients": 245,
  "pendingConsultations": 8,
  "activeAppointments": 23
}
```

### GET `/api/hospital/consultation-trends`

Returns trend data for last 7 days:
```json
{
  "trends": [
    { "date": "2025-01-20", "count": 3 },
    { "date": "2025-01-21", "count": 5 },
    ...
  ]
}
```

## 📊 Database Queries

### Summary Cards Query

```sql
-- Total Consultants
SELECT COUNT(*) FROM consultants 
WHERE hospital_id = auth.uid();

-- Total Patients
SELECT COUNT(*) FROM patients 
WHERE hospital_id = auth.uid();

-- Pending Consultations
SELECT COUNT(*) FROM consultation_requests 
WHERE hospital_id = auth.uid() 
AND status = 'pending';

-- Active Appointments
SELECT COUNT(*) FROM appointments 
WHERE hospital_id = auth.uid() 
AND status IN ('scheduled', 'completed');
```

### Trends Query

```sql
SELECT DATE(created_at) AS date, COUNT(*) AS count
FROM consultation_requests
WHERE hospital_id = auth.uid()
  AND created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date ASC;
```

## 🧪 Testing

### Step 1: Create Test Data

Add some test data to see the dashboard in action:

```sql
-- Add test consultant
INSERT INTO consultants (hospital_id, name, email, specialization)
VALUES (auth.uid(), 'Dr. John Smith', 'john@hospital.com', 'Cardiologist');

-- Add test patient
INSERT INTO patients (hospital_id, name, email, phone)
VALUES (auth.uid(), 'Jane Doe', 'jane@example.com', '+1234567890');

-- Add test consultation request
INSERT INTO consultation_requests (hospital_id, patient_id, request_date, request_time, status)
VALUES (auth.uid(), 
  (SELECT id FROM patients WHERE hospital_id = auth.uid() LIMIT 1),
  CURRENT_DATE + INTERVAL '1 day',
  '10:00 AM',
  'pending'
);

-- Add test appointment
INSERT INTO appointments (hospital_id, patient_id, consultant_id, appointment_date, appointment_time)
VALUES (auth.uid(),
  (SELECT id FROM patients WHERE hospital_id = auth.uid() LIMIT 1),
  (SELECT id FROM consultants WHERE hospital_id = auth.uid() LIMIT 1),
  CURRENT_DATE + INTERVAL '2 days',
  '2:00 PM'
);
```

### Step 2: Verify Dashboard

1. Log in as a hospital user
2. Navigate to `/hospital/dashboard`
3. Verify:
   - Summary cards show correct counts
   - Chart displays trend data
   - Loading states work correctly
   - No console errors

## 🐛 Troubleshooting

### "No data" or "0" values shown

**Possible Causes:**
- No data in tables yet
- RLS policies blocking access
- Incorrect `hospital_id` in tables

**Solutions:**
- Add test data using queries above
- Verify RLS policies in Supabase
- Check `hospital_id` matches logged-in user's ID

### Chart not showing

**Possible Causes:**
- No consultation requests in last 7 days
- API endpoint error
- Recharts library not loaded

**Solutions:**
- Add consultation requests with recent dates
- Check browser console for errors
- Verify `recharts` is installed: `npm install recharts`

### Slow loading

**Possible Causes:**
- Large datasets
- Network latency
- Unoptimized queries

**Solutions:**
- Check indexes are created
- Use `Promise.all()` for parallel API calls (already implemented)
- Consider adding pagination for large tables

## 🚀 Future Enhancements

### Potential Additions:

1. **Profile Dropdown Menu**:
   - Account Info link
   - Settings
   - Profile picture upload

2. **Quick Actions**:
   - Add new consultant button
   - Schedule appointment button
   - View all requests button

3. **Advanced Analytics**:
   - Weekly/monthly trends
   - Patient demographics
   - Consultant performance metrics

4. **Notifications**:
   - Pending consultation alerts
   - Upcoming appointments
   - System updates

## 📝 Notes

### Performance Optimization

- All counts fetched in parallel using `Promise.all()`
- Summary and trends fetched simultaneously
- Indexes added for faster queries
- Efficient RLS policies reduce data transfer

### Security

- RLS ensures hospitals only see their own data
- All queries filtered by `hospital_id = auth.uid()`
- No data leaks between hospitals

---

**Next Steps:**
- Add more test data to see trends
- Customize the dashboard layout
- Add quick action buttons
- Implement notifications

