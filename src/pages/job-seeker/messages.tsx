import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import DashboardLayout from '@/layouts/DashboardLayout'
import Loader from '@/components/Loader'
import { MessageSquare } from 'lucide-react'

export default function MessagesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!user) router.push('/login')
    if (user?.role?.toLowerCase() !== 'user' && user?.role?.toLowerCase() !== 'job-seeker') {
      router.push('/unauthorized')
    }
  }, [user, isLoading, router])

  if (isLoading) return <Loader fullScreen />

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <MessageSquare className="w-16 h-16 mx-auto text-blue-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">💬 Messages</h1>
            <p className="text-gray-600">
              Direct messaging system coming soon. You'll receive updates about your applications here.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900">Inbox</h3>
                <p className="text-2xl font-bold text-blue-600 mt-2">0</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900">Sent</h3>
                <p className="text-2xl font-bold text-purple-600 mt-2">0</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900">Unread</h3>
                <p className="text-2xl font-bold text-green-600 mt-2">0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
