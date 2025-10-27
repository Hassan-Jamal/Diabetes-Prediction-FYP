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

      router.push("/hospital/login")
    } catch (error) {
      console.error("[v0] Signup error:", error)
      setErrors({ submit: error instanceof Error ? error.message : "Signup failed. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="hospital-gradient min-h-screen">
      {/* Header */}
      <header className="border-b border-blue-200/50 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-2xl font-bold gradient-text from-blue-600 to-cyan-600">Healthcare Portal</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold gradient-text from-blue-600 to-cyan-600 mb-3">Hospital Registration</h1>
          <p className="text-lg text-slate-600">Join our healthcare network and manage your operations efficiently</p>
        </div>

        <Card className="premium-card p-8">
          {errors.submit && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Hospital Information */}
            <div>
              <h2 className="mb-6 text-xl font-bold text-slate-900 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                Hospital Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Hospital Name *</label>
                  <Input
                    type="text"
                    name="hospitalName"
                    value={formData.hospitalName}
                    onChange={handleChange}
                    placeholder="Enter your hospital name"
                    className={`rounded-lg border-2 transition-colors ${errors.hospitalName ? "border-red-500" : "border-blue-200 focus:border-blue-500"}`}
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
                      className={`rounded-lg border-2 transition-colors ${errors.email ? "border-red-500" : "border-blue-200 focus:border-blue-500"}`}
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
                      className={`rounded-lg border-2 transition-colors ${errors.phone ? "border-red-500" : "border-blue-200 focus:border-blue-500"}`}
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
                    className={`rounded-lg border-2 transition-colors ${errors.address ? "border-red-500" : "border-blue-200 focus:border-blue-500"}`}
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
                      className={`rounded-lg border-2 transition-colors ${errors.city ? "border-red-500" : "border-blue-200 focus:border-blue-500"}`}
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
                      className={`rounded-lg border-2 transition-colors ${errors.state ? "border-red-500" : "border-blue-200 focus:border-blue-500"}`}
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
                      className={`rounded-lg border-2 transition-colors ${errors.zipCode ? "border-red-500" : "border-blue-200 focus:border-blue-500"}`}
                    />
                    {errors.zipCode && <p className="mt-2 text-sm text-red-500">{errors.zipCode}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Security Information */}
            <div className="border-t border-blue-100 pt-8">
              <h2 className="mb-6 text-xl font-bold text-slate-900 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                Security Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Password *</label>
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password (min 8 characters)"
                    className={`rounded-lg border-2 transition-colors ${errors.password ? "border-red-500" : "border-blue-200 focus:border-blue-500"}`}
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
                    className={`rounded-lg border-2 transition-colors ${errors.confirmPassword ? "border-red-500" : "border-blue-200 focus:border-blue-500"}`}
                  />
                  {errors.confirmPassword && <p className="mt-2 text-sm text-red-500">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="premium-button w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 text-lg"
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
                className="font-bold gradient-text from-blue-600 to-cyan-600 hover:opacity-80"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </Card>
      </main>
    </div>
  )
}
