"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"

export default function LabLogin() {
  const router = useRouter()
  const supabase = createClient()
  const { setUser } = useAuth()
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

      // Check if user has the lab role
      if (data.user) {
        const userMetadata = data.user.user_metadata
        if (userMetadata?.role !== 'lab') {
          throw new Error("Unauthorized: Lab role required")
        }

        // Store user in context for the dashboard
        const userData = {
          id: data.user.id,
          email: data.user.email || formData.email,
          role: 'lab' as const,
          organizationName: userMetadata?.organization_name || 'Lab',
        }

        localStorage.setItem("user", JSON.stringify(userData))
        setUser(userData)
        
        if (rememberMe) {
          localStorage.setItem("rememberEmail", formData.email)
        }

        router.push("/lab/dashboard")
      }
    } catch (error) {
      console.error("[v0] Login error:", error)
      setErrors({ submit: error instanceof Error ? error.message : "Invalid email or password" })
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
      <main className="relative flex-1 flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-lg">
          {/* Icon Section */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-400 rounded-3xl blur-xl opacity-30 animate-pulse"></div>
              <div className="relative h-24 w-24 rounded-3xl bg-gradient-to-br from-emerald-600 to-green-600 flex items-center justify-center shadow-2xl">
                <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-3">
              Laboratory Login
            </h1>
            <p className="text-slate-600 text-lg">Sign in to your laboratory account</p>
          </div>

          <Card className="border-2 border-emerald-200/50 bg-white/90 backdrop-blur-sm p-8 shadow-2xl">
            {errors.submit && (
              <div className="mb-6 rounded-xl bg-red-50 p-4 border border-red-200 flex items-start gap-3 animate-fadeIn">
                <svg className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700">{errors.submit}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="lab@example.com"
                  className={`rounded-xl border-2 transition-all py-6 text-base ${
                    errors.email
                      ? "border-red-500 focus:border-red-600"
                      : "border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  }`}
                />
                {errors.email && <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email}
                </p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`rounded-xl border-2 transition-all py-6 text-base ${
                    errors.password
                      ? "border-red-500 focus:border-red-600"
                      : "border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  }`}
                />
                {errors.password && <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password}
                </p>}
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-5 w-5 rounded border-emerald-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
                </label>
                <Link
                  href="/lab/forgot-password"
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 text-base font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 border-t border-emerald-100 pt-6">
              <p className="text-center text-slate-600">
                Don't have an account?{" "}
                <Link href="/lab/signup" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                  Sign up here
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link href="/" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                Back to home
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
