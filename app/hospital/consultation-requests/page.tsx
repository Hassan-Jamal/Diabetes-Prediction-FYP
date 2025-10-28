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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { toast } from "sonner"

interface ConsultationRequest {
  id: string
  request_date: string
  request_time: string
  status: string
  notes: string | null
  is_urgent: boolean
  created_at: string
  patients: {
    id: string
    name: string
    email: string
  } | null
  consultants: {
    id: string
    name: string
    specialization: string | null
  } | null
}

interface Consultant {
  id: string
  name: string
  specialization: string | null
}

function ConsultationRequestsContent() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [requests, setRequests] = useState<ConsultationRequest[]>([])
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedRequest, setSelectedRequest] = useState<ConsultationRequest | null>(null)
  const [selectedConsultant, setSelectedConsultant] = useState<string>("")
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isUrgentDialogOpen, setIsUrgentDialogOpen] = useState(false)

  useEffect(() => {
    fetchRequests()
    fetchConsultants()
  }, [statusFilter])

  const fetchRequests = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)

      const response = await fetch(`/api/hospital/consultation-requests?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch consultation requests")
      }

      const data = await response.json()
      setRequests(data.requests || [])
    } catch (error) {
      console.error("Error fetching consultation requests:", error)
      toast.error("Failed to load consultation requests")
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

  const handleApprove = async (requestId: string) => {
    try {
      const response = await fetch(`/api/hospital/consultation-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "accepted" }),
      })

      if (!response.ok) {
        throw new Error("Failed to approve request")
      }

      toast.success("Consultation request approved!")
      fetchRequests()
    } catch (error) {
      console.error("Error approving request:", error)
      toast.error("Failed to approve request")
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      const response = await fetch(`/api/hospital/consultation-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      })

      if (!response.ok) {
        throw new Error("Failed to reject request")
      }

      toast.success("Consultation request rejected")
      fetchRequests()
    } catch (error) {
      console.error("Error rejecting request:", error)
      toast.error("Failed to reject request")
    }
  }

  const handleAssignConsultant = (request: ConsultationRequest) => {
    setSelectedRequest(request)
    setSelectedConsultant("")
    setIsAssignDialogOpen(true)
  }

  const confirmAssignConsultant = async () => {
    if (!selectedRequest || !selectedConsultant) return

    try {
      const response = await fetch(`/api/hospital/consultation-requests/${selectedRequest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultant_id: selectedConsultant }),
      })

      if (!response.ok) {
        throw new Error("Failed to assign consultant")
      }

      toast.success("Consultant assigned successfully!")
      setIsAssignDialogOpen(false)
      fetchRequests()
    } catch (error) {
      console.error("Error assigning consultant:", error)
      toast.error("Failed to assign consultant")
    }
  }

  const handleToggleUrgent = (requestId: string, currentUrgent: boolean) => {
    setSelectedRequest({ id: requestId, is_urgent: currentUrgent } as ConsultationRequest)
    setIsUrgentDialogOpen(true)
  }

  const confirmToggleUrgent = async () => {
    if (!selectedRequest) return

    try {
      const response = await fetch(`/api/hospital/consultation-requests/${selectedRequest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_urgent: !selectedRequest.is_urgent }),
      })

      if (!response.ok) {
        throw new Error("Failed to update urgent status")
      }

      toast.success(`Request marked as ${!selectedRequest.is_urgent ? "urgent" : "normal"}`)
      setIsUrgentDialogOpen(false)
      fetchRequests()
    } catch (error) {
      console.error("Error updating urgent status:", error)
      toast.error("Failed to update urgent status")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-700">
            Pending
          </span>
        )
      case "accepted":
        return (
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
            Accepted
          </span>
        )
      case "rejected":
        return (
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700">
            Rejected
          </span>
        )
      default:
        return <span className="px-3 py-1 rounded-full text-sm text-slate-600">{status}</span>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50">
      {/* Header */}
      <header className="border-b border-blue-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Consultation Requests</h1>
            <p className="text-sm text-slate-600">Manage patient consultation requests</p>
          </div>
          <Button onClick={logout} variant="outline" style={{ borderColor: "#0369a1", color: "#0369a1" }} className="bg-transparent">
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
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold transition-all hover:shadow-lg"
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
          {/* Filters */}
          <Card className="border-2 border-blue-200 bg-white p-6 mb-6 shadow-lg">
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-64 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex-1 text-right">
                <p className="text-sm text-slate-600">Total Requests: {requests.length}</p>
              </div>
            </div>
          </Card>

          {/* Requests Table */}
          <Card className="border-2 border-blue-200 bg-white shadow-lg">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Consultation Requests</h2>
              
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-slate-200 rounded animate-pulse" />
                  ))}
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="h-16 w-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-slate-600 mb-2">No consultation requests found</h3>
                  <p className="text-slate-500">
                    {statusFilter !== "all" 
                      ? "Try adjusting your filter criteria" 
                      : "No requests have been submitted yet"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Consultant</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Urgent</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">
                            {request.patients?.name || "Unknown"}
                          </TableCell>
                          <TableCell>{formatDate(request.request_date)}</TableCell>
                          <TableCell>{request.request_time}</TableCell>
                          <TableCell>
                            {request.consultants ? (
                              <div>
                                <div className="font-medium">{request.consultants.name}</div>
                                {request.consultants.specialization && (
                                  <div className="text-sm text-slate-500">{request.consultants.specialization}</div>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400">Not assigned</span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell>
                            {request.is_urgent && (
                              <span className="text-red-600 font-semibold">🔥 Urgent</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {request.status === "pending" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleApprove(request.id)}
                                    className="border-green-600 text-green-600 hover:bg-green-50"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleReject(request.id)}
                                    className="border-red-600 text-red-600 hover:bg-red-50"
                                  >
                                    Reject
                                  </Button>
                                  {!request.consultants && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleAssignConsultant(request)}
                                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                                    >
                                      Assign
                                    </Button>
                                  )}
                                </>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleUrgent(request.id, request.is_urgent)}
                                className={`${request.is_urgent ? "border-red-600 text-red-600" : "border-amber-600 text-amber-600"} hover:bg-amber-50`}
                              >
                                {request.is_urgent ? "🔄 Normal" : "🔥 Mark Urgent"}
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

      {/* Assign Consultant Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Consultant</DialogTitle>
            <DialogDescription>
              Select a consultant for this consultation request
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Select value={selectedConsultant} onValueChange={setSelectedConsultant}>
              <SelectTrigger>
                <SelectValue placeholder="Select a consultant" />
              </SelectTrigger>
              <SelectContent>
                {consultants.map((consultant) => (
                  <SelectItem key={consultant.id} value={consultant.id}>
                    {consultant.name} - {consultant.specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAssignConsultant} disabled={!selectedConsultant}>
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Urgent Confirmation Dialog */}
      <Dialog open={isUrgentDialogOpen} onOpenChange={setIsUrgentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Urgent</DialogTitle>
            <DialogDescription>
              Are you sure you want to {selectedRequest?.is_urgent ? "remove the urgent" : "mark as urgent"} for this request?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUrgentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmToggleUrgent} className="bg-amber-600 hover:bg-amber-700">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function ConsultationRequests() {
  return (
    <ProtectedRoute requiredRole="hospital">
      <ConsultationRequestsContent />
    </ProtectedRoute>
  )
}

