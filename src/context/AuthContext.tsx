'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'

interface User {
  id: number
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (data: any) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser({ id: payload.id, email: payload.email, role: payload.role })
      } catch (error) {
        localStorage.removeItem('token')
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (data: any) => {
    localStorage.setItem('token', data.token)
    setUser({ id: data.user.id, email: data.user.email, role: data.user.role })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setUser(null)
    router.push('/login')
  }, [router])

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
