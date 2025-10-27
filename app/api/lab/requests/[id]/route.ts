import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json()
    const { id } = params
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!status || (status !== "accepted" && status !== "rejected")) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Update request status in database
    const { data, error } = await supabase
      .from("lab_requests")
      .update({
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("lab_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating request:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, request: data }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error updating request:", error)
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 })
  }
}
