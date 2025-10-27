"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

export default function HospitalSignup() {
  const router = useRouter()
  const supabase = createClient()
  const [formData, setFormData] = useState({
    hospitalName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
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

    if (!formData.hospitalName.trim()) newErrors.hospitalName = "Hospital name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!formData.address.trim()) newErrors.address = "Address is required"
    if (!formData.city.trim()) newErrors.city = "City is required"
    if (!formData.state.trim()) newErrors.state = "State is required"
    if (!formData.zipCode.trim()) newErrors.zipCode = "Zip code is required"
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
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: "hospital",
            organization_name: formData.hospitalName,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            postal_code: formData.zipCode,
          },
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/hospital/dashboard`,
        },
      })

      if (error) throw error

      // Show success message and redirect to login page
      setSuccess(true)
      setTimeout(() => {
        router.push("/hospital/login")
      }, 2000)
    } catch (error) {
      console.error("[v0] Signup error:", error)
      setErrors({ submit: error instanceof Error ? error.message : "Signup failed. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="hospital-gradient min-h-screen relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl animate-pulse delay-75"></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-blue-200/50 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <span className="text-2xl font-bold gradient-text from-blue-600 to-cyan-600">
              Healthcare Portal
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Icon Section */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-400 rounded-3xl blur-xl opacity-30 animate-pulse"></div>
            <div className="relative h-20 w-20 rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-2xl">
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold gradient-text from-blue-600 to-cyan-600 mb-3">Hospital Registration</h1>
          <p className="text-slate-600 text-lg">Join our healthcare network and manage your operations efficiently</p>
        </div>

        {success ? (
          <Card className="premium-card p-12 border-2 border-blue-200/50 bg-white/90 backdrop-blur-sm shadow-2xl text-center max-w-md mx-auto">
            <div className="mb-6 flex justify-center">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <svg className="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Account Created Successfully!</h2>
            <p className="text-slate-600 mb-6">Redirecting to login...</p>
          </Card>
        ) : (
          <Card className="premium-card p-8 border-2 border-blue-200/50 bg-white/90 backdrop-blur-sm shadow-2xl">
            {errors.submit && (
              <div className="mb-6 rounded-xl bg-red-50 p-4 border border-red-200 flex items-start gap-3">
                <svg className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700">{errors.submit}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Hospital Information */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">1</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Hospital Information</h2>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Hospital Name *</label>
                    <Input
                      type="text"
                      name="hospitalName"
                      value={formData.hospitalName}
                      onChange={handleChange}
                      placeholder="Enter your hospital name"
                      className={`rounded-xl border-2 transition-all py-5 text-base ${
                        errors.hospitalName
                          ? "border-red-500 focus:border-red-600"
                          : "border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      }`}
                    />
                    {errors.hospitalName && <p className="mt-2 text-sm text-red-500">{errors.hospitalName}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address *</label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="hospital@example.com"
                        className={`rounded-xl border-2 transition-all py-5 text-base ${
                          errors.email
                            ? "border-red-500 focus:border-red-600"
                            : "border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        }`}
                      />
                      {errors.email && <p className="mt-2 text-sm text-red-500">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number *</label>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(555) 000-0000"
                        className={`rounded-xl border-2 transition-all py-5 text-base ${
                          errors.phone
                            ? "border-red-500 focus:border-red-600"
                            : "border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        }`}
                      />
                      {errors.phone && <p className="mt-2 text-sm text-red-500">{errors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Street Address *</label>
                    <Input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="123 Medical Center Drive"
                      className={`rounded-xl border-2 transition-all py-5 text-base ${
                        errors.address
                          ? "border-red-500 focus:border-red-600"
                          : "border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                        placeholder="New York"
                        className={`rounded-xl border-2 transition-all py-5 text-base ${
                          errors.city
                            ? "border-red-500 focus:border-red-600"
                            : "border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                        placeholder="NY"
                        className={`rounded-xl border-2 transition-all py-5 text-base ${
                          errors.state
                            ? "border-red-500 focus:border-red-600"
                            : "border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                        placeholder="10001"
                        className={`rounded-xl border-2 transition-all py-5 text-base ${
                          errors.zipCode
                            ? "border-red-500 focus:border-red-600"
                            : "border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        }`}
                      />
                      {errors.zipCode && <p className="mt-2 text-sm text-red-500">{errors.zipCode}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Information */}
              <div className="border-t border-blue-100 pt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">2</span>
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
                      placeholder="Create a strong password (min 8 characters)"
                      className={`rounded-xl border-2 transition-all py-5 text-base ${
                        errors.password
                          ? "border-red-500 focus:border-red-600"
                          : "border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                      placeholder="Confirm your password"
                      className={`rounded-xl border-2 transition-all py-5 text-base ${
                        errors.confirmPassword
                          ? "border-red-500 focus:border-red-600"
                          : "border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                className="premium-button w-full py-6 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating Account..." : "Create Hospital Account"}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-8 border-t border-blue-100 pt-6 text-center">
              <p className="text-slate-600">
                Already have an account?{" "}
                <Link
                  href="/hospital/login"
                  className="font-bold gradient-text from-blue-600 to-cyan-600 hover:opacity-80 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}
