"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

export default function LabForgotPassword() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [emailSent, setEmailSent] = useState(false)

  const validateEmail = () => {
    const newErrors: Record<string, string> = {}
    if (!email.trim()) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Invalid email format"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateEmail()) return

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/lab/reset-password`,
      })

      if (error) throw error

      setEmailSent(true)
      setSuccessMessage("Password reset link sent to your email!")
      setErrors({})
    } catch (error) {
      console.error("[v0] Reset password error:", error)
      setErrors({ submit: error instanceof Error ? error.message : "Failed to send reset link. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-green-100">
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
      <main className="relative flex-1 flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg">
          {!emailSent ? (
            <>
              {/* Icon Section */}
              <div className="mb-8 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-400 rounded-3xl blur-xl opacity-30 animate-pulse"></div>
                  <div className="relative h-24 w-24 rounded-3xl bg-gradient-to-br from-emerald-600 to-green-600 flex items-center justify-center shadow-2xl">
                    <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Heading */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-3">
                  Reset Password
                </h1>
                <p className="text-slate-600 text-lg">Enter your email to receive a reset link</p>
              </div>

              <Card className="border-2 border-emerald-200/50 bg-white/90 backdrop-blur-sm p-8 shadow-2xl">
                {errors.submit && (
                  <div className="mb-6 rounded-xl bg-red-50 p-4 border border-red-200 flex items-start gap-3 animate-fadeIn">
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
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Email Address
                    </label>
                    <p className="text-xs text-slate-500 mb-3">Enter your lab account email</p>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (errors.email) setErrors((prev) => ({ ...prev, email: "" }))
                      }}
                      placeholder="lab@example.com"
                      className={`rounded-xl border-2 transition-all ${
                        errors.email
                          ? "border-red-500 focus:border-red-600"
                          : "border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      } py-6 text-base`}
                    />
                    {errors.email && <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.email}
                    </p>}
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
                        Sending...
                      </span>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>

                <div className="mt-8 border-t border-emerald-100 pt-6">
                  <Link
                    href="/lab/login"
                    className="block text-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    ← Back to login
                  </Link>
                </div>
              </Card>
            </>
          ) : (
            <Card className="border-2 border-emerald-200/50 bg-white/90 backdrop-blur-sm p-12 shadow-2xl text-center">
              <div className="mb-6 flex justify-center">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg">
                  <svg className="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Check Your Email</h2>
              <p className="text-slate-600 mb-6">{successMessage}</p>
              <p className="text-sm text-slate-500 mb-6">
                We've sent a password reset link to <span className="font-semibold text-slate-700">{email}</span>
              </p>
              <p className="text-xs text-slate-400 mb-6">Click the link in the email to reset your password</p>
              <Link
                href="/lab/login"
                className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg"
              >
                Back to Login
              </Link>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
