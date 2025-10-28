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

    // Fetch hospital profile
    const { data: profile, error } = await supabase
      .from("hospitals")
      .select("*")
      .eq("id", hospitalId)
      .single()

    if (error) {
      console.error("[v0] Error fetching hospital profile:", error)
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }

    return NextResponse.json(profile, { status: 200 })
  } catch (error) {
    console.error("[v0] Error in GET /api/hospital/profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: user, error: userError } = await supabase.auth.getUser()

    if (userError || !user?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hospitalId = user.user.id
    const updateData = await request.json()

    // Update hospital profile
    const { data, error } = await supabase
      .from("hospitals")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", hospitalId)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating hospital profile:", error)
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("[v0] Error in PATCH /api/hospital/profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}