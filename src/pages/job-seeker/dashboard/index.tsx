'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import DashboardLayout from '@/layouts/DashboardLayout'
import WelcomeCard from '@/components/WelcomeCard'
import StatsCard from '@/components/StatsCard'
import NotificationsPanel from '@/components/NotificationsPanel'
import UpcomingInterviews from '@/components/UpcomingInterviews'
import RecentActivity from '@/components/RecentActivity'
import ProgressBar from '@/components/ProgressBar'
import Loader from '@/components/Loader'

export default function JobSeekerDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // 🔒 Guard
  useEffect(() => {
    if (isLoading) return

    if (!user) router.push('/login')
    if (user?.role?.toLowerCase() !== 'user' && user?.role?.toLowerCase() !== 'job-seeker') {
      router.push('/unauthorized')
    }
  }, [user, isLoading, router])

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/dashboard')
        if (response.ok) {
          const data = await response.json()
          setDashboardData(data)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user && !isLoading) {
      fetchDashboardData()
    }
  }, [user, isLoading])

  if (isLoading || loading) return <Loader fullScreen />

  const stats = dashboardData?.stats || {
    submitted: 0,
    pending: 0,
    interviews: 0,
    approved: 0,
  }

  const sidebarItems = [
    { label: '🏠 Dashboard', href: '/job-seeker/dashboard' },
    { label: '📤 Documents', href: '/job-seeker/documents' },
    { label: '📂 My Applications', href: '/job-seeker/applications' },
    { label: '🎤 Interviews', href: '/job-seeker/interviews' },
    { label: '💬 Messages', href: '/job-seeker/messages' },
    { label: '👤 Profile', href: '/job-seeker/profile' },
    { label: '⚙️ Settings', href: '/job-seeker/settings' },
  ]

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-6">
        {/* Welcome Card */}
        <WelcomeCard userName={user?.name || 'User'} role={user?.role || 'Job Seeker'} />

        {/* 📊 Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Documents Submitted"
            value={stats.submitted}
            icon="📄"
            color="blue"
          />
          <StatsCard
            title="Pending Documents"
            value={stats.pending}
            icon="⏳"
            color="yellow"
          />
          <StatsCard
            title="Interviews"
            value={stats.interviews}
            icon="🎤"
            color="green"
          />
          <StatsCard
            title="Approved"
            value={stats.approved}
            icon="✅"
            color="purple"
          />
        </div>

        {/* ⚠️ Missing Documents Alert */}
        {stats.pending > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
            <p className="text-yellow-800">
              You have <strong>{stats.pending} pending documents</strong> to upload
            </p>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Upcoming Interviews & Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Interviews */}
            <UpcomingInterviews interviews={dashboardData?.interviews || []} />

            {/* Recent Activity */}
            <RecentActivity activities={dashboardData?.activities || []} />
          </div>

          {/* Right Column - Notifications */}
          <NotificationsPanel
            notifications={dashboardData?.notifications || []}
            onMarkAsRead={(id) => {
              // Handle mark as read
              console.log('Marked as read:', id)
            }}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
