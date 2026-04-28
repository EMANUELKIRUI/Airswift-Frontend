import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Bell,
  Activity,
  TrendingUp,
  ChevronRight,
  Download,
} from 'lucide-react'
import API from '@/services/apiClient'
import { motion } from 'framer-motion'

interface Document {
  _id: string
  type: string
  status: 'pending' | 'approved' | 'rejected' | 'under_review'
  uploadedAt: string
  rejectionReason?: string
}

interface Interview {
  _id: string
  jobTitle: string
  company: string
  date: string
  type: string
  link?: string
}

interface Application {
  _id: string
  status: string
  jobTitle: string
  company: string
}

interface Notification {
  _id: string
  type: string
  message: string
  read: boolean
  createdAt: string
}

export default function EnhancedDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    submitted: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    interviewsScheduled: 0,
    applicationsCount: 0,
    completionPercentage: 0,
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [docsRes, applicationsRes, interviewsRes, notificationsRes] = await Promise.all([
        API.get('/documents').catch(() => ({ data: [] })),
        API.get('/applications/my').catch(() => ({ data: [] })),
        API.get('/interviews/my').catch(() => ({ data: [] })),
        API.get('/notifications').catch(() => ({ data: [] })),
      ])

      const allDocuments = Array.isArray(docsRes.data) ? docsRes.data : docsRes.data?.documents || []
      const allApplications = Array.isArray(applicationsRes.data)
        ? applicationsRes.data
        : applicationsRes.data?.applications || []
      const allInterviews = Array.isArray(interviewsRes.data)
        ? interviewsRes.data
        : interviewsRes.data?.interviews || []
      const allNotifications = Array.isArray(notificationsRes.data)
        ? notificationsRes.data
        : notificationsRes.data?.notifications || []

      setDocuments(allDocuments)
      setApplications(allApplications)
      setInterviews(allInterviews)
      setNotifications(allNotifications)

      // Calculate stats
      const submitted = allDocuments.length
      const pending = allDocuments.filter(d => d.status === 'pending').length
      const approved = allDocuments.filter(d => d.status === 'approved').length
      const rejected = allDocuments.filter(d => d.status === 'rejected').length
      const completionPercentage = submitted > 0 ? (approved / 5) * 100 : 0

      setStats({
        submitted,
        pending,
        approved,
        rejected,
        interviewsScheduled: allInterviews.length,
        applicationsCount: allApplications.length,
        completionPercentage: Math.min(completionPercentage, 100),
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'under_review':
        return <Clock className="w-5 h-5 text-yellow-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />
    }
  }

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 border-green-200'
      case 'rejected':
        return 'bg-red-50 border-red-200'
      case 'under_review':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-semibold'
    switch (status) {
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'under_review':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'pending':
        return `${baseClasses} bg-blue-100 text-blue-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const pendingDocumentsAlert = stats.pending > 0 || stats.rejected > 0

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-gray-600">Loading your dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-blue-600">
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome back, <span className="text-blue-600">{user?.name}</span>
          </h1>
          {pendingDocumentsAlert && (
            <div className="mt-4 flex items-center gap-2 text-yellow-700 bg-yellow-50 rounded-lg px-4 py-3">
              <AlertCircle className="w-5 h-5" />
              <span>
                <strong>{stats.pending + stats.rejected}</strong> pending action(s) - Please check your documents
              </span>
            </div>
          )}
          <p className="text-gray-600 mt-2">Profile: {user?.role || 'User'}</p>
        </div>
      </motion.div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">📄 Documents Submitted</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.submitted}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">⏳ Under Review</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">🎤 Interviews Scheduled</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.interviewsScheduled}</p>
            </div>
            <Calendar className="w-8 h-8 text-green-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">✅ Approved / Rejected</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats.approved}/{stats.rejected}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-200" />
          </div>
        </motion.div>
      </div>

      {/* Completion Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Application Completion Progress
          </h2>
          <span className="text-2xl font-bold text-blue-600">{Math.round(stats.completionPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.completionPercentage}%` }}
            transition={{ delay: 0.6, duration: 1 }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full"
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">{stats.approved} of 5 documents approved</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            Required Documents Status
          </h2>

          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No documents uploaded yet</p>
              <Link href="/job-seeker/documents">
                <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                  Start Uploading Documents
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc._id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 ${getDocumentStatusColor(
                    doc.status
                  )} transition-all hover:shadow-md`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    {getDocumentStatusIcon(doc.status)}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 capitalize">
                        {doc.type.replace(/_/g, ' ')}
                      </p>
                      {doc.rejectionReason && (
                        <p className="text-sm text-red-600">Reason: {doc.rejectionReason}</p>
                      )}
                    </div>
                  </div>
                  <span className={getStatusBadge(doc.status)}>{doc.status.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          )}

          <Link href="/job-seeker/documents">
            <button className="mt-6 w-full bg-blue-50 text-blue-600 px-4 py-3 rounded-lg hover:bg-blue-100 transition font-semibold flex items-center justify-center gap-2">
              <FileText className="w-5 h-5" />
              Manage Documents
              <ChevronRight className="w-4 h-4" />
            </button>
          </Link>
        </motion.div>

        {/* Notifications Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            Notifications
          </h2>

          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No new notifications</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.slice(0, 5).map((notif) => (
                <div
                  key={notif._id}
                  className={`p-3 rounded-lg border-l-4 ${
                    notif.read ? 'bg-gray-50 border-gray-300' : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-900">{notif.type}</p>
                  <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Upcoming Interviews */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mt-8 bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          Upcoming Interviews
        </h2>

        {interviews.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No interviews scheduled yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {interviews.map((interview) => (
              <div
                key={interview._id}
                className="border-2 border-green-200 rounded-lg p-4 bg-green-50 hover:shadow-md transition"
              >
                <p className="font-semibold text-gray-900">{interview.jobTitle}</p>
                <p className="text-sm text-gray-600 mt-1">{interview.company}</p>
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className="w-4 h-4" />
                  {new Date(interview.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                <p className="text-sm text-gray-600 mt-2">Format: {interview.type}</p>
                {interview.link && (
                  <a
                    href={interview.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 block bg-green-600 text-white px-4 py-2 rounded-lg text-center hover:bg-green-700 transition text-sm"
                  >
                    Join Interview
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
