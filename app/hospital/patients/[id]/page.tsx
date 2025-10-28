"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { toast } from "sonner"

interface PatientDetail {
  id: string
  name: string
  email: string
  phone: string | null
  age: number | null
  gender: string | null
  date_of_birth: string | null
  address: string | null
  created_at: string
  consultants: {
    id: string
    name: string
    specialization: string | null
    email: string
  } | null
}

interface LabReport {
  id: string
  patient_id: string
  patient_name: string
  report_type: string
  file_url: string
  uploaded_at: string
  labs: {
    id: string
    organization_name: string
  } | null
}

function PatientDetailContent() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const params = useParams()
  const patientId = params.id as string
  
  const [patient, setPatient] = useState<PatientDetail | null>(null)
  const [labReports, setLabReports] = useState<LabReport[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (patientId) {
      fetchPatientDetails()
    }
  }, [patientId])

  const fetchPatientDetails = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/hospital/patients/${patientId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Patient not found")
          router.push("/hospital/patients")
          return
        }
        throw new Error("Failed to fetch patient details")
      }

      const data = await response.json()
      setPatient(data.patient)
      setLabReports(data.lab_reports || [])
    } catch (error) {
      console.error("Error fetching patient details:", error)
      toast.error("Failed to load patient details")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return null
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const handleViewReport = (url: string) => {
    window.open(url, "_blank")
  }

  const handleDownloadReport = (url: string, reportType: string, uploadedAt: string) => {
    const link = document.createElement("a")
    link.href = url
    link.download = `${reportType}_${formatDate(uploadedAt)}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50 flex items-center justify-center">
        <Card className="p-8">
          <div className="space-y-3">
            <div className="h-32 w-32 bg-slate-200 rounded-full mx-auto animate-pulse" />
            <div className="h-8 w-48 bg-slate-200 rounded mx-auto animate-pulse" />
          </div>
        </Card>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-slate-600 mb-4">Patient not found</p>
          <Button onClick={() => router.push("/hospital/patients")}>
            Back to Patients
          </Button>
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
            <Button variant="outline" onClick={() => router.push("/hospital/patients")} className="border-blue-600 text-blue-600">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Patients
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
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-blue-50 font-medium transition-all hover:text-blue-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Consultants
            </Link>

            <Link
              href="/hospital/patients"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold transition-all hover:shadow-lg"
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
            {/* Patient Profile Header */}
            <div className="flex items-start gap-6 pb-8 border-b border-blue-200">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-3xl font-bold">
                {patient.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{patient.name}</h1>
                <p className="text-slate-600 text-lg">{patient.email}</p>
                {patient.phone && (
                  <p className="text-slate-500">{patient.phone}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-500">Patient ID</div>
                <div className="font-mono text-slate-700">{patient.id.slice(0, 8)}...</div>
              </div>
            </div>

            {/* Patient Information */}
            <div className="grid gap-8 md:grid-cols-2 mt-8">
              {/* Basic Information */}
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Basic Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Age</label>
                    <p className="text-slate-900">
                      {patient.age || (patient.date_of_birth ? getAge(patient.date_of_birth) : "Not provided")}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Gender</label>
                    <p className="text-slate-900 capitalize">{patient.gender || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Date of Birth</label>
                    <p className="text-slate-900">
                      {patient.date_of_birth ? formatDate(patient.date_of_birth) : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Address</label>
                    <p className="text-slate-900">{patient.address || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Registered</label>
                    <p className="text-slate-900">{formatDate(patient.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Medical Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Assigned Consultant</label>
                    {patient.consultants ? (
                      <div className="mt-1">
                        <p className="text-slate-900 font-medium">{patient.consultants.name}</p>
                        {patient.consultants.specialization && (
                          <p className="text-slate-600">{patient.consultants.specialization}</p>
                        )}
                        <p className="text-slate-500 text-sm">{patient.consultants.email}</p>
                      </div>
                    ) : (
                      <p className="text-slate-400">No consultant assigned</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Lab Reports</label>
                    <p className="text-slate-900">{labReports.length} reports available</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lab Reports Section */}
            <div className="mt-12">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Lab Reports</h2>
              
              {labReports.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-lg">
                  <svg className="h-16 w-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-slate-600 mb-2">No lab reports available</h3>
                  <p className="text-slate-500">This patient doesn't have any uploaded lab reports yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {labReports.map((report) => (
                    <Card key={report.id} className="border border-slate-200 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{report.report_type}</h3>
                            <p className="text-sm text-slate-600">
                              Uploaded by {report.labs?.organization_name || "Unknown Lab"}
                            </p>
                            <p className="text-sm text-slate-500">
                              {formatDateTime(report.uploaded_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewReport(report.file_url)}
                            className="border-blue-600 text-blue-600 hover:bg-blue-50"
                          >
                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadReport(report.file_url, report.report_type, report.uploaded_at)}
                            className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                          >
                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}

export default function PatientDetail() {
  return (
    <ProtectedRoute requiredRole="hospital">
      <PatientDetailContent />
    </ProtectedRoute>
  )
}
