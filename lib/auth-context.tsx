"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type User = {
  id: string
  name: string
  email: string
  role: "developer" | "manager"
  image?: string
  team?: string
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string, role: "developer" | "manager") => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Load user from localStorage on client-side
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock user data - in a real app this would come from the API
      let mockUser: User

      if (email === "developer@example.com") {
        mockUser = {
          id: "dev-123",
          name: "John Developer",
          email: "developer@example.com",
          role: "developer",
          team: "frontend",
        }
      } else if (email === "manager@example.com") {
        mockUser = {
          id: "mgr-456",
          name: "Jane Manager",
          email: "manager@example.com",
          role: "manager",
        }
      } else {
        throw new Error("Invalid credentials")
      }

      // Save to state and localStorage
      setUser(mockUser)
      localStorage.setItem("user", JSON.stringify(mockUser))

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string, role: "developer" | "manager") => {
    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Create mock user
      const mockUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        role,
        team: role === "developer" ? "frontend" : undefined,
      }

      // Save to state and localStorage
      setUser(mockUser)
      localStorage.setItem("user", JSON.stringify(mockUser))

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Signup failed:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    router.push("/")
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
