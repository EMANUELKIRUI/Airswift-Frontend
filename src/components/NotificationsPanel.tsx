import React from 'react'
import { Bell, X } from 'lucide-react'

interface Notification {
  id: string
  type: 'document' | 'interview' | 'application' | 'system'
  message: string
  read: boolean
  createdAt: string
}

interface NotificationsPanelProps {
  notifications: Notification[]
  onClear?: () => void
  onMarkAsRead?: (id: string) => void
  className?: string
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  notifications = [],
  onClear,
  onMarkAsRead,
  className = '',
}) => {
  const unreadCount = notifications.filter(n => !n.read).length
  const recentNotifications = notifications.slice(0, 5)

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'document':
        return 'bg-blue-50 border-l-4 border-blue-500'
      case 'interview':
        return 'bg-green-50 border-l-4 border-green-500'
      case 'application':
        return 'bg-purple-50 border-l-4 border-purple-500'
      default:
        return 'bg-gray-50 border-l-4 border-gray-500'
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'document':
        return '📄'
      case 'interview':
        return '🎤'
      case 'application':
        return '📝'
      default:
        return '📢'
    }
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="w-6 h-6 text-blue-600" />
          Notifications
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </h2>
        {onClear && notifications.length > 0 && (
          <button
            onClick={onClear}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {recentNotifications.length === 0 ? (
        <div className="text-center py-8">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentNotifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${getNotificationColor(
                notification.type
              )} ${!notification.read ? 'opacity-100' : 'opacity-75'}`}
              onClick={() => onMarkAsRead?.(notification.id)}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">{notification.message}</p>
                  <p className="text-xs text-gray-600 mt-1">{formatDate(notification.createdAt)}</p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-1 flex-shrink-0"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default NotificationsPanel
