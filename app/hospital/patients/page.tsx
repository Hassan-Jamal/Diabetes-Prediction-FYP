"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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

interface Patient {
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
  } | null
  lab_reports_count: number
}

interface Consultant {
  id: string
  name: string
  specialization: string | null
}

function HospitalPatientsContent() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [consultantFilter, setConsultantFilter] = useState<string>("all")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  useEffect(() => {
    fetchPatients()
    fetchConsultants()
  }, [])

  const fetchPatients = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (consultantFilter !== "all") params.append("consultant", consultantFilter)

      const response = await fetch(`/api/hospital/patients?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch patients")
      }

      const data = await response.json()
      setPatients(data.patients || [])
    } catch (error) {
      console.error("Error fetching patients:", error)
      toast.error("Failed to load patients")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchConsultants = async () => {
    try {
      const response = await fetch("/api/hospital/consultants")
      if (response.ok) {
        const data = await response.json()
        setConsultants(data.consultants || [])
      }
    } catch (error) {
      console.error("Error fetching consultants:", error)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPatients()
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchTerm, consultantFilter])

  const handleViewDetails = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsDetailModalOpen(true)
  }

  const handleViewReports = (patientId: string) => {
    router.push(`/hospital/patients/${patientId}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50">
      {/* Header */}
      <header className="border-b border-blue-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Patient Management</h1>
            <p className="text-sm text-slate-600">Manage all patients in your hospital</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push("/hospital/add-patient")}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:opacity-90"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Patient
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
              href="/hospital/appointments"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-blue-50 font-medium transition-all hover:text-blue-600"
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
        <main className="flex-1 mx-auto max-w-7xl px-6 py-8 sm:px-6 lg:px-8">
          {/* Search and Filters */}
          <Card className="border-2 border-blue-200 bg-white p-6 mb-6 shadow-lg">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Search by patient name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <Select value={consultantFilter} onValueChange={setConsultantFilter}>
                <SelectTrigger className="w-full md:w-64 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                  <SelectValue placeholder="Filter by consultant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Consultants</SelectItem>
                  {consultants.map((consultant) => (
                    <SelectItem key={consultant.id} value={consultant.id}>
                      {consultant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Patients Table */}
          <Card className="border-2 border-blue-200 bg-white shadow-lg">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">All Patients ({patients.length})</h2>
              
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-slate-200 rounded animate-pulse" />
                  ))}
                </div>
              ) : patients.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="h-16 w-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-slate-600 mb-2">No patients found</h3>
                  <p className="text-slate-500 mb-4">
                    {searchTerm || consultantFilter !== "all" 
                      ? "Try adjusting your search criteria" 
                      : "Get started by adding your first patient"}
                  </p>
                  {!searchTerm && consultantFilter === "all" && (
                    <Button
                      onClick={() => router.push("/hospital/add-patient")}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:opacity-90"
                    >
                      Add First Patient
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Consultant</TableHead>
                        <TableHead>Lab Reports</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patients.map((patient) => (
                        <TableRow key={patient.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-sm font-bold">
                                {patient.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold">{patient.name}</div>
                                {patient.gender && (
                                  <div className="text-sm text-slate-500 capitalize">{patient.gender}</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{patient.email}</TableCell>
                          <TableCell>
                            {patient.age || (patient.date_of_birth ? getAge(patient.date_of_birth) : "N/A")}
                          </TableCell>
                          <TableCell>
                            {patient.consultants ? (
                              <div>
                                <div className="font-medium">{patient.consultants.name}</div>
                                {patient.consultants.specialization && (
                                  <div className="text-sm text-slate-500">{patient.consultants.specialization}</div>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400">Unassigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                              {patient.lab_reports_count} Reports
                            </span>
                          </TableCell>
                          <TableCell>{formatDate(patient.created_at)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetails(patient)}
                                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                              >
                                View Details
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewReports(patient.id)}
                                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                              >
                                Reports
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </Card>
        </main>
      </div>

      {/* Patient Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedPatient?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="space-y-6">
              {/* Profile Section */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-xl font-bold">
                  {selectedPatient.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedPatient.name}</h3>
                  <p className="text-slate-600">{selectedPatient.email}</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Phone</label>
                  <p className="text-slate-900">{selectedPatient.phone || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Age</label>
                  <p className="text-slate-900">
                    {selectedPatient.age || (selectedPatient.date_of_birth ? getAge(selectedPatient.date_of_birth) : "Not provided")}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Gender</label>
                  <p className="text-slate-900 capitalize">{selectedPatient.gender || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Date of Birth</label>
                  <p className="text-slate-900">
                    {selectedPatient.date_of_birth ? formatDate(selectedPatient.date_of_birth) : "Not provided"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Address</label>
                  <p className="text-slate-900">{selectedPatient.address || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Assigned Consultant</label>
                  <p className="text-slate-900">
                    {selectedPatient.consultants ? (
                      <span>
                        {selectedPatient.consultants.name}
                        {selectedPatient.consultants.specialization && (
                          <span className="text-slate-500"> - {selectedPatient.consultants.specialization}</span>
                        )}
                      </span>
                    ) : (
                      "Unassigned"
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Lab Reports</label>
                  <p className="text-slate-900">{selectedPatient.lab_reports_count} reports available</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Registered</label>
                  <p className="text-slate-900">{formatDate(selectedPatient.created_at)}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailModalOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setIsDetailModalOpen(false)
                if (selectedPatient) {
                  handleViewReports(selectedPatient.id)
                }
              }}
              className="bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:opacity-90"
            >
              View Reports
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function HospitalPatients() {
  return (
    <ProtectedRoute requiredRole="hospital">
      <HospitalPatientsContent />
    </ProtectedRoute>
  )
}
