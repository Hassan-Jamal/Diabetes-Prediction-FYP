"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"

interface DashboardData {
  bookings: {
    pending: number
    accepted: number
    total: number
  }
  reports: {
    total: number
  }
}

function LabDashboardContent() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<DashboardData>({
    bookings: { pending: 0, accepted: 0, total: 0 },
    reports: { total: 0 },
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        // Fetch dashboard summary
        const response = await fetch("/api/lab/dashboard-summary")

        if (response.ok) {
          const summaryData = await response.json()
          setData(summaryData)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-green-100">
      {/* Header */}
      <header className="border-b border-emerald-200/50 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Laboratory Dashboard
            </h1>
            <p className="text-slate-600 hidden sm:block">Welcome, {user?.organizationName || user?.email}</p>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
          >
            Logout
          </Button>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside className="w-64 bg-white/90 backdrop-blur-sm border-r border-emerald-200/50 p-6 sticky top-[80px] h-[calc(100vh-80px)] overflow-y-auto">
          <nav className="space-y-2">
            <Link
              href="/lab/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold transition-all hover:shadow-lg"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home (Dashboard)
            </Link>

            <Link
              href="/lab/requests"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-emerald-50 font-medium transition-all hover:text-emerald-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Requests
            </Link>

            <Link
              href="/lab/tests"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-emerald-50 font-medium transition-all hover:text-emerald-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tests
            </Link>

            <Link
              href="/lab/upload-report"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-emerald-50 font-medium transition-all hover:text-emerald-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Report
            </Link>

            <Link
              href="/lab/account"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-emerald-50 font-medium transition-all hover:text-emerald-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Account
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 mx-auto max-w-7xl px-6 py-8 sm:px-6 lg:px-8">
          {/* Lab Name */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">{user?.organizationName || "Laboratory"}</h2>
            <p className="text-slate-600">Dashboard Overview</p>
          </div>

          {/* Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Bookings Card */}
            <Card className="border-2 border-emerald-200/50 bg-white/90 backdrop-blur-sm p-8 shadow-xl hover:shadow-2xl transition-all">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-green-600 mb-4 shadow-lg">
                    <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Bookings</h3>
                  <p className="text-slate-600">Manage test requests</p>
                </div>
              </div>
              {isLoading ? (
                <div className="space-y-3">
                  <div className="h-12 bg-slate-200 rounded-lg animate-pulse"></div>
                  <div className="h-12 bg-slate-200 rounded-lg animate-pulse"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                        <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Pending Requests</p>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-amber-600">{data.bookings.pending}</p>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-green-50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Accepted Requests</p>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-green-600">{data.bookings.accepted}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-emerald-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Total Requests</span>
                      <span className="text-2xl font-bold text-slate-900">{data.bookings.total}</span>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Reports Card */}
            <Card className="border-2 border-emerald-200/50 bg-white/90 backdrop-blur-sm p-8 shadow-xl hover:shadow-2xl transition-all">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 mb-4 shadow-lg">
                    <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Reports</h3>
                  <p className="text-slate-600">Lab reports uploaded</p>
                </div>
              </div>
              {isLoading ? (
                <div className="space-y-3">
                  <div className="h-32 bg-slate-200 rounded-lg animate-pulse"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center p-12 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50">
                    <div className="text-center">
                      <p className="text-6xl font-bold text-blue-600 mb-2">{data.reports.total}</p>
                      <p className="text-slate-600 font-medium">Uploaded Reports</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-blue-100">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg">
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload New Report
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>
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
