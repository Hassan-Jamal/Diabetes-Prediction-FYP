import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { data: user, error: userError } = await supabase.auth.getUser()

    if (userError || !user?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const hospitalId = user.user.id

    // Fetch consultant details
    const { data: consultant, error } = await supabase
      .from("consultants")
      .select("*")
      .eq("id", id)
      .eq("hospital_id", hospitalId)
      .single()

    if (error || !consultant) {
      console.error("[v0] Error fetching consultant:", error)
      return NextResponse.json({ error: "Consultant not found" }, { status: 404 })
    }

    // Fetch assigned patients
    const { data: patients, error: patientsError } = await supabase
      .from("patients")
      .select("id, name, age, gender, created_at")
      .eq("hospital_id", hospitalId)
      .eq("consultant_id", id)
      .order("created_at", { ascending: false })
      .limit(10)

    // Calculate workload
    const { count: workload } = await supabase
      .from("patients")
      .select("id", { count: "exact", head: true })
      .eq("hospital_id", hospitalId)
      .eq("consultant_id", id)

    return NextResponse.json(
      {
        ...consultant,
        workload: workload || 0,
        patients: patients || [],
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Error in GET /api/hospital/consultants/[id]:", error)
    return NextResponse.json({ error: "Failed to fetch consultant details" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { data: user, error: userError } = await supabase.auth.getUser()

    if (userError || !user?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const hospitalId = user.user.id
    const { status, name, email, specialization } = await request.json()

    // Update consultant
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (status) updateData.status = status
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (specialization !== undefined) updateData.specialization = specialization

    const { data, error } = await supabase
      .from("consultants")
      .update(updateData)
      .eq("id", id)
      .eq("hospital_id", hospitalId)
      .select()
      .single()

    if (error || !data) {
      console.error("[v0] Error updating consultant:", error)
      return NextResponse.json({ error: "Failed to update consultant" }, { status: 500 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("[v0] Error in PATCH /api/hospital/consultants/[id]:", error)
    return NextResponse.json({ error: "Failed to update consultant" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { data: user, error: userError } = await supabase.auth.getUser()

    if (userError || !user?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const hospitalId = user.user.id

    // Delete consultant
    const { error } = await supabase.from("consultants").delete().eq("id", id).eq("hospital_id", hospitalId)

    if (error) {
      console.error("[v0] Error deleting consultant:", error)
      return NextResponse.json({ error: "Failed to delete consultant" }, { status: 500 })
    }

    return NextResponse.json({ message: "Consultant deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error in DELETE /api/hospital/consultants/[id]:", error)
    return NextResponse.json({ error: "Failed to delete consultant" }, { status: 500 })
  }
}

