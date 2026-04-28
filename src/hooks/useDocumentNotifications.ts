import { useEffect, useCallback } from 'react'
import socket from '@/services/socket'
import toast from 'react-hot-toast'

interface DocumentNotification {
  documentId: string
  type: string
  status: 'approved' | 'rejected' | 'pending' | 'under_review'
  message: string
  rejectionReason?: string
}

interface UseDocumentNotificationsOptions {
  onApproved?: (data: DocumentNotification) => void
  onRejected?: (data: DocumentNotification) => void
  onStatusChanged?: (data: DocumentNotification) => void
  autoRefresh?: boolean
}

/**
 * Hook for listening to real-time document notifications via WebSocket
 * Handles document approval, rejection, and status changes
 */
export const useDocumentNotifications = (options: UseDocumentNotificationsOptions = {}) => {
  const {
    onApproved,
    onRejected,
    onStatusChanged,
    autoRefresh = true,
  } = options

  const handleDocumentApproved = useCallback((data: DocumentNotification) => {
    toast.success(data.message || '✅ Document approved!')
    onApproved?.(data)
  }, [onApproved])

  const handleDocumentRejected = useCallback((data: DocumentNotification) => {
    toast.error(data.rejectionReason || data.message || '❌ Document rejected')
    onRejected?.(data)
  }, [onRejected])

  const handleDocumentStatusChanged = useCallback((data: DocumentNotification) => {
    const statusMessages: Record<string, string> = {
      'under_review': '⏳ Document is under review',
      'approved': '✅ Document approved!',
      'rejected': '❌ Document rejected',
      'pending': '📤 Document pending review',
    }
    
    toast.info(statusMessages[data.status] || data.message)
    onStatusChanged?.(data)
  }, [onStatusChanged])

  useEffect(() => {
    if (!socket) return

    // Listen for document approved event
    socket.on('document:approved', handleDocumentApproved)
    
    // Listen for document rejected event
    socket.on('document:rejected', handleDocumentRejected)
    
    // Listen for status changes
    socket.on('document:status_changed', handleDocumentStatusChanged)
    
    // Generic notification event
    socket.on('notification', (data: any) => {
      if (data.type?.includes('document')) {
        handleDocumentStatusChanged(data)
      }
    })

    return () => {
      socket.off('document:approved', handleDocumentApproved)
      socket.off('document:rejected', handleDocumentRejected)
      socket.off('document:status_changed', handleDocumentStatusChanged)
      socket.off('notification')
    }
  }, [handleDocumentApproved, handleDocumentRejected, handleDocumentStatusChanged])

  return {
    documentNotifications: true,
  }
}

export default useDocumentNotifications
