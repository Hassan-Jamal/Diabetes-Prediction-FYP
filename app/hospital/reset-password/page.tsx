"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

export default function HospitalResetPassword() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const validatePassword = () => {
    const newErrors: Record<string, string> = {}
    if (!password) newErrors.password = "Password is required"
    else if (password.length < 8) newErrors.password = "Password must be at least 8 characters"
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePassword()) return

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        router.push("/hospital/login")
      }, 2000)
    } catch (error) {
      console.error("[v0] Reset password error:", error)
      setErrors({ submit: error instanceof Error ? error.message : "Failed to reset password" })
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="hospital-gradient min-h-screen flex items-center justify-center">
        <Card className="premium-card p-12 max-w-md text-center border-2 border-blue-200/50">
          <div className="mb-6 flex justify-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <svg className="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Password Reset Successful!</h2>
          <p className="text-slate-600 mb-6">Your password has been updated. Redirecting to login...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="hospital-gradient min-h-screen flex flex-col">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
      </div>

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

      <main className="relative flex-1 flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg">
          <div className="mb-8 flex justify-center">
            <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-2xl">
              <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold gradient-text from-blue-600 to-cyan-600 mb-3">
              Create New Password
            </h1>
            <p className="text-slate-600 text-lg">Enter your new password below</p>
          </div>

          <Card className="premium-card p-8 border-2 border-blue-200/50">
            {errors.submit && (
              <div className="mb-6 rounded-xl bg-red-50 p-4 border border-red-200 flex items-start gap-3">
                <svg className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-red-700">{errors.submit}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors((prev) => ({ ...prev, password: "" }))
                  }}
                  placeholder="Enter new password (min 8 characters)"
                  className={`rounded-xl border-2 transition-all py-6 text-base ${
                    errors.password
                      ? "border-red-500 focus:border-red-600"
                      : "border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  }`}
                />
                {errors.password && <p className="mt-2 text-sm text-red-500">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }))
                  }}
                  placeholder="Confirm new password"
                  className={`rounded-xl border-2 transition-all py-6 text-base ${
                    errors.confirmPassword
                      ? "border-red-500 focus:border-red-600"
                      : "border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  }`}
                />
                {errors.confirmPassword && <p className="mt-2 text-sm text-red-500">{errors.confirmPassword}</p>}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="premium-button w-full py-6 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          </Card>
        </div>
      </main>
    </div>
  )
}

