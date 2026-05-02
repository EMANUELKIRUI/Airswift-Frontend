/**
 * User Dashboard Socket Integration
 * Real-time updates for job seekers
 */

import toast from 'react-hot-toast'
import { getSocket } from '@/services/socket'
import { formatDateTime } from '@/utils/helpers'
import { getStatusLabel } from '@/utils/statusColors'

/**
 * 🔥 Setup Real-Time Application Updates for Users
 * Call this in your user dashboard
 */
export const setupUserSocketListeners = (callbacks: {
  onApplicationUpdated?: (data: any) => void
  onInterviewScheduled?: (data: any) => void
  onPaymentSuccess?: (data: any) => void
  onStatusChanged?: (data: any) => void
}) => {
  const activeSocket = getSocket()
  if (!activeSocket || !activeSocket.connected) {
    console.warn('⚠️ Socket not connected, skipping user listeners setup')
    return
  }

  console.log('📡 Setting up user socket listeners...')

  // 📩 Application Status Updated
  activeSocket.on('applicationUpdated', (data) => {
    console.log('🔥 Application Updated:', data)
    toast.success(`Your application status: ${getStatusLabel(data.status || 'pending')}`, {
      duration: 5000,
      icon: '📩',
    })
    callbacks.onApplicationUpdated?.(data)
  })

  // 📅 Interview Scheduled
  activeSocket.on('interviewScheduled', (data) => {
    console.log('🔥 Interview Scheduled:', data)
    toast.success(`Interview scheduled for ${formatDateTime(data.interviewDate)}`, {
      duration: 5000,
      icon: '📅',
    })
    callbacks.onInterviewScheduled?.(data)
  })

  // 💰 Payment Received
  activeSocket.on('paymentSuccess', (data) => {
    console.log('🔥 Payment Success:', data)
    toast.success('💰 Payment processed! Visa processing started.', {
      duration: 5000,
      icon: '✅',
    })
    callbacks.onPaymentSuccess?.(data)
  })

  // 🎯 Status Changed (Alternative event)
  activeSocket.on('statusChanged', (data: any) => {
    console.log('🔥 Status Changed:', data)
    const statusKey = data.status?.toLowerCase()
    const statusIconMap = {
      pending: '⏳',
      reviewed: '👀',
      shortlisted: '✨',
      interview_scheduled: '📞',
      interview_completed: '✅',
      rejected: '❌',
      offer_made: '🎉',
      visa_ready: '🛫',
    } as const
    const statusIcon = statusIconMap[statusKey as keyof typeof statusIconMap] || '📝'

    toast.success(
      `${getStatusLabel(data.status)} - ${data.message || 'Status updated'}`,
      {
        duration: 5000,
        icon: statusIcon,
      }
    )
    callbacks.onStatusChanged?.(data)
  })

  // 🔔 General Notification
  activeSocket.on('notification', (data: any) => {
    console.log('🔔 Notification:', data)
    if (data.type === 'success') {
      toast.success(data.message, { duration: 4000 })
    } else if (data.type === 'error') {
      toast.error(data.message, { duration: 4000 })
    } else {
      toast(data.message, { duration: 4000 })
    }
    callbacks.onApplicationUpdated?.(data)
  })

  console.log('✅ User socket listeners setup complete')
}

/**
 * 🧹 Cleanup Socket Listeners
 */
export const cleanupUserSocketListeners = () => {
  const activeSocket = getSocket()
  if (!activeSocket) return

  console.log('🧹 Cleaning up user socket listeners...')
  activeSocket.off('applicationUpdated')
  activeSocket.off('interviewScheduled')
  activeSocket.off('paymentSuccess')
  activeSocket.off('statusChanged')
  activeSocket.off('notification')
}

/**
 * 📤 Emit Events from User Dashboard
 */
export const emitUserEvent = (event: string, data: any) => {
  const activeSocket = getSocket()
  if (!activeSocket || !activeSocket.connected) {
    console.warn('⚠️ Socket not connected')
    return
  }
  activeSocket.emit(event, data)
}
