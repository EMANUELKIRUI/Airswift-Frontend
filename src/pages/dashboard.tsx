import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import Loader from '@/components/Loader'

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.replace('/login')
      } else if (user?.role?.toLowerCase() === 'admin') {
        router.replace('/admin/dashboard')
      } else {
        router.replace('/job-seeker/dashboard')
      }
    }
  }, [isAuthenticated, user, isLoading, router])

  return <Loader fullScreen />
}