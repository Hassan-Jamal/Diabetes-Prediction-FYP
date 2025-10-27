"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface Test {
  id: string
  testName: string
  price: number
  description: string
  labId: string
}

function LabTestsContent() {
  const { user, logout } = useAuth()
  const [tests, setTests] = useState<Test[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteTestId, setDeleteTestId] = useState<string | null>(null)
  const [editingTest, setEditingTest] = useState<Test | null>(null)
  const [formData, setFormData] = useState({
    testName: "",
    price: "",
    description: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchTests()
  }, [])

  const fetchTests = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/lab/tests")
      const data = await response.json()
      setTests(data.tests || [])
    } catch (error) {
      console.error("Error fetching tests:", error)
      toast.error("Failed to load tests")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenModal = (test?: Test) => {
    if (test) {
      setEditingTest(test)
      setFormData({
        testName: test.testName,
        price: test.price.toString(),
        description: test.description,
      })
    } else {
      setEditingTest(null)
      setFormData({
        testName: "",
        price: "",
        description: "",
      })
    }
    setErrors({})
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTest(null)
    setFormData({ testName: "", price: "", description: "" })
    setErrors({})
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.testName.trim()) newErrors.testName = "Test name is required"
    if (!formData.price.trim()) newErrors.price = "Price is required"
    else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = "Price must be a positive number"
    }
    if (!formData.description.trim()) newErrors.description = "Description is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      const url = editingTest ? `/api/lab/tests/${editingTest.id}` : "/api/lab/tests"
      const method = editingTest ? "PATCH" : "POST"

      console.log("[v0] Submitting test:", { url, method, editingTest: !!editingTest, formData })

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testName: formData.testName,
          price: Number(formData.price),
          description: formData.description,
        }),
      })

      console.log("[v0] Response status:", response.status)

      const result = await response.json()
      console.log("[v0] Response data:", result)

      if (!response.ok) {
        console.error("[v0] Error response:", result)
        throw new Error(result.error || "Failed to save test")
      }

      console.log("[v0] Success!")
      toast.success(editingTest ? "Test updated successfully" : "Test added successfully")
      
      // Close modal and reset form
      handleCloseModal()
      
      // Refetch tests after a short delay to ensure the database has updated
      setTimeout(() => {
        fetchTests()
      }, 100)
    } catch (error) {
      console.error("[v0] Error saving test:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save test")
    }
  }

  const handleDeleteClick = (testId: string) => {
    setDeleteTestId(testId)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTestId) {
      console.log("[v0] No delete test ID provided")
      return
    }

    try {
      console.log("[v0] Deleting test:", deleteTestId)
      
      const response = await fetch(`/api/lab/tests/${deleteTestId}`, {
        method: "DELETE",
      })

      console.log("[v0] Delete response status:", response.status)

      const result = await response.json()
      console.log("[v0] Delete response data:", result)

      if (!response.ok) {
        console.error("[v0] Delete error response:", result)
        throw new Error(result.error || "Failed to delete test")
      }

      console.log("[v0] Delete success!")
      toast.success("Test deleted successfully")
      
      // Close dialog first
      setIsDeleteDialogOpen(false)
      setDeleteTestId(null)
      
      // Refetch to get updated data after a short delay
      setTimeout(() => {
        fetchTests()
      }, 100)
    } catch (error) {
      console.error("[v0] Error deleting test:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete test")
      
      // Close dialog even on error
      setIsDeleteDialogOpen(false)
      setDeleteTestId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-green-100">
      {/* Header */}
      <header className="border-b border-emerald-200/50 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Manage Tests
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => handleOpenModal()}
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Test
            </Button>
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
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold transition-all hover:shadow-lg"
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
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Available Tests</h2>
            <p className="text-slate-600">Manage the tests offered by your laboratory</p>
          </div>

          {isLoading ? (
            <Card className="border-2 border-emerald-200/50 bg-white/90 backdrop-blur-sm p-8 shadow-xl">
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-24 bg-slate-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </Card>
          ) : tests.length === 0 ? (
            <Card className="border-2 border-emerald-200/50 bg-white/90 backdrop-blur-sm p-12 shadow-xl text-center">
              <div className="mb-6 flex justify-center">
                <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center">
                  <svg className="h-10 w-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No tests yet</h3>
              <p className="text-slate-600 mb-6">Add your first test to get started</p>
              <Button onClick={() => handleOpenModal()} className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
                Add Test
              </Button>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {tests.map((test) => (
                <Card
                  key={test.id}
                  className="border-2 border-emerald-200/50 bg-white/90 backdrop-blur-sm p-6 shadow-xl hover:shadow-2xl transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{test.testName}</h3>
                      <p className="text-2xl font-bold text-emerald-600 mb-2">${test.price}</p>
                      <p className="text-slate-600 text-sm leading-relaxed">{test.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4 border-t border-emerald-100">
                    <Button
                      onClick={() => handleOpenModal(test)}
                      variant="outline"
                      className="flex-1 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteClick(test.id)}
                      variant="destructive"
                      className="flex-1"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => {
        if (!open) {
          handleCloseModal()
        }
      }}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingTest ? "Edit Test" : "Add New Test"}
            </DialogTitle>
            <DialogDescription>Enter the details for the test</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Test Name *</label>
                <Input
                  value={formData.testName}
                  onChange={(e) => {
                    setFormData({ ...formData, testName: e.target.value })
                    if (errors.testName) setErrors({ ...errors, testName: "" })
                  }}
                  placeholder="e.g., Glucose Test"
                  className={`rounded-xl border-2 transition-all py-5 ${
                    errors.testName
                      ? "border-red-500 focus:border-red-600"
                      : "border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  }`}
                />
                {errors.testName && <p className="mt-2 text-sm text-red-500">{errors.testName}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Price ($) *</label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => {
                    setFormData({ ...formData, price: e.target.value })
                    if (errors.price) setErrors({ ...errors, price: "" })
                  }}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={`rounded-xl border-2 transition-all py-5 ${
                    errors.price
                      ? "border-red-500 focus:border-red-600"
                      : "border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  }`}
                />
                {errors.price && <p className="mt-2 text-sm text-red-500">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description *</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value })
                    if (errors.description) setErrors({ ...errors, description: "" })
                  }}
                  placeholder="Enter test description..."
                  rows={4}
                  className={`rounded-xl border-2 transition-all resize-none ${
                    errors.description
                      ? "border-red-500 focus:border-red-600"
                      : "border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  }`}
                />
                {errors.description && <p className="mt-2 text-sm text-red-500">{errors.description}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
              >
                {editingTest ? "Update Test" : "Add Test"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the test from your laboratory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTestId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function LabTests() {
  return (
    <ProtectedRoute requiredRole="lab">
      <LabTestsContent />
    </ProtectedRoute>
  )
}

