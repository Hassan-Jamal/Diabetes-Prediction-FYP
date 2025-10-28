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
    const { searchParams } = new URL(request.url)
    
    // Get filter parameters
    const consultantFilter = searchParams.get("consultant")
    const patientFilter = searchParams.get("patient")
    const statusFilter = searchParams.get("status")
    const typeFilter = searchParams.get("type")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    console.log("[v0] Fetching appointments for hospital:", hospitalId)
    console.log("[v0] Filters:", { consultantFilter, patientFilter, statusFilter, typeFilter, dateFrom, dateTo })

    // Build the query
    let query = supabase
      .from("appointments")
      .select(`
        *,
        patients (
          id,
          name,
          email,
          phone
        ),
        consultants (
          id,
          name,
          specialization
        )
      `)
      .eq("hospital_id", hospitalId)
      .order("date", { ascending: false })
      .order("time", { ascending: true })

    // Apply filters
    if (consultantFilter) {
      query = query.ilike("consultants.name", `%${consultantFilter}%`)
    }
    
    if (patientFilter) {
      query = query.ilike("patients.name", `%${patientFilter}%`)
    }
    
    if (statusFilter && statusFilter !== "all") {
      query = query.eq("status", statusFilter)
    }
    
    if (typeFilter && typeFilter !== "all") {
      query = query.eq("type", typeFilter)
    }
    
    if (dateFrom) {
      query = query.gte("date", dateFrom)
    }
    
    if (dateTo) {
      query = query.lte("date", dateTo)
    }

    const { data: appointments, error } = await query

    if (error) {
      console.error("[v0] Error fetching appointments:", error)
      return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 })
    }

    console.log("[v0] Found appointments:", appointments?.length || 0)

    return NextResponse.json({ appointments: appointments || [] }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error in GET /api/hospital/appointments:", error)
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: user, error: userError } = await supabase.auth.getUser()

    if (userError || !user?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hospitalId = user.user.id
    const appointmentData = await request.json()

    console.log("[v0] Creating appointment:", appointmentData)

    // Validate required fields
    const { consultant_id, patient_id, date, time, type } = appointmentData
    if (!consultant_id || !patient_id || !date || !time || !type) {
      return NextResponse.json({ 
        error: "Missing required fields: consultant_id, patient_id, date, time, type" 
      }, { status: 400 })
    }

    const { data: appointment, error } = await supabase
      .from("appointments")
      .insert({
        hospital_id: hospitalId,
        consultant_id,
        patient_id,
        date,
        time,
        type,
        status: appointmentData.status || "scheduled",
        notes: appointmentData.notes || null
      })
      .select(`
        *,
        patients (
          id,
          name,
          email
        ),
        consultants (
          id,
          name,
          specialization
        )
      `)
      .single()

    if (error) {
      console.error("[v0] Error creating appointment:", error)
      return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 })
    }

    console.log("[v0] Appointment created successfully:", appointment.id)

    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    console.error("[v0] Error in POST /api/hospital/appointments:", error)
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 })
  }
}
