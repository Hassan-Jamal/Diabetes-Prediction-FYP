import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: user, error: userError } = await supabase.auth.getUser()

    if (userError || !user?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hospitalId = user.user.id

    // Fetch patient details with consultant info
    const { data: patient, error } = await supabase
      .from("patients")
      .select(`
        id,
        name,
        email,
        phone,
        age,
        gender,
        date_of_birth,
        address,
        created_at,
        consultants (
          id,
          name,
          specialization,
          email
        )
      `)
      .eq("id", id)
      .eq("hospital_id", hospitalId)
      .single()

    if (error) {
      console.error("[v0] Error fetching patient:", error)
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    // Fetch lab reports for this patient
    const { data: labReports, error: reportsError } = await supabase
      .from("lab_reports")
      .select(`
        id,
        patient_id,
        patient_name,
        report_type,
        file_url,
        uploaded_at,
        labs (
          id,
          organization_name
        )
      `)
      .eq("patient_id", id)
      .order("uploaded_at", { ascending: false })

    if (reportsError) {
      console.error("[v0] Error fetching lab reports:", reportsError)
    }

    return NextResponse.json({
      patient,
      lab_reports: labReports || [],
    }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error in GET /api/hospital/patients/[id]:", error)
    return NextResponse.json({ error: "Failed to fetch patient" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: user, error: userError } = await supabase.auth.getUser()

    if (userError || !user?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hospitalId = user.user.id
    const updateData = await request.json()

    // Update patient
    const { data, error } = await supabase
      .from("patients")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("hospital_id", hospitalId)
      .select(`
        id,
        name,
        email,
        phone,
        age,
        gender,
        date_of_birth,
        address,
        created_at,
        consultants (
          id,
          name,
          specialization
        )
      `)
      .single()

    if (error) {
      console.error("[v0] Error updating patient:", error)
      return NextResponse.json({ error: "Failed to update patient" }, { status: 500 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("[v0] Error in PATCH /api/hospital/patients/[id]:", error)
    return NextResponse.json({ error: "Failed to update patient" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: user, error: userError } = await supabase.auth.getUser()

    if (userError || !user?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hospitalId = user.user.id

    // Delete patient
    const { error } = await supabase
      .from("patients")
      .delete()
      .eq("id", id)
      .eq("hospital_id", hospitalId)

    if (error) {
      console.error("[v0] Error deleting patient:", error)
      return NextResponse.json({ error: "Failed to delete patient" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Patient deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error in DELETE /api/hospital/patients/[id]:", error)
    return NextResponse.json({ error: "Failed to delete patient" }, { status: 500 })
  }
}
