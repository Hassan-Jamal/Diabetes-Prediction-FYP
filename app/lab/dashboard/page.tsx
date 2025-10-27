"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"

function LabDashboardContent() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Laboratory Dashboard</h1>
            <p className="mt-1 text-slate-600">Welcome, {user?.name}</p>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            style={{ borderColor: "#059669", color: "#059669" }}
            className="bg-transparent"
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Test Orders Card */}
          <Card className="border-2 border-[#059669] bg-white p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#d1fae5]">
              <svg className="h-6 w-6 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Test Orders</h3>
            <p className="mt-2 text-slate-600">Manage incoming test orders and samples</p>
            <Button style={{ backgroundColor: "#059669" }} className="mt-4 w-full text-white hover:opacity-90">
              View Orders
            </Button>
          </Card>

          {/* Test Results Card */}
          <Card className="border-2 border-[#059669] bg-white p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#d1fae5]">
              <svg className="h-6 w-6 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Test Results</h3>
            <p className="mt-2 text-slate-600">Upload and manage test results</p>
            <Button style={{ backgroundColor: "#059669" }} className="mt-4 w-full text-white hover:opacity-90">
              View Results
            </Button>
          </Card>

          {/* Diabetes Screening Card */}
          <Card className="border-2 border-[#059669] bg-white p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#d1fae5]">
              <svg className="h-6 w-6 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Diabetes Screening</h3>
            <p className="mt-2 text-slate-600">Manage diabetes screening programs</p>
            <Button style={{ backgroundColor: "#059669" }} className="mt-4 w-full text-white hover:opacity-90">
              View Screening
            </Button>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function LabDashboard() {
  return (
    <ProtectedRoute requiredRole="lab">
      <LabDashboardContent />
    </ProtectedRoute>
  )
}
