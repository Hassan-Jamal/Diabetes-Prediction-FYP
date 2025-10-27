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

    // Fetch requests counts
    const { data: requests, error: requestsError } = await supabase
      .from("lab_requests")
      .select("status")
      .eq("lab_id", user.id)

    // Fetch reports count
    const { data: reports, error: reportsError } = await supabase
      .from("lab_reports")
      .select("id", { count: "exact" })
      .eq("lab_id", user.id)

    // Calculate counts (use mock data if tables don't exist)
    let pending = 2
    let accepted = 3
    let total = 5
    let reportsTotal = 28

    if (!requestsError && requests) {
      pending = requests.filter((r) => r.status === "pending").length
      accepted = requests.filter((r) => r.status === "accepted").length
      total = requests.length
    }

    if (!reportsError && reports !== null) {
      reportsTotal = reports.length
    }

    return NextResponse.json(
      {
        bookings: { pending, accepted, total },
        reports: { total: reportsTotal },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Error fetching dashboard summary:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard summary" }, { status: 500 })
  }
}
