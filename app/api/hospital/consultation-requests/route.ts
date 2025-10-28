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
    console.log("[v0] Fetching consultation requests for hospital:", hospitalId)
    
    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get("status")

    // Build the query
    let query = supabase
      .from("consultation_requests")
      .select(`
        id,
        request_date,
        request_time,
        status,
        notes,
        is_urgent,
        created_at,
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
      .eq("hospital_id", hospitalId)
      .order("created_at", { ascending: false })

    // Apply status filter
    if (statusFilter && statusFilter !== "all") {
      query = query.eq("status", statusFilter)
    }

    const { data: requests, error } = await query

    if (error) {
      console.error("[v0] Error fetching consultation requests:", error)
      console.error("[v0] Error details:", JSON.stringify(error))
      return NextResponse.json({ error: `Failed to fetch consultation requests: ${error.message}` }, { status: 500 })
    }

    console.log("[v0] Found consultation requests:", requests?.length || 0)

    return NextResponse.json({ requests: requests || [] }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error in GET /api/hospital/consultation-requests:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch consultation requests" }, { status: 500 })
  }
}

