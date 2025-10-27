// Email service for sending password reset codes and notifications
// This is a placeholder that should be integrated with your email provider (SendGrid, Resend, etc.)

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    // TODO: Implement actual email sending using your email provider
    // Example with Resend:
    // const { data, error } = await resend.emails.send({
    //   from: "noreply@healthcareportal.com",
    //   to: options.to,
    //   subject: options.subject,
    //   html: options.html,
    // });

    console.log("Email would be sent to:", options.to)
    console.log("Subject:", options.subject)
  } catch (error) {
    console.error("Failed to send email:", error)
    throw new Error("Failed to send email")
  }
}

export function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function getPasswordResetEmailTemplate(resetCode: string, organizationName: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0369a1; color: white; padding: 20px; text-align: center; border-radius: 5px; }
          .content { padding: 20px; background-color: #f9fafb; }
          .code { font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello ${organizationName},</p>
            <p>We received a request to reset your password. Use the code below to proceed:</p>
            <div class="code">${resetCode}</div>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Healthcare Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}
