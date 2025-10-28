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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

interface Appointment {
  id: string
  date: string
  time: string
  status: "scheduled" | "completed" | "cancelled"
  type: "consultation" | "lab_test" | "follow_up"
  notes: string | null
  created_at: string
  updated_at: string
  patients: {
    id: string
    name: string
    email: string
    phone: string | null
  }
  consultants: {
    id: string
    name: string
    specialization: string | null
  } | null
}

function HospitalAppointmentsContent() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  
  // Dialog states
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false)
  const [rescheduleData, setRescheduleData] = useState({ date: "", time: "" })

  useEffect(() => {
    fetchAppointments()
  }, [searchTerm, statusFilter, typeFilter, dateFrom, dateTo])

  const fetchAppointments = async () => {
    try {
      setIsLoading(true)
      const queryParams = new URLSearchParams()
      
      if (searchTerm) {
        queryParams.append("patient", searchTerm)
        queryParams.append("consultant", searchTerm)
      }
      if (statusFilter !== "all") queryParams.append("status", statusFilter)
      if (typeFilter !== "all") queryParams.append("type", typeFilter)
      if (dateFrom) queryParams.append("dateFrom", dateFrom)
      if (dateTo) queryParams.append("dateTo", dateTo)

      const response = await fetch(`/api/hospital/appointments?${queryParams.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch appointments")
      }

      const data = await response.json()
      setAppointments(data.appointments || [])
    } catch (error) {
      console.error("Error fetching appointments:", error)
      toast.error(error instanceof Error ? error.message : "Failed to load appointments")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return

    try {
      console.log("[v0] Cancelling appointment:", selectedAppointment.id)
      
      const response = await fetch(`/api/hospital/appointments/${selectedAppointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      })

      console.log("[v0] Response status:", response.status)
      const errorData = await response.json()
      console.log("[v0] Response data:", errorData)

      if (!response.ok) {
        throw new Error(errorData.error || "Failed to cancel appointment")
      }

      toast.success("Appointment cancelled successfully!")
      setIsCancelDialogOpen(false)
      setSelectedAppointment(null)
      fetchAppointments()
    } catch (error) {
      console.error("Error cancelling appointment:", error)
      toast.error(error instanceof Error ? error.message : "Failed to cancel appointment")
    }
  }

  const handleRescheduleAppointment = async () => {
    if (!selectedAppointment || !rescheduleData.date || !rescheduleData.time) return

    try {
      console.log("[v0] Rescheduling appointment:", selectedAppointment.id)
      console.log("[v0] Reschedule data:", rescheduleData)
      
      const response = await fetch(`/api/hospital/appointments/${selectedAppointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: rescheduleData.date,
          time: rescheduleData.time,
        }),
      })

      console.log("[v0] Response status:", response.status)
      const errorData = await response.json()
      console.log("[v0] Response data:", errorData)

      if (!response.ok) {
        throw new Error(errorData.error || "Failed to reschedule appointment")
      }

      toast.success("Appointment rescheduled successfully!")
      setIsRescheduleDialogOpen(false)
      setSelectedAppointment(null)
      setRescheduleData({ date: "", time: "" })
      fetchAppointments()
    } catch (error) {
      console.error("Error rescheduling appointment:", error)
      toast.error(error instanceof Error ? error.message : "Failed to reschedule appointment")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
            Scheduled
          </span>
        )
      case "completed":
        return (
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
            Completed
          </span>
        )
      case "cancelled":
        return (
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700">
            Cancelled
          </span>
        )
      default:
        return <span className="px-3 py-1 rounded-full text-sm text-slate-600">{status}</span>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "consultation":
        return (
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-700">
            Consultation
          </span>
        )
      case "lab_test":
        return (
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-700">
            Lab Test
          </span>
        )
      case "follow_up":
        return (
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-cyan-100 text-cyan-700">
            Follow-up
          </span>
        )
      default:
        return <span className="px-3 py-1 rounded-full text-sm text-slate-600">{type}</span>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    // Assuming time is stored as "HH:MM" format
    const [hours, minutes] = timeString.split(":")
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50">
      {/* Header */}
      <header className="border-b border-blue-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Appointment Management</h1>
            <p className="text-sm text-slate-600">Manage all appointments for your hospital</p>
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
        <main className="flex-1 mx-auto max-w-7xl px-6 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Appointments</h2>
              <p className="text-slate-600">View and manage all scheduled appointments</p>
            </div>
            <Button onClick={() => router.push("/hospital/add-appointment")} className="bg-gradient-to-r from-[#0369a1] to-cyan-600 text-white">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Schedule Appointment
            </Button>
          </div>

          {/* Search and Filters */}
          <Card className="border-2 border-blue-200 bg-white p-6 mb-6 shadow-lg">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Input
                placeholder="Search by patient or consultant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-slate-300"
              />
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-slate-300">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="border-slate-300">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="lab_test">Lab Test</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                placeholder="From Date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border-slate-300"
              />

              <Input
                type="date"
                placeholder="To Date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border-slate-300"
              />
            </div>
          </Card>

          {/* Appointments Table */}
          <Card className="border-2 border-blue-200 bg-white shadow-lg">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="h-8 w-8 bg-slate-200 rounded mx-auto animate-pulse mb-4" />
                <p className="text-slate-600">Loading appointments...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="h-16 w-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No appointments found</h3>
                <p className="text-slate-600 mb-4">Get started by scheduling your first appointment</p>
                <Button onClick={() => router.push("/hospital/add-appointment")} className="bg-gradient-to-r from-[#0369a1] to-cyan-600 text-white">
                  Schedule Appointment
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Consultant</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div>
                          <div className="font-semibold">{appointment.patients.name}</div>
                          <div className="text-sm text-slate-500">{appointment.patients.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {appointment.consultants ? (
                          <div>
                            <div className="font-semibold">{appointment.consultants.name}</div>
                            <div className="text-sm text-slate-500">{appointment.consultants.specialization}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400">No consultant</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(appointment.date)}</TableCell>
                      <TableCell>{formatTime(appointment.time)}</TableCell>
                      <TableCell>{getTypeBadge(appointment.type)}</TableCell>
                      <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedAppointment(appointment)
                                setIsViewDialogOpen(true)
                              }}
                            >
                              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View Details
                            </DropdownMenuItem>
                            {appointment.status === "scheduled" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedAppointment(appointment)
                                    setRescheduleData({ date: appointment.date, time: appointment.time })
                                    setIsRescheduleDialogOpen(true)
                                  }}
                                >
                                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  Reschedule
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedAppointment(appointment)
                                    setIsCancelDialogOpen(true)
                                  }}
                                  className="text-red-600"
                                >
                                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Cancel
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </main>
      </div>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              View detailed information about this appointment
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Patient</label>
                  <p className="text-slate-900">{selectedAppointment.patients.name}</p>
                  <p className="text-sm text-slate-600">{selectedAppointment.patients.email}</p>
                  {selectedAppointment.patients.phone && (
                    <p className="text-sm text-slate-600">{selectedAppointment.patients.phone}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Consultant</label>
                  {selectedAppointment.consultants ? (
                    <>
                      <p className="text-slate-900">{selectedAppointment.consultants.name}</p>
                      <p className="text-sm text-slate-600">{selectedAppointment.consultants.specialization}</p>
                    </>
                  ) : (
                    <p className="text-slate-400">No consultant assigned</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Date & Time</label>
                  <p className="text-slate-900">{formatDate(selectedAppointment.date)}</p>
                  <p className="text-slate-900">{formatTime(selectedAppointment.time)}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Type & Status</label>
                  <div className="flex gap-2">
                    {getTypeBadge(selectedAppointment.type)}
                    {getStatusBadge(selectedAppointment.status)}
                  </div>
                </div>
              </div>
              {selectedAppointment.notes && (
                <div>
                  <label className="text-sm font-semibold text-slate-700">Notes</label>
                  <p className="text-slate-900 bg-slate-50 p-3 rounded-lg">{selectedAppointment.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="py-4">
              <p className="text-slate-900">
                <strong>{selectedAppointment.patients.name}</strong> - {formatDate(selectedAppointment.date)} at {formatTime(selectedAppointment.time)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Keep Appointment
            </Button>
            <Button variant="destructive" onClick={handleCancelAppointment}>
              Cancel Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Select a new date and time for this appointment
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Patient</label>
                <p className="text-slate-900">{selectedAppointment.patients.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">New Date</label>
                  <Input
                    type="date"
                    value={rescheduleData.date}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">New Time</label>
                  <Input
                    type="time"
                    value={rescheduleData.time}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRescheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRescheduleAppointment}
              disabled={!rescheduleData.date || !rescheduleData.time}
              className="bg-gradient-to-r from-[#0369a1] to-cyan-600 text-white"
            >
              Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function HospitalAppointments() {
  return (
    <ProtectedRoute requiredRole="hospital">
      <HospitalAppointmentsContent />
    </ProtectedRoute>
  )
}
