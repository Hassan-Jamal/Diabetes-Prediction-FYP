import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"
import { hashPassword, generateSessionToken } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      confirmPassword,
      role,
      organizationName,
      organizationType,
      contactPerson,
      phone,
      address,
      city,
      state,
      postalCode,
      country,
    } = body

    // Validation
    if (!email || !password || !role || !organizationName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()

    const { data: existingUser, error: checkError } = await supabase.from("users").select("id").eq("email", email)

    if (checkError) {
      console.error("[v0] Check user error:", checkError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (existingUser && existingUser.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const { data: newUser, error: userError } = await supabase
      .from("users")
      .insert([
        {
          email,
          password_hash: passwordHash,
          role,
          organization_name: organizationName,
          organization_type: organizationType,
          contact_person: contactPerson,
          phone,
          address,
          city,
          state,
          postal_code: postalCode,
          country,
        },
      ])
      .select()
      .single()

    if (userError) {
      console.error("[v0] User creation error:", userError)
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    // Create session
    const sessionToken = generateSessionToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const { error: sessionError } = await supabase.from("sessions").insert([
      {
        user_id: newUser.id,
        token: sessionToken,
        expires_at: expiresAt.toISOString(),
      },
    ])

    if (sessionError) {
      console.error("[v0] Session creation error:", sessionError)
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
    }

    // Set session cookie
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          organizationName: newUser.organization_name,
        },
      },
      { status: 201 },
    )

    response.cookies.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error("[v0] Signup error:", error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}
