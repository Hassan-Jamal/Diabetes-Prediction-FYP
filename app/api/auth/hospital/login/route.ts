export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return Response.json({ message: "Email and password are required" }, { status: 400 })
    }

    // In production, fetch from database
    // For demo, we'll create a mock token
    const token = Buffer.from(`${email}:hospital:${Date.now()}`).toString("base64")

    return Response.json(
      {
        message: "Login successful",
        token,
        role: "hospital",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Login error:", error)
    return Response.json({ message: "An error occurred during login" }, { status: 500 })
  }
}
