import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
  role?: 'admin' | 'user'
}

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login')
        return
      }

      if (role && user?.role !== role) {
        router.push('/unauthorized')
        return
      }

      setIsAuthorized(true)
    }
  }, [isLoading, isAuthenticated, user, role, router])

  if (isLoading) {
    return <div className="text-center mt-10">Loading...</div>
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}

export default ProtectedRoute
