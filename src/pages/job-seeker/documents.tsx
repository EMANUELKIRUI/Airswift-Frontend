import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import DashboardLayout from '@/layouts/DashboardLayout'
import DocumentUploadManager from '@/components/DocumentUploadManager'
import Loader from '@/components/Loader'
import ProgressBar from '@/components/ProgressBar'
import DocumentChecklist from '@/components/DocumentChecklist'
import useDocumentNotifications from '@/hooks/useDocumentNotifications'
import { AlertCircle, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB limit

export default function DocumentsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [interviewsLocked, setInterviewsLocked] = useState(true)

  // 🔒 Guard
  useEffect(() => {
    if (isLoading) return

    if (!user) router.push('/login')
    if (user?.role?.toLowerCase() !== 'user' && user?.role?.toLowerCase() !== 'job-seeker') {
      router.push('/unauthorized')
    }
  }, [user, isLoading, router])

  // 🔔 Setup WebSocket listeners for real-time notifications
  useDocumentNotifications({
    onApproved: useCallback(() => {
      fetchDocuments()
    }, []),
    onRejected: useCallback(() => {
      fetchDocuments()
    }, []),
    onStatusChanged: useCallback(() => {
      fetchDocuments()
    }, []),
  })

  // Fetch documents on component mount
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/documents')
      if (response.ok) {
        const data = await response.json()
        const docs = data.documents || data
        setDocuments(docs)
        
        // Check if all documents are approved to enable interviews
        const allApproved = docs.every((d: any) => d.status === 'approved')
        setInterviewsLocked(!allApproved)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user && !isLoading) {
      fetchDocuments()
    }
  }, [user, isLoading, fetchDocuments])

  // Calculate stats
  const completed = documents.filter((d: any) => d.status === 'approved').length
  const total = documents.length || 5
  const percent = total > 0 ? (completed / total) * 100 : 0
  const pending = documents.filter((d: any) => d.status === 'pending').length

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
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📤 Submit Your Documents</h1>
          <p className="text-gray-600 mt-2">Upload and manage all required documents for your application</p>
        </div>

        {/* Progress Bar */}
        {total > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <ProgressBar
              percentage={percent}
              label="Document Completion Progress"
              color={percent === 100 ? 'green' : percent > 50 ? 'blue' : 'yellow'}
              showPercentage={true}
              className="mb-4"
            />
            <p className="text-sm text-gray-600 mt-2">
              {completed} of {total} documents approved
            </p>
          </div>
        )}

        {/* Missing Documents Alert */}
        {pending > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-800">
                You have <strong>{pending} pending documents</strong> to upload or resubmit
              </p>
            </div>
          </div>
        )}

        {/* Documents Checklist */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="animate-pulse bg-gray-100 h-16 rounded" />
            ))}
          </div>
        ) : documents.length > 0 ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 Document Status</h2>
            <DocumentChecklist documents={documents} />
          </div>
        ) : null}

        {/* Upload Component */}
        <DocumentUploadManager
          onUploadSuccess={() => {
            // Refresh documents after upload
            fetchDocuments()
          }}
        />

        {/* Interview Lock Notice */}
        {interviewsLocked && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-semibold text-red-800">🔒 Interviews Locked</p>
                <p className="text-red-700 text-sm mt-1">
                  Complete all document reviews to unlock interviews. Admin will review your documents and update their status.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* All Approved Success Message */}
        {!interviewsLocked && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="font-semibold text-green-800">All Documents Approved!</p>
                <p className="text-green-700 text-sm mt-1">
                  Your documents have been approved. You can now schedule interviews and view opportunities.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
