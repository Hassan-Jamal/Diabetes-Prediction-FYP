import { generateResetToken } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return Response.json({ message: "Email is required" }, { status: 400 })
    }

    const resetToken = generateResetToken()
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/lab/forgot-password?token=${resetToken}&email=${email}`

    console.log("[v0] Password reset link:", resetLink)
    console.log("[v0] Reset token:", resetToken)

    return Response.json(
      {
        message: "Password reset email sent",
        resetToken,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Forgot password error:", error)
    return Response.json({ message: "An error occurred" }, { status: 500 })
  }
}
