import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"
import { generateResetToken } from "@/lib/auth-utils"
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, role } = body

    if (!email || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()

    // Find user by email and role
    const { data: user } = await supabase.from("users").select("id").eq("email", email).eq("role", role).single()

    if (!user) {
      // Don't reveal if email exists for security
      return NextResponse.json({ success: true, message: "If email exists, reset link will be sent" }, { status: 200 })
    }

    // Generate reset token
    const resetToken = generateResetToken()
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour

    // Store reset token
    await supabase.from("password_reset_tokens").insert([
      {
        user_id: user.id,
        token: resetToken,
        expires_at: expiresAt.toISOString(),
      },
    ])

    // Send email
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/${role}/reset-password?token=${resetToken}`

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request - Healthcare Portal",
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetLink}" style="background-color: #0369a1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    })

    return NextResponse.json({ success: true, message: "If email exists, reset link will be sent" }, { status: 200 })
  } catch (error) {
    console.error("[v0] Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
