"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function LabForgotPassword() {
  const [step, setStep] = useState<"email" | "code" | "reset">("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
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

  const validateCode = () => {
    const newErrors: Record<string, string> = {}
    if (!code.trim()) newErrors.code = "Verification code is required"
    else if (code.length !== 6) newErrors.code = "Code must be 6 digits"
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
      // TODO: Implement API call to send reset code to email
      console.log("Sending reset code to:", email)
      setSuccessMessage("Verification code sent to your email")
      setTimeout(() => {
        setStep("code")
        setSuccessMessage("")
      }, 1500)
    } catch (error) {
      console.error("Error:", error)
      setErrors({ submit: "Failed to send reset code. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateCode()) return

    setIsLoading(true)
    try {
      // TODO: Implement API call to verify reset code
      console.log("Verifying code:", code)
      setSuccessMessage("Code verified successfully")
      setTimeout(() => {
        setStep("reset")
        setSuccessMessage("")
      }, 1500)
    } catch (error) {
      console.error("Error:", error)
      setErrors({ submit: "Invalid verification code. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePassword()) return

    setIsLoading(true)
    try {
      // TODO: Implement API call to reset password
      console.log("Resetting password for:", email)
      setSuccessMessage("Password reset successfully! Redirecting to login...")
      setTimeout(() => {
        window.location.href = "/lab/login"
      }, 2000)
    } catch (error) {
      console.error("Error:", error)
      setErrors({ submit: "Failed to reset password. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Link href="/" className="text-3xl font-bold text-slate-900 hover:text-slate-700">
            Healthcare Portal
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
        <Card className="border-2 border-[#059669] bg-white p-8 shadow-lg">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-[#059669]">Reset Password</h1>
            <p className="mt-2 text-slate-600">Laboratory Account</p>
          </div>

          {successMessage && (
            <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 border border-green-200">
              {successMessage}
            </div>
          )}

          {errors.submit && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
              {errors.submit}
            </div>
          )}

          {/* Step 1: Email */}
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }))
                  }}
                  placeholder="lab@example.com"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                style={{ backgroundColor: "#059669" }}
                className="w-full text-white hover:opacity-90"
              >
                {isLoading ? "Sending..." : "Send Reset Code"}
              </Button>
            </form>
          )}

          {/* Step 2: Verification Code */}
          {step === "code" && (
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <p className="text-sm text-slate-600">Enter the 6-digit code sent to your email</p>
              <div>
                <label className="block text-sm font-medium text-slate-700">Verification Code</label>
                <Input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    if (errors.code) setErrors((prev) => ({ ...prev, code: "" }))
                  }}
                  placeholder="000000"
                  maxLength={6}
                  className={errors.code ? "border-red-500" : ""}
                />
                {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code}</p>}
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                style={{ backgroundColor: "#059669" }}
                className="w-full text-white hover:opacity-90"
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>
              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-full text-sm hover:opacity-80"
                style={{ color: "#059669" }}
              >
                Back to email
              </button>
            </form>
          )}

          {/* Step 3: Reset Password */}
          {step === "reset" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">New Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors((prev) => ({ ...prev, password: "" }))
                  }}
                  placeholder="Enter new password (min 8 characters)"
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }))
                  }}
                  placeholder="Confirm new password"
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                style={{ backgroundColor: "#059669" }}
                className="w-full text-white hover:opacity-90"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}

          <div className="mt-6 border-t border-slate-200 pt-6 text-center">
            <Link href="/lab/login" className="text-sm hover:opacity-80" style={{ color: "#059669" }}>
              Back to login
            </Link>
          </div>
        </Card>
      </main>
    </div>
  )
}
