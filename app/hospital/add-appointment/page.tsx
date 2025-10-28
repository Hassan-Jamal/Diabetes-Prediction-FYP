"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { toast } from "sonner"

interface Consultant {
  id: string
  name: string
  specialization: string | null
}

interface Patient {
  id: string
  name: string
  email: string
}

function AddAppointmentContent() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    consultant_id: "",
    patient_id: "",
    date: "",
    time: "",
    type: "",
    notes: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoadingConsultants, setIsLoadingConsultants] = useState(true)
  const [isLoadingPatients, setIsLoadingPatients] = useState(true)

  useEffect(() => {
    fetchConsultants()
    fetchPatients()
  }, [])

  const fetchConsultants = async () => {
    try {
      setIsLoadingConsultants(true)
      const response = await fetch("/api/hospital/consultants")
      if (!response.ok) {
        throw new Error("Failed to fetch consultants")
      }
      const data = await response.json()
      setConsultants(data.consultants || [])
    } catch (error) {
      console.error("Error fetching consultants:", error)
      toast.error("Failed to load consultants")
    } finally {
      setIsLoadingConsultants(false)
    }
  }

  const fetchPatients = async () => {
    try {
      setIsLoadingPatients(true)
      const response = await fetch("/api/hospital/patients")
      if (!response.ok) {
        throw new Error("Failed to fetch patients")
      }
      const data = await response.json()
      setPatients(data.patients || [])
    } catch (error) {
      console.error("Error fetching patients:", error)
      toast.error("Failed to load patients")
    } finally {
      setIsLoadingPatients(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    const newErrors: Record<string, string> = {}
    if (!formData.consultant_id) newErrors.consultant_id = "Consultant is required"
    if (!formData.patient_id) newErrors.patient_id = "Patient is required"
    if (!formData.date) newErrors.date = "Date is required"
    if (!formData.time) newErrors.time = "Time is required"
    if (!formData.type) newErrors.type = "Appointment type is required"

    // Validate date is not in the past
    const selectedDate = new Date(formData.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (selectedDate < today) {
      newErrors.date = "Date cannot be in the past"
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    setIsSubmitting(true)
    try {
      console.log("[v0] Submitting appointment data:", formData)
      
      const response = await fetch("/api/hospital/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultant_id: formData.consultant_id,
          patient_id: formData.patient_id,
          date: formData.date,
          time: formData.time,
          type: formData.type,
          notes: formData.notes || null,
        }),
      })

      console.log("[v0] Response status:", response.status)
      const responseData = await response.json()
      console.log("[v0] Response data:", responseData)

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to schedule appointment")
      }

      toast.success("Appointment scheduled successfully!")
      router.push("/hospital/appointments")
    } catch (error) {
      console.error("Error scheduling appointment:", error)
      toast.error(error instanceof Error ? error.message : "Failed to schedule appointment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  const appointmentTypes = [
    { value: "consultation", label: "Consultation" },
    { value: "lab_test", label: "Lab Test" },
    { value: "follow_up", label: "Follow-up" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50">
      {/* Header */}
      <header className="border-b border-blue-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Schedule Appointment</h1>
            <p className="text-sm text-slate-600">Create a new appointment for a patient</p>
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
              href="/hospital/appointments"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold transition-all hover:shadow-lg"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Appointments
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
        <main className="flex-1 mx-auto max-w-4xl px-6 py-8 sm:px-6 lg:px-8">
          <Card className="border-2 border-blue-200 bg-white p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Consultant Selection */}
                <div>
                  <label htmlFor="consultant_id" className="block text-sm font-semibold text-slate-700 mb-2">
                    Consultant *
                  </label>
                  <Select
                    value={formData.consultant_id}
                    onValueChange={(value) => handleInputChange("consultant_id", value)}
                  >
                    <SelectTrigger className={`rounded-xl border-2 transition-all py-3 ${
                      errors.consultant_id
                        ? "border-red-500 focus:border-red-600"
                        : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    }`}>
                      <SelectValue placeholder="Select consultant" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingConsultants ? (
                        <SelectItem value="loading" disabled>Loading consultants...</SelectItem>
                      ) : consultants.length === 0 ? (
                        <SelectItem value="no-consultants" disabled>No consultants available</SelectItem>
                      ) : (
                        consultants.map((consultant) => (
                          <SelectItem key={consultant.id} value={consultant.id}>
                            {consultant.name} - {consultant.specialization || "General"}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.consultant_id && <p className="mt-2 text-sm text-red-500">{errors.consultant_id}</p>}
                </div>

                {/* Patient Selection */}
                <div>
                  <label htmlFor="patient_id" className="block text-sm font-semibold text-slate-700 mb-2">
                    Patient *
                  </label>
                  <Select
                    value={formData.patient_id}
                    onValueChange={(value) => handleInputChange("patient_id", value)}
                  >
                    <SelectTrigger className={`rounded-xl border-2 transition-all py-3 ${
                      errors.patient_id
                        ? "border-red-500 focus:border-red-600"
                        : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    }`}>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingPatients ? (
                        <SelectItem value="loading" disabled>Loading patients...</SelectItem>
                      ) : patients.length === 0 ? (
                        <SelectItem value="no-patients" disabled>No patients available</SelectItem>
                      ) : (
                        patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name} - {patient.email}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.patient_id && <p className="mt-2 text-sm text-red-500">{errors.patient_id}</p>}
                </div>

                {/* Date */}
                <div>
                  <label htmlFor="date" className="block text-sm font-semibold text-slate-700 mb-2">
                    Date *
                  </label>
                  <Input
                    id="date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={`rounded-xl border-2 transition-all py-3 ${
                      errors.date
                        ? "border-red-500 focus:border-red-600"
                        : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    }`}
                  />
                  {errors.date && <p className="mt-2 text-sm text-red-500">{errors.date}</p>}
                </div>

                {/* Time */}
                <div>
                  <label htmlFor="time" className="block text-sm font-semibold text-slate-700 mb-2">
                    Time *
                  </label>
                  <Input
                    id="time"
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => handleInputChange("time", e.target.value)}
                    className={`rounded-xl border-2 transition-all py-3 ${
                      errors.time
                        ? "border-red-500 focus:border-red-600"
                        : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    }`}
                  />
                  {errors.time && <p className="mt-2 text-sm text-red-500">{errors.time}</p>}
                </div>

                {/* Appointment Type */}
                <div>
                  <label htmlFor="type" className="block text-sm font-semibold text-slate-700 mb-2">
                    Appointment Type *
                  </label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange("type", value)}
                  >
                    <SelectTrigger className={`rounded-xl border-2 transition-all py-3 ${
                      errors.type
                        ? "border-red-500 focus:border-red-600"
                        : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    }`}>
                      <SelectValue placeholder="Select appointment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {appointmentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="mt-2 text-sm text-red-500">{errors.type}</p>}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-semibold text-slate-700 mb-2">
                  Notes (Optional)
                </label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Additional notes about the appointment..."
                  rows={4}
                  className="rounded-xl border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all py-3"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1 border-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || isLoadingConsultants || isLoadingPatients}
                  className="flex-1 bg-gradient-to-r from-[#0369a1] to-cyan-600 text-white hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? "Scheduling..." : "Schedule Appointment"}
                </Button>
              </div>
            </form>
          </Card>
        </main>
      </div>
    </div>
  )
}

export default function AddAppointment() {
  return (
    <ProtectedRoute requiredRole="hospital">
      <AddAppointmentContent />
    </ProtectedRoute>
  )
}
