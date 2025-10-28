"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { toast } from "sonner"

interface ConsultantDetail {
  id: string
  name: string
  email: string
  specialization: string | null
  status: string
  workload: number
  patients: Array<{
    id: string
    name: string
    age: number | null
    gender: string | null
  }>
  created_at: string
}

function ConsultantDetailContent() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const params = useParams()
  const consultantId = params?.id as string

  const [consultant, setConsultant] = useState<ConsultantDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (consultantId) {
      fetchConsultantDetails()
    }
  }, [consultantId])

  const fetchConsultantDetails = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/hospital/consultants/${consultantId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch consultant details")
      }

      const data = await response.json()
      setConsultant(data)
    } catch (error) {
      console.error("Error fetching consultant details:", error)
      toast.error("Failed to load consultant details")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
            Approved
          </span>
        )
      case "rejected":
        return (
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700">
            Rejected
          </span>
        )
      case "pending":
        return (
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-700">
            Pending
          </span>
        )
      default:
        return <span className="px-3 py-1 rounded-full text-sm text-slate-600">{status}</span>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50 flex items-center justify-center">
        <Card className="p-8">
          <div className="space-y-3">
            <div className="h-32 w-32 bg-slate-200 rounded-full mx-auto animate-pulse" />
            <div className="h-8 w-48 bg-slate-200 rounded mx-auto animate-pulse" />
            <div className="h-4 w-64 bg-slate-200 rounded mx-auto animate-pulse" />
          </div>
        </Card>
      </div>
    )
  }

  if (!consultant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-slate-600 mb-4">Consultant not found</p>
          <Button onClick={() => router.push("/hospital/consultants")}>Back to List</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50">
      {/* Header */}
      <header className="border-b border-blue-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => router.push("/hospital/consultants")} className="border-blue-600 text-blue-600">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Consultants
            </Button>
            <Button onClick={logout} variant="outline" style={{ borderColor: "#0369a1", color: "#0369a1" }} className="bg-transparent">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside className="w-64 bg-white/90 backdrop-blur-sm border-r border-blue-200/50 p-6 sticky top-[80px] h-[calc(100vh-80px)] overflow-y-auto">
          <nav className="space-y-2">
            <Link
              href="/hospital/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-blue-50 font-medium transition-all hover:text-blue-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>

            <Link
              href="/hospital/consultants"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold transition-all hover:shadow-lg"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Consultants
            </Link>

            <Link
              href="/hospital/patients"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-blue-50 font-medium transition-all hover:text-blue-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Patients
            </Link>

            <Link
              href="/hospital/consultation-requests"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-blue-50 font-medium transition-all hover:text-blue-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Requests
            </Link>

            <Link
              href="/hospital/account"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-blue-50 font-medium transition-all hover:text-blue-600"
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
        <Card className="border-2 border-blue-200 bg-white p-8 shadow-lg">
          {/* Profile Header */}
          <div className="flex items-start gap-6 pb-8 border-b border-slate-200">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-3xl font-bold">
              {consultant.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">{consultant.name}</h2>
              <p className="text-lg text-slate-600 mb-4">{consultant.email}</p>
              <div className="flex items-center gap-4">
                {getStatusBadge(consultant.status)}
                <div className="flex items-center gap-2 text-slate-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-semibold">{consultant.workload} patients</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid gap-8 md:grid-cols-2 mt-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Profile Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600">Specialization</p>
                  <p className="text-slate-900">{consultant.specialization || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600">Status</p>
                  <div className="mt-1">{getStatusBadge(consultant.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600">Member Since</p>
                  <p className="text-slate-900">{new Date(consultant.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Workload Summary */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Workload Summary</h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold text-blue-700 mb-1">Total Patients</p>
                  <p className="text-3xl font-bold text-blue-900">{consultant.workload}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Patients */}
          {consultant.patients && consultant.patients.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Assigned Patients</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Age</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Gender</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {consultant.patients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-900">{patient.name}</td>
                        <td className="px-4 py-3 text-slate-600">{patient.age || "N/A"}</td>
                        <td className="px-4 py-3 text-slate-600">{patient.gender || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
      </main>
      </div>
    </div>
  )
}

export default function ConsultantDetail() {
  return (
    <ProtectedRoute requiredRole="hospital">
      <ConsultantDetailContent />
    </ProtectedRoute>
  )
}

