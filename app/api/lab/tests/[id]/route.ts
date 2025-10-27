import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// In-memory mock store (remove when Supabase tables are created)
const mockTests = [
  {
    id: "1",
    testName: "Glucose Test",
    price: 50,
    description: "Blood glucose level test to check for diabetes",
    labId: "lab1",
  },
  {
    id: "2",
    testName: "HbA1c",
    price: 75,
    description: "Hemoglobin A1c test for long-term glucose monitoring",
    labId: "lab1",
  },
  {
    id: "3",
    testName: "Insulin Level",
    price: 85,
    description: "Fasting insulin level test",
    labId: "lab1",
  },
]

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { testName, price, description } = await request.json()
    const { id } = await params
    const supabase = await createClient()

    console.log("[v0] PATCH request for test:", { id, testName, price, description })

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("[v0] Auth error:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!testName || !price || !description) {
      console.log("[v0] Missing fields:", { testName: !!testName, price: !!price, description: !!description })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Try to update in Supabase
    const { data, error } = await supabase
      .from("lab_tests")
      .update({
        test_name: testName,
        price: price,
        description: description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("lab_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Supabase update error:", error)
      return NextResponse.json({ error: `Failed to update test: ${error.message}` }, { status: 500 })
    }

    if (!data) {
      console.log("[v0] No data returned from update")
      return NextResponse.json({ error: "Test not found or unauthorized" }, { status: 404 })
    }

    console.log("[v0] Update successful:", data)

    // Transform to match frontend format
    const transformed = {
      id: data.id,
      testName: data.test_name,
      price: data.price,
      description: data.description,
      labId: data.lab_id,
    }

    return NextResponse.json(transformed, { status: 200 })
  } catch (error) {
    console.error("[v0] Error updating test:", error)
    return NextResponse.json({ error: "Failed to update test" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    console.log("[v0] DELETE request for test:", id)

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("[v0] Auth error:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Try to delete from Supabase
    const { error } = await supabase
      .from("lab_tests")
      .delete()
      .eq("id", id)
      .eq("lab_id", user.id)

    if (error) {
      console.error("[v0] Supabase delete error:", error)
      return NextResponse.json({ error: `Failed to delete test: ${error.message}` }, { status: 500 })
    }

    console.log("[v0] Delete successful")
    return NextResponse.json({ success: true, message: "Test deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error deleting test:", error)
    return NextResponse.json({ error: "Failed to delete test" }, { status: 500 })
  }
}
