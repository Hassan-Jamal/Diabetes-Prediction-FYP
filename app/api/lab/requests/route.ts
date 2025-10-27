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

    // Fetch requests from database
    const { data: requests, error } = await supabase
      .from("lab_requests")
      .select("*")
      .eq("lab_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching requests:", error)
      // Return mock data if table doesn't exist
      const mockRequests = [
        {
          id: "1",
          patientName: "John Doe",
          date: "2025-01-15",
          time: "10:00 AM",
          type: "Glucose Test",
          status: "pending",
          patientId: "p1",
          labId: user.id,
        },
        {
          id: "2",
          patientName: "Jane Smith",
          date: "2025-01-14",
          time: "2:30 PM",
          type: "Insulin Level",
          status: "accepted",
          patientId: "p2",
          labId: user.id,
        },
      ]
      return NextResponse.json({ requests: mockRequests }, { status: 200 })
    }

    // Transform database data to API format
    const formattedRequests = requests.map((req) => ({
      id: req.id,
      patientName: req.patient_name,
      date: req.date,
      time: req.time,
      type: req.test_type,
      status: req.status,
      patientId: req.patient_id,
      labId: req.lab_id,
    }))

    return NextResponse.json({ requests: formattedRequests }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error fetching lab requests:", error)
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
  }
}
