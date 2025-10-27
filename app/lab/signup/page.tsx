"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

export default function LabSignup() {
  const router = useRouter()
  const supabase = createClient()
  const [formData, setFormData] = useState({
    labName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    licenseNumber: "",
    password: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.labName.trim()) newErrors.labName = "Lab name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!formData.address.trim()) newErrors.address = "Address is required"
    if (!formData.city.trim()) newErrors.city = "City is required"
    if (!formData.state.trim()) newErrors.state = "State is required"
    if (!formData.zipCode.trim()) newErrors.zipCode = "Zip code is required"
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = "License number is required"
    if (!formData.password) newErrors.password = "Password is required"
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters"
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: "lab",
            organization_name: formData.labName,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            postal_code: formData.zipCode,
            license_number: formData.licenseNumber,
          },
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/lab/dashboard`,
        },
      })

      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        router.push("/lab/login")
      }, 2000)
    } catch (error) {
      console.error("[v0] Signup error:", error)
      setErrors({ submit: error instanceof Error ? error.message : "Signup failed. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-green-100 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-200/30 rounded-full blur-3xl animate-pulse delay-75"></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-emerald-200/50 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-600 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Healthcare Portal
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Icon & Heading */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-400 rounded-3xl blur-xl opacity-30 animate-pulse"></div>
            <div className="relative h-20 w-20 rounded-3xl bg-gradient-to-br from-emerald-600 to-green-600 flex items-center justify-center shadow-2xl">
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-3">
            Laboratory Registration
          </h1>
          <p className="text-slate-600 text-lg">Create an account for your laboratory</p>
        </div>

        {success ? (
          <Card className="border-2 border-emerald-200/50 bg-white/90 backdrop-blur-sm p-12 shadow-2xl text-center">
            <div className="mb-6 flex justify-center">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg">
                <svg className="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Account Created Successfully!</h2>
            <p className="text-slate-600 mb-6">Redirecting to login...</p>
          </Card>
        ) : (
          <Card className="border-2 border-emerald-200/50 bg-white/90 backdrop-blur-sm p-8 shadow-2xl">
            {errors.submit && (
              <div className="mb-6 rounded-xl bg-red-50 p-4 border border-red-200 flex items-start gap-3">
                <svg className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700">{errors.submit}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Lab Information Section */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-600 font-bold text-lg">1</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Laboratory Information</h2>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Lab Name *</label>
                    <Input
                      type="text"
                      name="labName"
                      value={formData.labName}
                      onChange={handleChange}
                      placeholder="Enter lab name"
                      className={`rounded-xl border-2 transition-all py-5 text-base ${
                        errors.labName
                          ? "border-red-500 focus:border-red-600"
                          : "border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      }`}
                    />
                    {errors.labName && <p className="mt-2 text-sm text-red-500">{errors.labName}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="lab@example.com"
                        className={`rounded-xl border-2 transition-all py-5 text-base ${
                          errors.email
                            ? "border-red-500 focus:border-red-600"
                            : "border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        }`}
                      />
                      {errors.email && <p className="mt-2 text-sm text-red-500">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Phone *</label>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(555) 000-0000"
                        className={`rounded-xl border-2 transition-all py-5 text-base ${
                          errors.phone
                            ? "border-red-500 focus:border-red-600"
                            : "border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        }`}
                      />
                      {errors.phone && <p className="mt-2 text-sm text-red-500">{errors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Address *</label>
                    <Input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Street address"
                      className={`rounded-xl border-2 transition-all py-5 text-base ${
                        errors.address
                          ? "border-red-500 focus:border-red-600"
                          : "border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      }`}
                    />
                    {errors.address && <p className="mt-2 text-sm text-red-500">{errors.address}</p>}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">City *</label>
                      <Input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="City"
                        className={`rounded-xl border-2 transition-all py-5 text-base ${
                          errors.city
                            ? "border-red-500 focus:border-red-600"
                            : "border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        }`}
                      />
                      {errors.city && <p className="mt-2 text-sm text-red-500">{errors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">State *</label>
                      <Input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="State"
                        className={`rounded-xl border-2 transition-all py-5 text-base ${
                          errors.state
                            ? "border-red-500 focus:border-red-600"
                            : "border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        }`}
                      />
                      {errors.state && <p className="mt-2 text-sm text-red-500">{errors.state}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Zip Code *</label>
                      <Input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        placeholder="12345"
                        className={`rounded-xl border-2 transition-all py-5 text-base ${
                          errors.zipCode
                            ? "border-red-500 focus:border-red-600"
                            : "border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        }`}
                      />
                      {errors.zipCode && <p className="mt-2 text-sm text-red-500">{errors.zipCode}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">License Number *</label>
                    <Input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      placeholder="Enter lab license number"
                      className={`rounded-xl border-2 transition-all py-5 text-base ${
                        errors.licenseNumber
                          ? "border-red-500 focus:border-red-600"
                          : "border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      }`}
                    />
                    {errors.licenseNumber && <p className="mt-2 text-sm text-red-500">{errors.licenseNumber}</p>}
                  </div>
                </div>
              </div>

              {/* Security Information Section */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-600 font-bold text-lg">2</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Security Information</h2>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Password *</label>
                    <Input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter password (min 8 characters)"
                      className={`rounded-xl border-2 transition-all py-5 text-base ${
                        errors.password
                          ? "border-red-500 focus:border-red-600"
                          : "border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      }`}
                    />
                    {errors.password && <p className="mt-2 text-sm text-red-500">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password *</label>
                    <Input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
                      className={`rounded-xl border-2 transition-all py-5 text-base ${
                        errors.confirmPassword
                          ? "border-red-500 focus:border-red-600"
                          : "border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      }`}
                    />
                    {errors.confirmPassword && <p className="mt-2 text-sm text-red-500">{errors.confirmPassword}</p>}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 text-base font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating Account..." : "Create Lab Account"}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-8 border-t border-emerald-100 pt-6">
              <p className="text-center text-slate-600">
                Already have an account?{" "}
                <Link href="/lab/login" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                  Login here
                </Link>
              </p>
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}
