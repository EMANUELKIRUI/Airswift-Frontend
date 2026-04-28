import React from 'react'
import { Activity, FileText, CheckCircle, AlertCircle, XCircle, Clock, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface ActivityItem {
  _id: string
  type: 'document' | 'application' | 'interview' | 'status'
  title: string
  description?: string
  status: 'approved' | 'rejected' | 'pending' | 'under_review' | 'success'
  timestamp: string
}

interface RecentActivityProps {
  activities: ActivityItem[]
  className?: string
}

const RecentActivity: React.FC<RecentActivityProps> = ({
  activities = [],
  className = '',
}) => {
  const getActivityIcon = (type: string, status: string) => {
    if (status === 'approved' || status === 'success') {
      return <CheckCircle className="w-5 h-5 text-green-600" />
    } else if (status === 'rejected') {
      return <XCircle className="w-5 h-5 text-red-600" />
    } else if (status === 'pending' || status === 'under_review') {
      return <Clock className="w-5 h-5 text-yellow-600" />
    }
    return <AlertCircle className="w-5 h-5 text-blue-600" />
  }

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'success':
        return 'bg-green-50 border-l-4 border-green-500'
      case 'rejected':
        return 'bg-red-50 border-l-4 border-red-500'
      case 'pending':
      case 'under_review':
        return 'bg-yellow-50 border-l-4 border-yellow-500'
      default:
        return 'bg-blue-50 border-l-4 border-blue-500'
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const recentActivities = activities.slice(0, 6)

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" />
          Recent Activity
        </h2>
        {activities.length > 0 && (
          <Link href="/job-seeker/applications">
            <a className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </a>
          </Link>
        )}
      </div>

      {recentActivities.length === 0 ? (
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ensureArray(recentActivities, []).map(activity => (
            <div
              key={activity._id}
              className={`p-4 rounded-lg transition-all hover:shadow-md ${getActivityColor(activity.status)}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">{getActivityIcon(activity.type, activity.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                      {activity.description && (
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      )}
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ml-2 ${
                      activity.status === 'approved' || activity.status === 'success'
                        ? 'bg-green-100 text-green-800'
                        : activity.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : activity.status === 'pending' || activity.status === 'under_review'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {activity.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">{formatTime(activity.timestamp)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RecentActivity
