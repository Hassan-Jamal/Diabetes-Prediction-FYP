import { hashPassword } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, token, newPassword } = await request.json()

    if (!email || !token || !newPassword) {
      return Response.json({ message: "All fields are required" }, { status: 400 })
    }

    // In production, verify token and update password in database
    const hashedPassword = await hashPassword(newPassword)

    console.log("[v0] Password reset for:", email)
    console.log("[v0] New hashed password:", hashedPassword)

    return Response.json({ message: "Password reset successfully" }, { status: 200 })
  } catch (error) {
    console.error("[v0] Reset password error:", error)
    return Response.json({ message: "An error occurred" }, { status: 500 })
  }
}
