import { hashPassword } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { hospitalName, email, password, phone, address } = await request.json()

    // Validation
    if (!hospitalName || !email || !password || !phone || !address) {
      return Response.json({ message: "All fields are required" }, { status: 400 })
    }

    // In production, check if email already exists in database
    // For now, we'll simulate with localStorage
    const hashedPassword = await hashPassword(password)

    // Simulate storing in database
    const hospital = {
      id: Date.now().toString(),
      hospitalName,
      email,
      password: hashedPassword,
      phone,
      address,
      role: "hospital",
      createdAt: new Date(),
    }

    // Store in localStorage (in production, use database)
    if (typeof window === "undefined") {
      // Server-side storage simulation
      console.log("[v0] Hospital registered:", hospital)
    }

    return Response.json(
      { message: "Hospital registered successfully", hospital: { ...hospital, password: undefined } },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Signup error:", error)
    return Response.json({ message: "An error occurred during signup" }, { status: 500 })
  }
}
