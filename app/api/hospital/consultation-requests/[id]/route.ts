import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: user, error: userError } = await supabase.auth.getUser()

    if (userError || !user?.user) {
      console.log("[v0] Auth error:", userError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hospitalId = user.user.id
    const requestBody = await request.json()
    console.log("[v0] Updating consultation request:", id, requestBody)

    const { status, consultant_id, is_urgent } = requestBody

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (status) updateData.status = status
    if (consultant_id) updateData.consultant_id = consultant_id
    if (is_urgent !== undefined) updateData.is_urgent = is_urgent

    // Update the consultation request
    const { data: updatedRequest, error: updateError } = await supabase
      .from("consultation_requests")
      .update(updateData)
      .eq("id", id)
      .eq("hospital_id", hospitalId)
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
      .single()

    if (updateError) {
      console.error("[v0] Error updating consultation request:", updateError)
      console.error("[v0] Error details:", JSON.stringify(updateError))
      return NextResponse.json({ error: `Failed to update consultation request: ${updateError.message}` }, { status: 500 })
    }

    console.log("[v0] Consultation request updated successfully:", updatedRequest)

    // If status is approved, create an appointment
    if (status === "accepted") {
      const { data: consultationData, error: fetchError } = await supabase
        .from("consultation_requests")
        .select("patient_id, consultant_id, request_date, request_time")
        .eq("id", id)
        .single()

      if (!fetchError && consultationData?.patient_id && consultationData?.consultant_id) {
        const { data: appointment, error: appointmentError } = await supabase
          .from("appointments")
          .insert({
            hospital_id: hospitalId,
            patient_id: consultationData.patient_id,
            consultant_id: consultationData.consultant_id,
            appointment_date: consultationData.request_date,
            appointment_time: consultationData.request_time,
            status: "scheduled",
          })
          .select()
          .single()

        if (appointmentError) {
          console.error("[v0] Error creating appointment:", appointmentError)
        } else {
          console.log("[v0] Appointment created successfully:", appointment)
        }
      }
    }

    return NextResponse.json(updatedRequest, { status: 200 })
  } catch (error) {
    console.error("[v0] Error in PATCH /api/hospital/consultation-requests/[id]:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update consultation request" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: user, error: userError } = await supabase.auth.getUser()

    if (userError || !user?.user) {
      console.log("[v0] Auth error:", userError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hospitalId = user.user.id

    // Delete consultation request
    const { error } = await supabase
      .from("consultation_requests")
      .delete()
      .eq("id", id)
      .eq("hospital_id", hospitalId)

    if (error) {
      console.error("[v0] Error deleting consultation request:", error)
      return NextResponse.json({ error: `Failed to delete consultation request: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Consultation request deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error in DELETE /api/hospital/consultation-requests/[id]:", error)
    return NextResponse.json({ error: "Failed to delete consultation request" }, { status: 500 })
  }
}

