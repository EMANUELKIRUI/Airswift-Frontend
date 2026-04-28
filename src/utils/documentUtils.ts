/**
 * Document utility helpers for checking approval status
 * and handling document-related logic
 */

interface DocumentStatus {
  type: string
  status: 'pending' | 'approved' | 'rejected' | 'under_review'
  rejectionReason?: string
}

/**
 * Check if all documents are approved
 * @param documents - Array of document objects
 * @returns true if all documents have 'approved' status
 */
export const areAllDocumentsApproved = (documents: DocumentStatus[]): boolean => {
  if (!documents || documents.length === 0) return false
  return documents.every(doc => doc.status === 'approved')
}

/**
 * Get document completion percentage
 * @param documents - Array of document objects
 * @returns Percentage of approved documents (0-100)
 */
export const getDocumentCompletionPercentage = (documents: DocumentStatus[]): number => {
  if (!documents || documents.length === 0) return 0
  
  const approvedCount = documents.filter(doc => doc.status === 'approved').length
  return Math.round((approvedCount / documents.length) * 100)
}

/**
 * Get document stats
 * @param documents - Array of document objects
 * @returns Object with counts by status
 */
export const getDocumentStats = (documents: DocumentStatus[]) => {
  return {
    total: documents.length,
    approved: documents.filter(d => d.status === 'approved').length,
    pending: documents.filter(d => d.status === 'pending').length,
    rejected: documents.filter(d => d.status === 'rejected').length,
    underReview: documents.filter(d => d.status === 'under_review').length,
  }
}

/**
 * Get rejected documents with reasons
 * @param documents - Array of document objects
 * @returns Array of rejected documents with reasons
 */
export const getRejectedDocuments = (documents: DocumentStatus[]) => {
  return documents
    .filter(d => d.status === 'rejected')
    .map(d => ({
      type: d.type,
      reason: d.rejectionReason || 'No reason provided',
    }))
}

/**
 * Check if user can schedule interviews
 * - All documents must be approved
 * - No rejected documents
 */
export const canScheduleInterviews = (documents: DocumentStatus[]): boolean => {
  return areAllDocumentsApproved(documents)
}

/**
 * Check if user has documents pending action
 */
export const hasPendingAction = (documents: DocumentStatus[]): boolean => {
  return documents.some(
    d => d.status === 'rejected' || d.status === 'pending' || d.status === 'under_review'
  )
}

/**
 * Format document type for display
 * @param type - Document type (e.g., 'passport_copy')
 * @returns Formatted string (e.g., 'Passport Copy')
 */
export const formatDocumentType = (type: string): string => {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Get status badge color
 */
export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'pending': 'bg-gray-100 text-gray-800',
    'under_review': 'bg-yellow-100 text-yellow-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

/**
 * Get status icon
 */
export const getStatusIcon = (status: string): string => {
  const icons: Record<string, string> = {
    'approved': '✅',
    'rejected': '❌',
    'pending': '⏳',
    'under_review': '👀',
  }
  return icons[status] || '📄'
}

export default {
  areAllDocumentsApproved,
  getDocumentCompletionPercentage,
  getDocumentStats,
  getRejectedDocuments,
  canScheduleInterviews,
  hasPendingAction,
  formatDocumentType,
  getStatusColor,
  getStatusIcon,
}
