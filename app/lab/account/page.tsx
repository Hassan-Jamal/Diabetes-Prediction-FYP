"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import Image from "next/image"

interface LabProfile {
  id: string
  name: string
  email: string
  phone: string | null
  address: string | null
  registration_id: string | null
  profile_image_url: string | null
  created_at: string
  updated_at: string
}

function LabAccountContent() {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState<LabProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchLabProfile()
  }, [])

  const fetchLabProfile = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()

      // Get current user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !authUser) {
        toast.error("Please log in to view your profile")
        return
      }

      // Fetch lab profile
      const { data: labData, error } = await supabase
        .from("labs")
        .select("*")
        .eq("id", authUser.id)
        .single()

      if (error) {
        console.error("Error fetching lab profile:", error)

        // If lab doesn't exist, create one
        if (error.code === "PGRST116") {
          await createLabProfile(authUser.id, authUser.email || "")
          return
        }

        toast.error("Failed to load profile")
        return
      }

      setProfile(labData)
      setFormData({
        phone: labData.phone || "",
        address: labData.address || "",
      })
    } catch (error) {
      console.error("Error in fetchLabProfile:", error)
      toast.error("Failed to load profile")
    } finally {
      setIsLoading(false)
    }
  }

  const createLabProfile = async (userId: string, email: string) => {
    try {
      const supabase = createClient()

      // Create lab profile from user metadata
      const { data: userData } = await supabase.auth.getUser()
      const metadata = userData?.user?.user_metadata || {}

      const { data, error } = await supabase
        .from("labs")
        .insert({
          id: userId,
          name: metadata.organization_name || "Lab",
          email: email,
          phone: metadata.phone || "",
          address: metadata.address || "",
          registration_id: metadata.license_number || "",
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating lab profile:", error)
        toast.error("Failed to create profile")
        return
      }

      setProfile(data)
      setFormData({
        phone: data.phone || "",
        address: data.address || "",
      })
    } catch (error) {
      console.error("Error in createLabProfile:", error)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    setIsUploadingImage(true)
    try {
      const supabase = createClient()

      // Get current user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !authUser) {
        toast.error("Please log in to upload image")
        return
      }

      const fileExt = file.name.split(".").pop()
      const filePath = `labs/${authUser.id}/profile.${fileExt}`

      console.log("[v0] Uploading profile image to:", filePath)

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("lab-profile-images")
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("lab-profile-images")
        .getPublicUrl(filePath)

      console.log("[v0] Public URL:", publicUrlData.publicUrl)

      // Update profile_image_url in database
      const { error: updateError } = await supabase
        .from("labs")
        .update({ profile_image_url: publicUrlData.publicUrl })
        .eq("id", authUser.id)

      if (updateError) {
        console.error("Update error:", updateError)
        throw new Error(`Failed to update profile: ${updateError.message}`)
      }

      toast.success("Profile picture updated successfully!")
      
      // Refetch profile to get updated image URL
      await fetchLabProfile()
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error(error instanceof Error ? error.message : "Failed to upload image")
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSaving(true)
    try {
      const supabase = createClient()

      // Get current user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !authUser) {
        toast.error("Please log in to update your profile")
        return
      }

      // Update lab profile
      const { data, error } = await supabase
        .from("labs")
        .update({
          phone: formData.phone,
          address: formData.address,
          updated_at: new Date().toISOString(),
        })
        .eq("id", authUser.id)
        .select()
        .single()

      if (error) {
        console.error("Error updating profile:", error)
        throw new Error(`Failed to update profile: ${error.message}`)
      }

      setProfile(data)
      toast.success("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-green-100 flex items-center justify-center">
        <Card className="p-8">
          <div className="space-y-3">
            <div className="h-32 w-32 bg-slate-200 rounded-full mx-auto animate-pulse" />
            <div className="h-8 w-48 bg-slate-200 rounded mx-auto animate-pulse" />
            <div className="h-4 w-64 bg-slate-200 rounded mx-auto animate-pulse" />
          </div>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-green-100 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <p className="text-slate-600">Failed to load profile. Please try again.</p>
          <Button onClick={fetchLabProfile} className="mt-4">
            Retry
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-green-100">
      {/* Header */}
      <header className="border-b border-emerald-200/50 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Account Information
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={logout} variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside className="w-64 bg-white/90 backdrop-blur-sm border-r border-emerald-200/50 p-6 sticky top-[80px] h-[calc(100vh-80px)] overflow-y-auto">
          <nav className="space-y-2">
            <Link
              href="/lab/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-emerald-50 font-medium transition-all hover:text-emerald-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home (Dashboard)
            </Link>

            <Link
              href="/lab/requests"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-emerald-50 font-medium transition-all hover:text-emerald-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Requests
            </Link>

            <Link
              href="/lab/tests"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-emerald-50 font-medium transition-all hover:text-emerald-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tests
            </Link>

            <Link
              href="/lab/upload-report"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-emerald-50 font-medium transition-all hover:text-emerald-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Report
            </Link>

            <Link
              href="/lab/account"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold transition-all hover:shadow-lg"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Account Info
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 mx-auto max-w-4xl px-6 py-8 sm:px-6 lg:px-8">
          <Card className="border-2 border-emerald-200/50 bg-white/90 backdrop-blur-sm p-8 shadow-xl">
            {/* Profile Header */}
            <div className="flex flex-col items-center mb-8 pb-8 border-b border-emerald-200">
              {/* Profile Picture */}
              <div className="relative mb-4">
                {profile.profile_image_url ? (
                  <img
                    src={profile.profile_image_url}
                    alt={profile.name}
                    className="h-32 w-32 rounded-full object-cover border-4 border-emerald-200"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white text-4xl font-bold">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
                
                {/* Upload Button Overlay */}
                <div className="absolute bottom-0 right-0">
                  <label htmlFor="profile-image-upload" className="cursor-pointer">
                    <div className="bg-emerald-600 text-white p-2 rounded-full shadow-lg hover:bg-emerald-700 transition-colors">
                      {isUploadingImage ? (
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </div>
                    <input
                      id="profile-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isUploadingImage}
                    />
                  </label>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 mb-2">{profile.name}</h2>
              <p className="text-slate-600">{profile.email}</p>
              <div className="mt-4 flex gap-4 text-sm text-slate-500">
                <span>Member since {new Date(profile.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Lab Name</label>
                  <Input
                    value={profile.name}
                    disabled
                    className="rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                  <Input
                    value={profile.email}
                    disabled
                    className="rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-500"
                  />
                </div>

                {/* Registration ID */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Registration ID</label>
                  <Input
                    value={profile.registration_id || ""}
                    disabled
                    className="rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter phone number"
                    className="rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  {errors.phone && <p className="mt-2 text-sm text-red-500">{errors.phone}</p>}
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter your address"
                  rows={4}
                  className="rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none"
                />
                {errors.address && <p className="mt-2 text-sm text-red-500">{errors.address}</p>}
              </div>

              {/* Save Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white py-6 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </main>
      </div>
    </div>
  )
}

export default function LabAccount() {
  return (
    <ProtectedRoute requiredRole="lab">
      <LabAccountContent />
    </ProtectedRoute>
  )
}

