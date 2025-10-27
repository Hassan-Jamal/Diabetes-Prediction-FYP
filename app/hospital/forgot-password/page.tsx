"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function HospitalForgotPassword() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tokenFromUrl = searchParams.get("token")

  const [step, setStep] = useState<"email" | "reset">(tokenFromUrl ? "reset" : "email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const validateEmail = () => {
    const newErrors: Record<string, string> = {}
    if (!email.trim()) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Invalid email format"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePassword = () => {
    const newErrors: Record<string, string> = {}
    if (!password) newErrors.password = "Password is required"
    else if (password.length < 8) newErrors.password = "Password must be at least 8 characters"
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateEmail()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: "hospital" }),
      })

      if (!response.ok) {
        throw new Error("Failed to send reset email")
      }

      setSuccessMessage("Reset link sent to your email. Check your inbox!")
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (error) {
      console.error("[v0] Error:", error)
      setErrors({ submit: "Failed to send reset email. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePassword()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenFromUrl, password, confirmPassword }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to reset password")
      }

      setSuccessMessage("Password reset successfully! Redirecting to login...")
      setTimeout(() => {
        router.push("/hospital/login")
      }, 2000)
    } catch (error) {
      console.error("[v0] Error:", error)
      setErrors({ submit: error instanceof Error ? error.message : "Failed to reset password" })
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
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold gradient-text from-blue-600 to-cyan-600 mb-2">Reset Your Password</h1>
            <p className="text-slate-600">Secure your hospital account with a new password</p>
          </div>

          <Card className="premium-card p-8">
            {successMessage && (
              <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-700 border border-green-200 flex items-center gap-2">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {successMessage}
              </div>
            )}

            {errors.submit && (
              <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200 flex items-center gap-2">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.submit}
              </div>
            )}

            {step === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                  <p className="text-xs text-slate-500 mb-3">Enter the email associated with your hospital account</p>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errors.email) setErrors((prev) => ({ ...prev, email: "" }))
                    }}
                    placeholder="hospital@example.com"
                    className={`rounded-lg border-2 transition-colors ${errors.email ? "border-red-500" : "border-blue-200 focus:border-blue-500"}`}
                  />
                  {errors.email && <p className="mt-2 text-sm text-red-500">{errors.email}</p>}
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="premium-button w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 text-lg"
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            )}

            {step === "reset" && (
              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                  <p className="text-xs text-slate-500 mb-3">Create a strong password with at least 8 characters</p>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (errors.password) setErrors((prev) => ({ ...prev, password: "" }))
                    }}
                    placeholder="Enter new password"
                    className={`rounded-lg border-2 transition-colors ${errors.password ? "border-red-500" : "border-blue-200 focus:border-blue-500"}`}
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
                    className={`rounded-lg border-2 transition-colors ${errors.confirmPassword ? "border-red-500" : "border-blue-200 focus:border-blue-500"}`}
                  />
                  {errors.confirmPassword && <p className="mt-2 text-sm text-red-500">{errors.confirmPassword}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="premium-button w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 text-lg"
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            )}

            <div className="mt-8 border-t border-blue-100 pt-6 text-center">
              <Link
                href="/hospital/login"
                className="text-sm font-semibold gradient-text from-blue-600 to-cyan-600 hover:opacity-80"
              >
                Back to login
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
