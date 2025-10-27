import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session_token")?.value

    if (sessionToken) {
      const supabase = await getSupabaseServerClient()
      await supabase.from("sessions").delete().eq("token", sessionToken)
    }

    const response = NextResponse.json({ success: true, message: "Logged out successfully" }, { status: 200 })

    response.cookies.delete("session_token")
    return response
  } catch (error) {
    console.error("[v0] Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
