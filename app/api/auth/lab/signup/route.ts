import { hashPassword } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { labName, email, password, phone, address } = await request.json()

    if (!labName || !email || !password || !phone || !address) {
      return Response.json({ message: "All fields are required" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    const lab = {
      id: Date.now().toString(),
      labName,
      email,
      password: hashedPassword,
      phone,
      address,
      role: "lab",
      createdAt: new Date(),
    }

    console.log("[v0] Lab registered:", lab)

    return Response.json(
      { message: "Lab registered successfully", lab: { ...lab, password: undefined } },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Signup error:", error)
    return Response.json({ message: "An error occurred during signup" }, { status: 500 })
  }
}
