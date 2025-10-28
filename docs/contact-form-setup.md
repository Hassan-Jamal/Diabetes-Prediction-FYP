# Contact Form Setup Guide

## 📧 Email Configuration

The contact form requires Gmail SMTP credentials to send emails to hassanjamalbukhari@gmail.com.

### Step 1: Enable App-Specific Password in Gmail

1. Go to your [Google Account Security Settings](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled
3. Go to **App Passwords** (or search for "app passwords" in your account settings)
4. Generate a new app password:
   - Select "Mail" as the app
   - Select "Other" as the device
   - Name it: "DiabetesGuard Contact Form"
5. Copy the generated password (16 characters without spaces)

### Step 2: Configure Environment Variables

Add these variables to your `.env.local` file:

```env
# Email Configuration
SMTP_EMAIL=your_gmail_account@gmail.com
SMTP_PASSWORD=your_16_character_app_password
```

**Important Notes:**
- Use the **App-Specific Password**, NOT your regular Gmail password
- Never commit `.env.local` to version control
- The `SMTP_EMAIL` should be the Gmail account you want to send FROM
- The email will be sent TO: hassanjamalbukhari@gmail.com

### Step 3: Test the Contact Form

1. Start your development server: `npm run dev`
2. Navigate to the homepage
3. Scroll down to the "Get in Touch" section
4. Fill out the contact form:
   - Name
   - Email
   - Subject (optional)
   - Message
5. Click "Send Message"
6. Check hassanjamalbukhari@gmail.com for the email

### Troubleshooting

#### "Failed to send message" Error

**Possible Causes:**
- Environment variables not set correctly
- App-specific password incorrect
- Gmail account security settings blocking access

**Solutions:**
- Verify `.env.local` file exists in the project root
- Check that `SMTP_EMAIL` and `SMTP_PASSWORD` are correctly set
- Ensure you're using the app-specific password, not your regular password
- Try generating a new app password if the current one doesn't work

#### Email Not Received

**Check:**
- Spam/Junk folder in hassanjamalbukhari@gmail.com
- Server logs for any error messages
- Gmail account settings for security alerts

#### Production Deployment

For production environments (Vercel, Netlify, etc.):

1. Add environment variables in your hosting platform's dashboard
2. The same variables apply: `SMTP_EMAIL` and `SMTP_PASSWORD`
3. Never use your personal Gmail password in production
4. Always use app-specific passwords

### Alternative Email Services

If you prefer not to use Gmail:

1. **SendGrid** - Popular email service provider
2. **Mailgun** - Transactional email API
3. **AWS SES** - Amazon's email service
4. **Postmark** - Email delivery service

Update the `app/api/contact/route.ts` file to use your preferred service's API.

### Email Template

The contact form sends an HTML email with:
- Sender's name and email
- Subject line
- Message content
- Professional formatting
- Your contact information

### Testing Locally

You can test the contact form locally:

```bash
# Make sure .env.local exists with SMTP credentials
npm run dev

# Open http://localhost:3000
# Fill out and submit the contact form
# Check for console errors in both browser and terminal
```

---

**Next Steps:**
- The contact form is now ready to receive inquiries
- Emails will be sent to hassanjamalbukhari@gmail.com
- Users will see a success message after submitting

