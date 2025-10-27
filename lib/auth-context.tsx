"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export type UserRole = "hospital" | "lab"

export interface User {
  id: string
  email: string
  name?: string
  role: UserRole
  organizationName: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string, role: UserRole) => Promise<void>
  signup: (data: SignupData) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

export interface SignupData {
  email: string
  password: string
  confirmPassword: string
  role: UserRole
  organizationName: string
  organizationType?: string
  contactPerson?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("[v0] Auth check failed:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Login failed")
      }

      const data = await response.json()
      setUser(data.user)
      localStorage.setItem("user", JSON.stringify(data.user))
      router.push(`/${role}/dashboard`)
    } catch (error) {
      console.error("[v0] Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (data: SignupData) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Signup failed")
      }

      const responseData = await response.json()
      setUser(responseData.user)
      localStorage.setItem("user", JSON.stringify(responseData.user))
      router.push(`/${data.role}/dashboard`)
    } catch (error) {
      console.error("[v0] Signup error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (error) {
      console.error("[v0] Logout error:", error)
    } finally {
      setUser(null)
      localStorage.removeItem("user")
      router.push("/")
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
