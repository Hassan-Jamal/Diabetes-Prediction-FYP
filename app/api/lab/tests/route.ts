import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// In-memory store for mock data (replace with Supabase in production)
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
  {
    id: "4",
    testName: "Lipid Panel",
    price: 90,
    description: "Complete cholesterol and triglyceride panel",
    labId: "lab1",
  },
  {
    id: "5",
    testName: "Creatinine Test",
    price: 45,
    description: "Kidney function test via creatinine levels",
    labId: "lab1",
  },
]

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

    // Try to fetch from Supabase, fallback to mock data
    const { data: tests, error } = await supabase
      .from("lab_tests")
      .select("*")
      .eq("lab_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.log("[v0] Supabase error, using mock data:", error.message)
      // Return mock data if table doesn't exist
      return NextResponse.json({ tests: mockTests }, { status: 200 })
    }

    // Transform database data to API format
    const formattedTests = tests.map((test) => ({
      id: test.id,
      testName: test.test_name,
      price: test.price,
      description: test.description,
      labId: test.lab_id,
    }))

    return NextResponse.json({ tests: formattedTests }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error fetching lab tests:", error)
    return NextResponse.json({ tests: mockTests }, { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { testName, price, description } = await request.json()
    const supabase = await createClient()

    console.log("[v0] POST request for new test:", { testName, price, description })

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

    // Try to insert into Supabase
    const { data, error } = await supabase
      .from("lab_tests")
      .insert({
        lab_id: user.id,
        test_name: testName,
        price: price,
        description: description,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Supabase insert error:", error)
      return NextResponse.json({ error: `Failed to create test: ${error.message}` }, { status: 500 })
    }

    console.log("[v0] Create successful:", data)

    // Transform to match frontend format
    const transformed = {
      id: data.id,
      testName: data.test_name,
      price: data.price,
      description: data.description,
      labId: data.lab_id,
    }

    return NextResponse.json(transformed, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating test:", error)
    return NextResponse.json({ error: "Failed to create test" }, { status: 500 })
  }
}
