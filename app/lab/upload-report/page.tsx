"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface Report {
  id: string
  patientId: string
  patientName: string
  reportType: string
  fileUrl: string
  uploadedAt: string
}

const mockPatients = [
  { id: "patient1", name: "Ali Ahmed" },
  { id: "patient2", name: "Fatima Khan" },
  { id: "patient3", name: "Usman Tariq" },
  { id: "patient4", name: "Ahmed Hassan" },
  { id: "patient5", name: "Sara Malik" },
]

function LabUploadReportContent() {
  const { user, logout } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    reportType: "",
    file: null as File | null,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/lab/reports")
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports || [])
      } else {
        toast.error("Failed to load reports")
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
      toast.error("Failed to load reports")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPatient = mockPatients.find((p) => p.id === e.target.value)
    setFormData({
      ...formData,
      patientId: e.target.value,
      patientName: selectedPatient?.name || "",
    })
    if (errors.patientId) setErrors({ ...errors, patientId: "" })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      // Validate file type
      const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
      if (!validTypes.includes(file.type)) {
        setErrors({ ...errors, file: "Please upload a PDF or image file (JPEG, PNG)" })
        return
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ ...errors, file: "File size must be less than 10MB" })
        return
      }
      setFormData({ ...formData, file: file })
      if (errors.file) setErrors({ ...errors, file: "" })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.patientId) newErrors.patientId = "Please select a patient"
    if (!formData.reportType.trim()) newErrors.reportType = "Report type is required"
    if (!formData.file) newErrors.file = "Please select a file to upload"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsUploading(true)
    try {
      const supabase = createClient()

      // Step 1: Upload file to Supabase Storage
      const fileName = `${Date.now()}_${formData.file!.name}`
      console.log("[v0] Uploading file:", fileName)
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("lab-reports")
        .upload(fileName, formData.file!)

      if (uploadError) {
        console.error("[v0] Upload error:", uploadError)
        console.error("[v0] Error code:", uploadError.error)
        console.error("[v0] Error message:", uploadError.message)
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      console.log("[v0] File uploaded successfully:", uploadData)

      // Step 2: Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("lab-reports").getPublicUrl(fileName)
      
      console.log("[v0] Public URL:", publicUrl)

      // Step 3: Save metadata to database
      const response = await fetch("/api/lab/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: formData.patientId,
          patientName: formData.patientName,
          reportType: formData.reportType,
          fileUrl: publicUrl,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save report metadata")
      }

      toast.success("Report uploaded successfully!")
      
      // Reset form
      setFormData({
        patientId: "",
        patientName: "",
        reportType: "",
        file: null,
      })
      
      // Clear file input
      const fileInput = document.getElementById("file-upload") as HTMLInputElement
      if (fileInput) fileInput.value = ""

      // Refetch reports
      await fetchReports()
    } catch (error) {
      console.error("Error uploading report:", error)
      toast.error(error instanceof Error ? error.message : "Failed to upload report")
    } finally {
      setIsUploading(false)
    }
  }

  const handleViewReport = (url: string) => {
    window.open(url, "_blank")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-green-100">
      {/* Header */}
      <header className="border-b border-emerald-200/50 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Upload Lab Report
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={logout} variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
              Logout
            </Button>
          </div>
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
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold transition-all hover:shadow-lg"
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
          <div className="space-y-6">
            {/* Upload Form Card */}
            <Card className="border-2 border-emerald-200/50 bg-white/90 backdrop-blur-sm p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Upload New Report</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="patient" className="block text-sm font-semibold text-slate-700 mb-2">
                    Patient *
                  </label>
                  <select
                    id="patient"
                    value={formData.patientId}
                    onChange={handlePatientChange}
                    className={`w-full rounded-xl border-2 transition-all py-3 px-4 ${
                      errors.patientId
                        ? "border-red-500 focus:border-red-600"
                        : "border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    }`}
                  >
                    <option value="">Select a patient</option>
                    {mockPatients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name}
                      </option>
                    ))}
                  </select>
                  {errors.patientId && <p className="mt-2 text-sm text-red-500">{errors.patientId}</p>}
                </div>

                <div>
                  <label htmlFor="reportType" className="block text-sm font-semibold text-slate-700 mb-2">
                    Report Type *
                  </label>
                  <Input
                    id="reportType"
                    value={formData.reportType}
                    onChange={(e) => {
                      setFormData({ ...formData, reportType: e.target.value })
                      if (errors.reportType) setErrors({ ...errors, reportType: "" })
                    }}
                    placeholder="e.g., Blood Glucose Test"
                    className={`rounded-xl border-2 transition-all py-3 ${
                      errors.reportType
                        ? "border-red-500 focus:border-red-600"
                        : "border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    }`}
                  />
                  {errors.reportType && <p className="mt-2 text-sm text-red-500">{errors.reportType}</p>}
                </div>

                <div>
                  <label htmlFor="file-upload" className="block text-sm font-semibold text-slate-700 mb-2">
                    Report File (PDF or Image) *
                  </label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.jpeg,.jpg,.png"
                    onChange={handleFileChange}
                    className={`rounded-xl border-2 transition-all py-3 ${
                      errors.file
                        ? "border-red-500 focus:border-red-600"
                        : "border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    }`}
                  />
                  {errors.file && <p className="mt-2 text-sm text-red-500">{errors.file}</p>}
                  <p className="mt-2 text-sm text-slate-500">Accepted formats: PDF, JPEG, PNG (max 10MB)</p>
                </div>

                <Button
                  type="submit"
                  disabled={isUploading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white py-6 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Uploading...
                    </span>
                  ) : (
                    "Upload Report"
                  )}
                </Button>
              </form>
            </Card>

            {/* Uploaded Reports Table */}
            <Card className="border-2 border-emerald-200/50 bg-white/90 backdrop-blur-sm p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Uploaded Reports</h2>

              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-slate-200 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mb-4 flex justify-center">
                    <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center">
                      <svg className="h-10 w-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No reports uploaded yet</h3>
                  <p className="text-slate-600">Upload your first report using the form above</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-emerald-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Patient Name</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Report Type</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Uploaded Date</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((report) => (
                        <tr key={report.id} className="border-b border-emerald-100 hover:bg-emerald-50/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-900">{report.patientName}</div>
                            <div className="text-sm text-slate-500">{report.patientId}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-700">{report.reportType}</td>
                          <td className="py-3 px-4 text-slate-600">
                            {new Date(report.uploadedAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewReport(report.fileUrl)}
                              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                            >
                              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function LabUploadReport() {
  return (
    <ProtectedRoute requiredRole="lab">
      <LabUploadReportContent />
    </ProtectedRoute>
  )
}

