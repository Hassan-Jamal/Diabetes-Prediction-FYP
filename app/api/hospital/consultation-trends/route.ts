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

    // Get last 7 days of consultation requests
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: trends, error } = await supabase
      .from("consultation_requests")
      .select("created_at, status")
      .eq("hospital_id", hospitalId)
      .gte("created_at", sevenDaysAgo.toISOString())

    if (error) {
      console.error("[v0] Error fetching trends:", error)
      return NextResponse.json({ trends: [] }, { status: 200 })
    }

    // Group by date
    const groupedTrends: Record<string, number> = {}
    
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split("T")[0]
      groupedTrends[dateKey] = 0
    }

    trends?.forEach((trend) => {
      const date = new Date(trend.created_at).toISOString().split("T")[0]
      if (groupedTrends[date] !== undefined) {
        groupedTrends[date]++
      }
    })

    // Convert to array format
    const trendData = Object.entries(groupedTrends)
      .map(([date, count]) => ({ date, count }))
      .reverse() // Most recent first

    return NextResponse.json({ trends: trendData }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error fetching consultation trends:", error)
    return NextResponse.json({ trends: [] }, { status: 200 })
  }
}

