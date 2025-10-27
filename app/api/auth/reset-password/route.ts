import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"
import { hashPassword } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password, confirmPassword } = body

    if (!token || !password || !confirmPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()

    // Find valid reset token
    const { data: resetToken } = await supabase
      .from("password_reset_tokens")
      .select("user_id")
      .eq("token", token)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (!resetToken) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    // Hash new password
    const passwordHash = await hashPassword(password)

    // Update user password
    await supabase.from("users").update({ password_hash: passwordHash }).eq("id", resetToken.user_id)

    // Delete used reset token
    await supabase.from("password_reset_tokens").delete().eq("token", token)

    return NextResponse.json({ success: true, message: "Password reset successfully" }, { status: 200 })
  } catch (error) {
    console.error("[v0] Reset password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
