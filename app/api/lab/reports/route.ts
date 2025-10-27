import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Fetching reports for lab:", user.id)

    // Fetch reports from Supabase
    const { data: reports, error } = await supabase
      .from("lab_reports")
      .select("*")
      .eq("lab_id", user.id)
      .order("uploaded_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching lab reports:", error)
      return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
    }

    // Transform to match frontend format
    const formattedReports = reports.map((report) => ({
      id: report.id,
      patientId: report.patient_id,
      patientName: report.patient_name,
      reportType: report.report_type,
      fileUrl: report.file_url,
      uploadedAt: report.uploaded_at,
    }))

    console.log("[v0] Found reports:", formattedReports.length)

    return NextResponse.json({ reports: formattedReports }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error in GET /api/lab/reports:", error)
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { patientId, patientName, reportType, fileUrl } = await request.json()

    console.log("[v0] Creating report:", { labId: user.id, patientId, patientName, reportType, fileUrl })

    if (!patientId || !patientName || !reportType || !fileUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Insert report metadata into database
    console.log("[v0] Attempting to insert report with lab_id:", user.id)
    
    const { data, error } = await supabase
      .from("lab_reports")
      .insert({
        lab_id: user.id,
        patient_id: patientId,
        patient_name: patientName,
        report_type: reportType,
        file_url: fileUrl,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error inserting report:", error)
      console.error("[v0] Full error details:", JSON.stringify(error, null, 2))
      return NextResponse.json({ error: `Failed to save report: ${error.message}` }, { status: 500 })
    }

    // Transform to match frontend format
    const transformed = {
      id: data.id,
      patientId: data.patient_id,
      patientName: data.patient_name,
      reportType: data.report_type,
      fileUrl: data.file_url,
      uploadedAt: data.uploaded_at,
    }

    console.log("[v0] Report created successfully:", transformed.id)

    return NextResponse.json(transformed, { status: 201 })
  } catch (error) {
    console.error("[v0] Error in POST /api/lab/reports:", error)
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 })
  }
}
