import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json()

    // Validate input
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create transporter (using environment variables)
    const transporter = nodemailer.createTransporter({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    // Email content
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: "hassanjamalbukhari@gmail.com",
      subject: `Contact Form: ${subject || "New Message"}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #0369a1; border-bottom: 2px solid #059669; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="margin-top: 20px; line-height: 1.8;">
            <p><strong style="color: #0369a1;">Name:</strong> ${name}</p>
            <p><strong style="color: #0369a1;">Email:</strong> ${email}</p>
            <p><strong style="color: #0369a1;">Subject:</strong> ${subject || "No subject"}</p>
          </div>
          
          <div style="margin-top: 20px; background-color: #f5f5f5; padding: 15px; border-radius: 4px;">
            <h3 style="color: #059669; margin-top: 0;">Message:</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
            <p>This email was sent from the DiabetesGuard contact form.</p>
            <p>Reply directly to this email to respond to the sender.</p>
          </div>
        </div>
      `,
    }

    // Send email
    await transporter.sendMail(mailOptions)

    console.log("Contact form email sent successfully")

    return NextResponse.json({ success: true, message: "Your message has been sent successfully!" }, { status: 200 })
  } catch (error) {
    console.error("Error sending contact email:", error)
    return NextResponse.json({ error: "Failed to send message. Please try again later." }, { status: 500 })
  }
}

