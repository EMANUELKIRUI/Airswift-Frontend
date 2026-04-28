import API from '@/services/apiClient'

interface DocumentUploadPayload {
  file: File
  type: string
}

interface DocumentResponse {
  _id: string
  userId: string
  type: string
  fileName: string
  fileSize: number
  status: 'pending' | 'approved' | 'rejected' | 'under_review'
  uploadedAt: string
  approvedAt?: string
  rejectionReason?: string
  fileUrl: string
}

export const documentService = {
  /**
   * Upload a single document
   */
  async uploadDocument(file: File, documentType: string): Promise<DocumentResponse> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', documentType)

    try {
      const response = await API.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data?.document || response.data
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to upload document'
      throw new Error(message)
    }
  },

  /**
   * Get all documents for the current user
   */
  async getMyDocuments(): Promise<DocumentResponse[]> {
    try {
      const response = await API.get('/documents')
      return Array.isArray(response.data) ? response.data : response.data?.documents || []
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch documents'
      throw new Error(message)
    }
  },

  /**
   * Get a single document by ID
   */
  async getDocument(documentId: string): Promise<DocumentResponse> {
    try {
      const response = await API.get(`/documents/${documentId}`)
      return response.data
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch document'
      throw new Error(message)
    }
  },

  /**
   * Delete a document
   */
  async deleteDocument(documentId: string): Promise<void> {
    try {
      await API.delete(`/documents/${documentId}`)
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete document'
      throw new Error(message)
    }
  },

  /**
   * Re-upload a rejected document
   */
  async reuploadDocument(file: File, documentType: string): Promise<DocumentResponse> {
    return this.uploadDocument(file, documentType)
  },

  /**
   * Get document statistics
   */
  async getDocumentStats(): Promise<{
    total: number
    approved: number
    pending: number
    rejected: number
    completionPercentage: number
  }> {
    try {
      const documents = await this.getMyDocuments()
      const total = documents.length
      const approved = documents.filter(d => d.status === 'approved').length
      const pending = documents.filter(d => d.status === 'pending').length
      const rejected = documents.filter(d => d.status === 'rejected').length
      const completionPercentage = (approved / 5) * 100

      return {
        total,
        approved,
        pending,
        rejected,
        completionPercentage: Math.min(completionPercentage, 100),
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch document statistics'
      throw new Error(message)
    }
  },

  /**
   * Check if all required documents are approved
   */
  async areAllDocumentsApproved(): Promise<boolean> {
    try {
      const documents = await this.getMyDocuments()
      const approvedCount = documents.filter(d => d.status === 'approved').length
      return approvedCount >= 5 // Assuming 5 required documents
    } catch (error) {
      return false
    }
  },

  /**
   * Download a document
   */
  async downloadDocument(documentId: string, fileName: string): Promise<void> {
    try {
      const response = await API.get(`/documents/${documentId}/download`, {
        responseType: 'blob',
      })

      // Create a URL for the blob and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to download document'
      throw new Error(message)
    }
  },
}
