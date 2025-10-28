import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: user, error: userError } = await supabase.auth.getUser()

    if (userError || !user?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hospitalId = user.user.id

    // Fetch consultants with workload count
    const { data: consultants, error } = await supabase
      .from("consultants")
      .select("id, name, email, specialization, status, created_at")
      .eq("hospital_id", hospitalId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching consultants:", error)
      return NextResponse.json({ error: "Failed to fetch consultants" }, { status: 500 })
    }

    // Calculate workload for each consultant
    const consultantsWithWorkload = await Promise.all(
      consultants.map(async (consultant) => {
        const { count } = await supabase
          .from("patients")
          .select("id", { count: "exact", head: true })
          .eq("hospital_id", hospitalId)
          .eq("consultant_id", consultant.id)

        return {
          ...consultant,
          workload: count || 0,
        }
      })
    )

    return NextResponse.json({ consultants: consultantsWithWorkload }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error in GET /api/hospital/consultants:", error)
    return NextResponse.json({ error: "Failed to fetch consultants" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: user, error: userError } = await supabase.auth.getUser()

    if (userError || !user?.user) {
      console.log("[v0] Auth error:", userError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hospitalId = user.user.id
    const body = await request.json()
    console.log("[v0] POST request body:", body)
    
    const { name, email, specialization } = body

    if (!name || !email) {
      console.log("[v0] Missing required fields:", { name: !!name, email: !!email })
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    // Insert consultant with 'active' status (matching schema)
    const { data, error } = await supabase
      .from("consultants")
      .insert({
        hospital_id: hospitalId,
        name,
        email,
        specialization: specialization || null,
        status: "active", // Use 'active' instead of 'approved' to match schema
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating consultant:", error)
      console.error("[v0] Error details:", JSON.stringify(error))
      return NextResponse.json({ error: `Failed to create consultant: ${error.message}` }, { status: 500 })
    }

    console.log("[v0] Consultant created successfully:", data)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("[v0] Error in POST /api/hospital/consultants:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create consultant" }, { status: 500 })
  }
}

