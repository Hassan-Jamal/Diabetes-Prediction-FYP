import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: user, error: userError } = await supabase.auth.getUser()

    if (userError || !user?.user) {
      console.log("[v0] Auth error:", userError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hospitalId = user.user.id
    console.log("[v0] Fetching patients for hospital:", hospitalId)
    
    const { searchParams } = new URL(request.url)
    const searchTerm = searchParams.get("search")
    const conditionFilter = searchParams.get("condition")
    const consultantFilter = searchParams.get("consultant")

    // Build the query
    let query = supabase
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
        consultant_id,
        consultants (
          id,
          name,
          specialization
        )
      `)
      .eq("hospital_id", hospitalId)
      .order("created_at", { ascending: false })

    // Apply filters
    if (searchTerm) {
      query = query.ilike("name", `%${searchTerm}%`)
    }

    if (conditionFilter && conditionFilter !== "all") {
      // Note: We'll need to add a condition field to the patients table
      // For now, we'll skip this filter
    }

    if (consultantFilter && consultantFilter !== "all") {
      query = query.eq("consultant_id", consultantFilter)
    }

    const { data: patients, error } = await query

    if (error) {
      console.error("[v0] Error fetching patients:", error)
      console.error("[v0] Error details:", JSON.stringify(error))
      return NextResponse.json({ error: `Failed to fetch patients: ${error.message}` }, { status: 500 })
    }

    console.log("[v0] Found patients:", patients?.length || 0)

    // Get lab report counts for each patient
    const patientsWithReports = await Promise.all(
      (patients || []).map(async (patient) => {
        try {
          const { count } = await supabase
            .from("lab_reports")
            .select("id", { count: "exact", head: true })
            .eq("patient_id", patient.id)

          return {
            ...patient,
            lab_reports_count: count || 0,
          }
        } catch (reportError) {
          console.log("[v0] Error fetching reports for patient:", patient.id, reportError)
          return {
            ...patient,
            lab_reports_count: 0,
          }
        }
      })
    )

    return NextResponse.json({ patients: patientsWithReports }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error in GET /api/hospital/patients:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch patients" }, { status: 500 })
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
    console.log("[v0] Creating patient for hospital:", hospitalId)
    
    const requestBody = await request.json()
    console.log("[v0] Request body:", requestBody)
    
    const { name, email, phone, age, gender, date_of_birth, address, consultant_id } = requestBody

    if (!name || !email) {
      console.log("[v0] Missing required fields:", { name: !!name, email: !!email })
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    console.log("[v0] Inserting patient with data:", {
      hospital_id: hospitalId,
      name,
      email,
      phone,
      age,
      gender,
      date_of_birth,
      address,
      consultant_id,
    })

    // Insert patient
    const { data, error } = await supabase
      .from("patients")
      .insert({
        hospital_id: hospitalId,
        name,
        email,
        phone: phone || null,
        age: age ? parseInt(age.toString()) : null,
        gender: gender || null,
        date_of_birth: date_of_birth || null,
        address: address || null,
        consultant_id: consultant_id || null,
      })
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
      console.error("[v0] Error creating patient:", error)
      console.error("[v0] Error details:", JSON.stringify(error))
      return NextResponse.json({ error: `Failed to create patient: ${error.message}` }, { status: 500 })
    }

    console.log("[v0] Patient created successfully:", data)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("[v0] Error in POST /api/hospital/patients:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create patient" }, { status: 500 })
  }
}
