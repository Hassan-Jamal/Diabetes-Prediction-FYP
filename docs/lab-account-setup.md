# Lab Account Information Page - Setup Guide

This guide explains how to set up and use the Lab Account Information feature.

## 📋 Prerequisites

- Supabase project with authentication enabled
- Database access to run SQL scripts
- Storage bucket for profile images

## 🗄️ Database Setup

### Step 1: Create the `labs` Table

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `scripts/07-create-labs-table.sql`
4. Click **Run**

This creates the `labs` table with the following structure:
```sql
CREATE TABLE labs (
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
```

### Step 2: Create Storage Bucket for Profile Images

1. Go to your Supabase Dashboard
2. Navigate to **Storage**
3. Click **New bucket**
4. Configure the bucket:
   - **Name**: `lab-profile-images`
   - **Public**: `Yes`
   - **File size limit**: `5 MB`
5. Click **Create bucket**

### Step 3: Add Storage Policies

Run the SQL script `scripts/08-create-profile-images-bucket.sql`:

1. Go to **SQL Editor**
2. Copy and paste the contents of `scripts/08-create-profile-images-bucket.sql`
3. Click **Run**

This creates policies that allow:
- Labs to upload their own profile images
- Anyone to view profile images (since bucket is public)
- Labs to update and delete their own images

## 🎨 Features

### Profile Display

- **Profile Picture**: Circular avatar with edit button overlay
- **Lab Name**: From the database
- **Email**: From authentication
- **Phone**: Editable field
- **Address**: Editable textarea
- **Registration ID**: Display-only (from signup)
- **Member Since**: Account creation date

### Profile Picture Upload

1. Click the camera icon on the profile picture
2. Select an image file (max 5MB)
3. File is uploaded to Supabase Storage at `lab-profile-images/labs/{userId}/profile.{ext}`
4. Public URL is generated and saved to database
5. Profile picture updates instantly

### Profile Information Update

1. Edit phone and/or address fields
2. Click **Save Changes**
3. Updates are saved to the database
4. Success toast notification appears

## 🔐 Security

### Row Level Security (RLS)

The `labs` table has these RLS policies:
- **View**: Labs can only view their own data (`id = auth.uid()`)
- **Update**: Labs can only update their own data
- **Insert**: Labs can only insert their own data

### Storage Security

- Profile images are stored in a public bucket
- Upload path: `labs/{userId}/profile.{ext}`
- Each lab can only upload to their own folder
- Images are publicly accessible via URL

## 📱 Page Route

Access the account page at:
```
/lab/account
```

## 🧪 Testing

### Step 1: Create a Lab Profile (Auto-Created)

When you first visit the account page:
1. The system checks if a lab profile exists
2. If not found, creates one automatically from:
   - User ID (from auth)
   - Email (from auth)
   - Organization name (from signup metadata)
   - Phone, address (from signup metadata)
   - License number (from signup metadata)

### Step 2: Upload Profile Picture

1. Click the camera icon on the profile picture
2. Select an image (JPEG, PNG, etc.)
3. Wait for upload to complete
4. Verify the image appears immediately

### Step 3: Update Profile Information

1. Edit the **Phone** field
2. Edit the **Address** field
3. Click **Save Changes**
4. Verify success toast appears
5. Refresh the page and verify changes persisted

## 🐛 Troubleshooting

### "Please log in to view your profile" Error

**Solution**: 
- Make sure you're logged in as a lab user
- Check that your session is valid
- Try logging out and back in

### "Failed to load profile" Error

**Causes**:
- `labs` table doesn't exist
- RLS policies not set up
- User doesn't have a lab profile

**Solutions**:
- Run `scripts/07-create-labs-table.sql`
- Check RLS policies in Supabase dashboard
- Try refreshing the page (auto-creation should trigger)

### Profile Picture Won't Upload

**Causes**:
- Storage bucket doesn't exist
- Storage bucket isn't public
- RLS policies blocking upload
- File size too large (> 5MB)

**Solutions**:
- Create `lab-profile-images` bucket in Supabase Storage
- Make the bucket public
- Run `scripts/08-create-profile-images-bucket.sql`
- Use a smaller image file

### Changes Won't Save

**Causes**:
- Network error
- RLS policy blocking update
- Invalid data

**Solutions**:
- Check browser console for errors
- Verify you're logged in
- Check that RLS policies are correct
- Try again with valid data

## 📝 Notes

### Auto-Creation of Lab Profiles

When a lab user signs up and doesn't have a record in the `labs` table:
- The system automatically creates a profile on first visit
- Data is pulled from:
  - Signup form fields (stored in `user_metadata`)
  - Auth user ID and email

### Profile Picture Storage

- Images are stored in: `lab-profile-images/labs/{userId}/profile.{ext}`
- Each lab has their own folder
- Only one profile image per lab (upsert mode)
- Previous images are overwritten

### Non-Editable Fields

These fields cannot be edited from the UI:
- **Name**: From signup, managed by admin
- **Email**: From auth, used for login
- **Registration ID**: From signup, should not change

These fields are display-only with a gray background to indicate they're locked.

## 🚀 Next Steps

### Optional Enhancements

1. **Change Password**: Add a "Change Password" button that links to password reset
2. **Account Statistics**: Show total reports uploaded, tests offered, etc.
3. **Delete Account**: Add account deletion functionality
4. **Profile Verification**: Add verification status badge
5. **Notifications**: Add email/phone notification preferences

### Production Checklist

Before deploying to production:

- [ ] Test profile picture upload with various file types
- [ ] Test profile updates persist correctly
- [ ] Verify RLS policies are secure
- [ ] Set up file size limits
- [ ] Consider using signed URLs instead of public bucket
- [ ] Add image compression for smaller file sizes
- [ ] Test with slow network connections
- [ ] Add loading states for better UX
- [ ] Verify mobile responsiveness

## 📚 Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Image Optimization](https://nextjs.org/docs/pages/built-in/next-image)

---

**Last Updated**: October 2024

