"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

export default function HospitalLogin() {
  const router = useRouter()
  const supabase = createClient()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format"
    if (!formData.password) newErrors.password = "Password is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) throw error

      // Check if user has the hospital role
      if (data.user) {
        const userMetadata = data.user.user_metadata
        if (userMetadata?.role !== 'hospital') {
          throw new Error("Unauthorized: Hospital role required")
        }

        // Store user in context for the dashboard
        const userData = {
          id: data.user.id,
          email: data.user.email || formData.email,
          role: 'hospital' as const,
          organizationName: userMetadata?.organization_name || 'Hospital',
        }

        localStorage.setItem("user", JSON.stringify(userData))
        
        if (rememberMe) {
          localStorage.setItem("rememberEmail", formData.email)
        }

        router.push("/hospital/dashboard")
      }
    } catch (error) {
      console.error("Login error:", error)
      setErrors({ submit: error instanceof Error ? error.message : "Invalid email or password" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="hospital-gradient min-h-screen flex flex-col">
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
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mb-6 flex justify-center">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
                <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold gradient-text from-blue-600 to-cyan-600 mb-2">Hospital Login</h1>
            <p className="text-slate-600">Access your hospital management dashboard</p>
          </div>

          <Card className="premium-card p-8">
            {errors.submit && (
              <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`rounded-lg border-2 transition-colors ${errors.password ? "border-red-500" : "border-blue-200 focus:border-blue-500"}`}
                />
                {errors.password && <p className="mt-2 text-sm text-red-500">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-blue-300 text-blue-600"
                  />
                  <span className="text-sm text-slate-600">Remember me</span>
                </label>
                <Link
                  href="/hospital/forgot-password"
                  className="text-sm font-semibold gradient-text from-blue-600 to-cyan-600 hover:opacity-80"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="premium-button w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 text-lg mt-6"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-8 border-t border-blue-100 pt-6 text-center">
              <p className="text-slate-600">
                Don't have an account?{" "}
                <Link
                  href="/hospital/signup"
                  className="font-bold gradient-text from-blue-600 to-cyan-600 hover:opacity-80"
                >
                  Create one here
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link href="/" className="text-sm text-slate-600 hover:text-slate-900 font-medium">
                Back to home
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
