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

    // Fetch all counts in parallel
    const [
      totalConsultants,
      totalPatients,
      pendingConsultations,
      activeAppointments,
    ] = await Promise.all([
      // Total Consultants
      supabase.from("consultants").select("id", { count: "exact", head: true }).eq("hospital_id", hospitalId),
      // Total Patients
      supabase.from("patients").select("id", { count: "exact", head: true }).eq("hospital_id", hospitalId),
      // Pending Consultation Requests
      supabase
        .from("consultation_requests")
        .select("id", { count: "exact", head: true })
        .eq("hospital_id", hospitalId)
        .eq("status", "pending"),
      // Active Appointments (scheduled or upcoming)
      supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("hospital_id", hospitalId)
        .in("status", ["scheduled", "completed"]),
    ])

    return NextResponse.json(
      {
        totalConsultants: totalConsultants.count || 0,
        totalPatients: totalPatients.count || 0,
        pendingConsultations: pendingConsultations.count || 0,
        activeAppointments: activeAppointments.count || 0,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Error fetching hospital dashboard summary:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard summary" }, { status: 500 })
  }
}

