"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"

function HospitalDashboardContent() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Hospital Dashboard</h1>
            <p className="mt-1 text-slate-600">Welcome, {user?.name}</p>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            style={{ borderColor: "#0369a1", color: "#0369a1" }}
            className="bg-transparent"
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Consultations Card */}
          <Card className="border-2 border-[#0369a1] bg-white p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#e0f2fe]">
              <svg className="h-6 w-6 text-[#0369a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Consultations</h3>
            <p className="mt-2 text-slate-600">Manage patient consultations and diabetes predictions</p>
            <Button style={{ backgroundColor: "#0369a1" }} className="mt-4 w-full text-white hover:opacity-90">
              View Consultations
            </Button>
          </Card>

          {/* Patient Records Card */}
          <Card className="border-2 border-[#0369a1] bg-white p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#e0f2fe]">
              <svg className="h-6 w-6 text-[#0369a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Patient Records</h3>
            <p className="mt-2 text-slate-600">Access and manage patient medical records</p>
            <Button style={{ backgroundColor: "#0369a1" }} className="mt-4 w-full text-white hover:opacity-90">
              View Records
            </Button>
          </Card>

          {/* Reports Card */}
          <Card className="border-2 border-[#0369a1] bg-white p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#e0f2fe]">
              <svg className="h-6 w-6 text-[#0369a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Reports</h3>
            <p className="mt-2 text-slate-600">Generate and view analytics reports</p>
            <Button style={{ backgroundColor: "#0369a1" }} className="mt-4 w-full text-white hover:opacity-90">
              View Reports
            </Button>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function HospitalDashboard() {
  return (
    <ProtectedRoute requiredRole="hospital">
      <HospitalDashboardContent />
    </ProtectedRoute>
  )
}
