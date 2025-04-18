"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

interface AuthContextType {
  isAuthenticated: boolean
  login: (password: string) => Promise<boolean>
  logout: () => void
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
  changePassword: async () => false,
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is already authenticated
    const auth = localStorage.getItem("auth")
    if (auth === "true") {
      setIsAuthenticated(true)
    }
  }, [])

  const login = async (password: string): Promise<boolean> => {
    // In a real app, this would call an API to verify the password
    // For now, we'll just check against the default password
    const defaultPassword = "111999" // This would come from settings.json in a real app

    if (password === defaultPassword) {
      localStorage.setItem("auth", "true")
      setIsAuthenticated(true)
      return true
    }

    return false
  }

  const logout = () => {
    localStorage.removeItem("auth")
    setIsAuthenticated(false)
  }

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    // In a real app, this would call an API to change the password
    // For now, we'll just check against the default password
    const defaultPassword = "111999" // This would come from settings.json in a real app

    if (currentPassword === defaultPassword) {
      // In a real app, this would update the password in settings.json
      // For now, we'll just pretend it worked
      return true
    }

    return false
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, changePassword }}>{children}</AuthContext.Provider>
  )
}
