"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Logo, LogoSmall } from "@/components/logo"
import { toast } from "sonner"

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      toast.success("Thank you! Your message has been sent successfully.")
      setFormData({ name: "", email: "", subject: "", message: "" })
    } catch (error) {
      toast.error("Failed to send message. Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogoSmall />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#0369a1] to-[#059669] bg-clip-text text-transparent">
                  DiabetesGuard
                </h1>
                <p className="text-sm text-slate-600">AI-Powered Diabetes Prediction & Management</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/hospital/login">
                <Button variant="outline" className="border-[#0369a1] text-[#0369a1] bg-transparent">
                  Hospital Login
                </Button>
              </Link>
              <Link href="/lab/login">
                <Button variant="outline" className="border-[#059669] text-[#059669] bg-transparent">
                  Lab Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h2 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
                Advanced Diabetes Prediction & Management
              </h2>
              <p className="mt-6 text-xl text-slate-600 leading-relaxed">
                Revolutionize your healthcare delivery with our comprehensive diabetes prediction and consultation
                platform. Designed for hospitals and laboratories to provide accurate, timely, and actionable insights
                for better patient outcomes.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link href="/hospital/signup">
                  <Button
                    size="lg"
                    style={{ backgroundColor: "#0369a1" }}
                    className="w-full sm:w-auto text-white hover:opacity-90"
                  >
                    Hospital Sign Up
                  </Button>
                </Link>
                <Link href="/lab/signup">
                  <Button
                    size="lg"
                    style={{ backgroundColor: "#059669" }}
                    className="w-full sm:w-auto text-white hover:opacity-90"
                  >
                    Lab Sign Up
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0369a1]/20 to-[#059669]/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-[#0369a1]/10 to-[#059669]/10 rounded-3xl p-8 border border-slate-200">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-slate-200">
                    <div className="h-3 w-3 rounded-full bg-[#0369a1]"></div>
                    <span className="text-slate-700">Real-time Diabetes Risk Assessment</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-slate-200">
                    <div className="h-3 w-3 rounded-full bg-[#059669]"></div>
                    <span className="text-slate-700">Comprehensive Patient Analytics</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-slate-200">
                    <div className="h-3 w-3 rounded-full bg-[#0369a1]"></div>
                    <span className="text-slate-700">Secure Data Management</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-slate-200">
                    <div className="h-3 w-3 rounded-full bg-[#059669]"></div>
                    <span className="text-slate-700">Integrated Consultation Tools</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-slate-900">Powerful Features for Healthcare Providers</h3>
            <p className="mt-4 text-xl text-slate-600">Everything you need to deliver exceptional diabetes care</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <Card className="border border-slate-200 p-8 hover:shadow-lg transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <svg className="h-6 w-6 text-[#0369a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-slate-900">Advanced Analytics</h4>
              <p className="mt-2 text-slate-600">
                Leverage AI-powered analytics to identify diabetes risk patterns and predict patient outcomes with high
                accuracy.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="border border-slate-200 p-8 hover:shadow-lg transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
                <svg className="h-6 w-6 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-slate-900">Customizable Workflows</h4>
              <p className="mt-2 text-slate-600">
                Tailor the platform to your organization's specific needs with flexible configuration options and
                integrations.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="border border-slate-200 p-8 hover:shadow-lg transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <svg className="h-6 w-6 text-[#0369a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-slate-900">Enterprise Security</h4>
              <p className="mt-2 text-slate-600">
                HIPAA-compliant infrastructure with end-to-end encryption, role-based access control, and comprehensive
                audit logs.
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="border border-slate-200 p-8 hover:shadow-lg transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
                <svg className="h-6 w-6 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-slate-900">Real-time Insights</h4>
              <p className="mt-2 text-slate-600">
                Get instant notifications and real-time dashboards to monitor patient health metrics and intervention
                opportunities.
              </p>
            </Card>

            {/* Feature 5 */}
            <Card className="border border-slate-200 p-8 hover:shadow-lg transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <svg className="h-6 w-6 text-[#0369a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-slate-900">Cost Optimization</h4>
              <p className="mt-2 text-slate-600">
                Reduce operational costs through automation, predictive maintenance, and optimized resource allocation.
              </p>
            </Card>

            {/* Feature 6 */}
            <Card className="border border-slate-200 p-8 hover:shadow-lg transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
                <svg className="h-6 w-6 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-slate-900">24/7 Support</h4>
              <p className="mt-2 text-slate-600">
                Dedicated support team available round-the-clock to assist with implementation, training, and
                troubleshooting.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Role Selection Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white">Choose Your Role</h3>
            <p className="mt-4 text-xl text-slate-300">
              Get started with our specialized solutions for your organization
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Hospital Card */}
            <Card className="border-2 border-[#0369a1] bg-gradient-to-br from-blue-50 to-cyan-50 p-8 shadow-xl hover:shadow-2xl transition-all">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#0369a1]">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-[#0369a1]">Hospital Management</h3>
              <p className="mt-4 text-slate-700 leading-relaxed">
                Comprehensive solution for managing patient consultations, diabetes screening programs, and clinical
                workflows. Streamline your operations and improve patient care delivery.
              </p>
              <div className="mt-8 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-[#0369a1] font-bold">✓</span>
                  <span className="text-slate-700">Consultant Management & Scheduling</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#0369a1] font-bold">✓</span>
                  <span className="text-slate-700">Patient Consultation Tracking</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#0369a1] font-bold">✓</span>
                  <span className="text-slate-700">Diabetes Risk Assessment</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#0369a1] font-bold">✓</span>
                  <span className="text-slate-700">Integrated Lab Request Management</span>
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <Link href="/hospital/login" className="flex-1">
                  <Button style={{ backgroundColor: "#0369a1" }} className="w-full text-white hover:opacity-90">
                    Hospital Login
                  </Button>
                </Link>
                <Link href="/hospital/signup" className="flex-1">
                  <Button
                    variant="outline"
                    style={{ borderColor: "#0369a1", color: "#0369a1" }}
                    className="w-full bg-white"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Lab Card */}
            <Card className="border-2 border-[#059669] bg-gradient-to-br from-emerald-50 to-teal-50 p-8 shadow-xl hover:shadow-2xl transition-all">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#059669]">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-[#059669]">Laboratory Management</h3>
              <p className="mt-4 text-slate-700 leading-relaxed">
                Advanced lab management system for handling test requests, sample processing, report generation, and
                quality assurance. Optimize your laboratory operations.
              </p>
              <div className="mt-8 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-[#059669] font-bold">✓</span>
                  <span className="text-slate-700">Test Request Management</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#059669] font-bold">✓</span>
                  <span className="text-slate-700">Sample Tracking & Processing</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#059669] font-bold">✓</span>
                  <span className="text-slate-700">Automated Report Generation</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#059669] font-bold">✓</span>
                  <span className="text-slate-700">Quality Control & Compliance</span>
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <Link href="/lab/login" className="flex-1">
                  <Button style={{ backgroundColor: "#059669" }} className="w-full text-white hover:opacity-90">
                    Lab Login
                  </Button>
                </Link>
                <Link href="/lab/signup" className="flex-1">
                  <Button
                    variant="outline"
                    style={{ borderColor: "#059669", color: "#059669" }}
                    className="w-full bg-white"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-slate-50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-slate-900">Why Choose Our Platform?</h3>
            <p className="mt-4 text-xl text-slate-600">Proven benefits for healthcare organizations</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#0369a1] text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Improved Accuracy</h4>
                <p className="mt-2 text-slate-600">
                  AI-powered predictions with 95%+ accuracy rate for diabetes risk assessment
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#059669] text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Time Savings</h4>
                <p className="mt-2 text-slate-600">
                  Reduce administrative burden by 60% with automated workflows and reporting
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#0369a1] text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Better Outcomes</h4>
                <p className="mt-2 text-slate-600">
                  Early detection and intervention leading to improved patient health outcomes
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#059669] text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Cost Reduction</h4>
                <p className="mt-2 text-slate-600">
                  Lower operational costs through automation and optimized resource management
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#0369a1] text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Compliance Ready</h4>
                <p className="mt-2 text-slate-600">
                  HIPAA, GDPR, and other regulatory compliance built-in from the ground up
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#059669] text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Scalability</h4>
                <p className="mt-2 text-slate-600">
                  Grows with your organization from small clinics to large hospital networks
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="px-4 py-20 sm:px-6 lg:px-8 bg-slate-50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-slate-900">Get in Touch</h3>
            <p className="mt-4 text-xl text-slate-600">Have questions? We'd love to hear from you</p>
          </div>

          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Info */}
            <div className="space-y-6">
              <div>
                <h4 className="text-2xl font-bold text-slate-900 mb-4">Let's Talk</h4>
                <p className="text-slate-600 leading-relaxed">
                  Whether you're a hospital administrator looking to improve patient care, or a laboratory manager seeking
                  better workflow management, we're here to help.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                      <svg className="h-6 w-6 text-[#0369a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">Email</h5>
                    <p className="text-slate-600">hassanjamalbukhari@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
                      <svg className="h-6 w-6 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">Response Time</h5>
                    <p className="text-slate-600">We typically respond within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <Card className="p-8 border-2 border-slate-200">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                      Name *
                    </label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      className="border-slate-300"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                      Email *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your.email@example.com"
                      className="border-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 mb-2">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="What's this about?"
                    className="border-slate-300"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us how we can help you..."
                    className="border-slate-300 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#0369a1] to-[#059669] text-white hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#0369a1] to-[#059669] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h3 className="text-4xl font-bold text-white">Ready to Transform Your Healthcare Delivery?</h3>
          <p className="mt-6 text-xl text-blue-100">
            Join hundreds of healthcare organizations already using our platform to improve patient outcomes and
            streamline operations.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row justify-center">
            <Link href="/hospital/signup">
              <Button size="lg" className="w-full sm:w-auto bg-white text-[#0369a1] hover:bg-slate-100">
                Get Started as Hospital
              </Button>
            </Link>
            <Link href="/lab/signup">
              <Button size="lg" className="w-full sm:w-auto bg-white text-[#059669] hover:bg-slate-100">
                Get Started as Laboratory
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-900 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <LogoSmall />
                <h4 className="text-lg font-bold text-white">DiabetesGuard</h4>
              </div>
              <p className="mt-2 text-slate-400">AI-Powered Diabetes Prediction & Management System</p>
              <p className="mt-4 text-slate-500 text-sm">
                Transforming healthcare through intelligent diabetes prediction and comprehensive patient management.
              </p>
            </div>
            <div>
              <h5 className="font-bold text-white">Product</h5>
              <ul className="mt-4 space-y-2 text-slate-400">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <Link href="/hospital/signup" className="hover:text-white transition-colors">
                    For Hospitals
                  </Link>
                </li>
                <li>
                  <Link href="/lab/signup" className="hover:text-white transition-colors">
                    For Laboratories
                  </Link>
                </li>
                <li>
                  <a href="#security" className="hover:text-white transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-white">Company</h5>
              <ul className="mt-4 space-y-2 text-slate-400">
                <li>
                  <Link href="#about" className="hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <a href="mailto:hassanjamalbukhari@gmail.com" className="hover:text-white transition-colors">
                    Support
                  </a>
                </li>
                <li>
                  <Link href="/hospital/login" className="hover:text-white transition-colors">
                    Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-white">Resources</h5>
              <ul className="mt-4 space-y-2 text-slate-400">
                <li>
                  <a href="https://www.diabetes.org.uk" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    Diabetes Resources
                  </a>
                </li>
                <li>
                  <a href="https://www.who.int/health-topics/diabetes" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    WHO Guidelines
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API Reference
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-slate-400">
            <p>&copy; 2025 DiabetesGuard. All rights reserved. | AI-Powered Diabetes Management</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
