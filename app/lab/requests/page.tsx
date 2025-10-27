"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"

interface Request {
  id: string
  patientName: string
  date: string
  time: string
  type: string
  status: "pending" | "accepted" | "rejected"
  patientId: string
  labId: string
}

interface SummaryData {
  total: number
  accepted: number
  pending: number
  rejected: number
}

function LabRequestsContent() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [requests, setRequests] = useState<Request[]>([])
  const [summary, setSummary] = useState<SummaryData>({
    total: 0,
    accepted: 0,
    pending: 0,
    rejected: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/lab/requests")
      const data = await response.json()
      setRequests(data.requests || [])

      // Calculate summary
      const accepted = data.requests?.filter((r: Request) => r.status === "accepted").length || 0
      const pending = data.requests?.filter((r: Request) => r.status === "pending").length || 0
      const rejected = data.requests?.filter((r: Request) => r.status === "rejected").length || 0

      setSummary({
        total: data.requests?.length || 0,
        accepted,
        pending,
        rejected,
      })
    } catch (error) {
      console.error("Error fetching requests:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (requestId: string, newStatus: "accepted" | "rejected") => {
    try {
      const response = await fetch(`/api/lab/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Optimistic UI update
        setRequests((prev) =>
          prev.map((req) => (req.id === requestId ? { ...req, status: newStatus } : req)),
        )
        // Refetch to get updated summary
        fetchRequests()
      }
    } catch (error) {
      console.error("Error updating request:", error)
    }
  }

  const filteredRequests = requests.filter((request) => {
    const matchesFilter = filter === "all" || request.status === filter
    const matchesSearch =
      request.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.type.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-amber-100 text-amber-800 border-amber-200",
      accepted: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    }
    return styles[status as keyof typeof styles] || "bg-slate-100 text-slate-800 border-slate-200"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-green-100">
      {/* Header */}
      <header className="border-b border-emerald-200/50 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Lab Requests
            </h1>
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
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-emerald-50 font-medium transition-all hover:text-emerald-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home (Dashboard)
            </Link>

            <Link
              href="/lab/requests"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold transition-all hover:shadow-lg"
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
          {/* Summary Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-2 border-slate-200 bg-white p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Requests</p>
                  <p className="text-3xl font-bold text-slate-900">{summary.total}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </Card>

            <Card className="border-2 border-green-200 bg-white p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Accepted</p>
                  <p className="text-3xl font-bold text-green-600">{summary.accepted}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </Card>

            <Card className="border-2 border-amber-200 bg-white p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-amber-600">{summary.pending}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </Card>

            <Card className="border-2 border-red-200 bg-white p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Rejected</p>
                  <p className="text-3xl font-bold text-red-600">{summary.rejected}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="border-2 border-emerald-200/50 bg-white/90 backdrop-blur-sm p-6 mb-6 shadow-xl">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Search by patient name or test type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 py-6"
              />
              <div className="flex gap-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  onClick={() => setFilter("all")}
                  className={filter === "all" ? "bg-emerald-600 text-white" : ""}
                >
                  All
                </Button>
                <Button
                  variant={filter === "pending" ? "default" : "outline"}
                  onClick={() => setFilter("pending")}
                  className={filter === "pending" ? "bg-amber-600 text-white" : ""}
                >
                  Pending
                </Button>
                <Button
                  variant={filter === "accepted" ? "default" : "outline"}
                  onClick={() => setFilter("accepted")}
                  className={filter === "accepted" ? "bg-green-600 text-white" : ""}
                >
                  Accepted
                </Button>
                <Button
                  variant={filter === "rejected" ? "default" : "outline"}
                  onClick={() => setFilter("rejected")}
                  className={filter === "rejected" ? "bg-red-600 text-white" : ""}
                >
                  Rejected
                </Button>
              </div>
            </div>
          </Card>

          {/* Requests Table */}
          {isLoading ? (
            <Card className="border-2 border-emerald-200/50 bg-white/90 backdrop-blur-sm p-8 shadow-xl">
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </Card>
          ) : filteredRequests.length === 0 ? (
            <Card className="border-2 border-emerald-200/50 bg-white/90 backdrop-blur-sm p-12 shadow-xl text-center">
              <div className="mb-6 flex justify-center">
                <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center">
                  <svg className="h-10 w-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No requests found</h3>
              <p className="text-slate-600">
                {searchTerm || filter !== "all"
                  ? "Try adjusting your filters or search terms"
                  : "No new requests at the moment"}
              </p>
            </Card>
          ) : (
            <Card className="border-2 border-emerald-200/50 bg-white/90 backdrop-blur-sm shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-emerald-50 border-b border-emerald-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Patient Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Time</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-100">
                    {filteredRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-emerald-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-900 font-medium">{request.patientName}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{formatDate(request.date)}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{request.time}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{request.type}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                              request.status,
                            )}`}
                          >
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {request.status === "pending" ? (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleStatusUpdate(request.id, "accepted")}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                Accept
                              </Button>
                              <Button
                                onClick={() => handleStatusUpdate(request.id, "rejected")}
                                size="sm"
                                variant="destructive"
                              >
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">No actions available</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}

export default function LabRequests() {
  return (
    <ProtectedRoute requiredRole="lab">
      <LabRequestsContent />
    </ProtectedRoute>
  )
}

