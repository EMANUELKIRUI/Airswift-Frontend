import React, { useState, useRef, useEffect } from 'react'
import {
  Upload,
  FileText,
  X,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2,
  RefreshCw,
} from 'lucide-react'
import API from '@/services/apiClient'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

interface DocumentData {
  _id: string
  type: string
  fileName: string
  status: 'pending' | 'approved' | 'rejected' | 'under_review'
  uploadedAt: string
  rejectionReason?: string
}

const REQUIRED_DOCUMENTS = [
  {
    id: 'passport_copy',
    name: 'Passport Copy',
    icon: '📇',
    description: 'Clear copy of your passport',
  },
  {
    id: 'cv_resume',
    name: 'CV / Resume',
    icon: '📄',
    description: 'Your CV or Resume (PDF)',
  },
  {
    id: 'academic_certificates',
    name: 'Academic Certificates',
    icon: '🎓',
    description: 'High school or higher education certificates',
  },
  {
    id: 'cover_letter',
    name: 'Cover Letter',
    icon: '✉️',
    description: 'Your cover letter (optional)',
  },
  {
    id: 'id_photo',
    name: 'ID Photo',
    icon: '📸',
    description: 'Recent passport-style photo',
  },
]

interface DocumentUploadProps {
  onUploadSuccess?: () => void
}

export default function DocumentUpload({ onUploadSuccess }: DocumentUploadProps) {
  const [documents, setDocuments] = useState<DocumentData[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string>('')
  const [dragOverId, setDragOverId] = useState<string>('')
  const fileInputRef = useRef<Record<string, HTMLInputElement>>({})

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await API.get('/documents')
      const allDocs = Array.isArray(response.data) ? response.data : response.data?.documents || []
      setDocuments(allDocs)
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const getDocumentStatus = (docType: string) => {
    return documents.find((d) => d.type === docType)
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    await uploadDocument(files[0], docType)
  }

  const uploadDocument = async (file: File, docType: string) => {
    if (!validateFile(file)) return

    try {
      setUploading(docType)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', docType)

      const response = await API.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const newDoc = response.data?.document || response.data
      setDocuments((prev) => {
        const existing = prev.findIndex((d) => d.type === docType)
        if (existing >= 0) {
          const updated = [...prev]
          updated[existing] = newDoc
          return updated
        }
        return [...prev, newDoc]
      })

      toast.success(`${docType.replace(/_/g, ' ')} uploaded successfully!`)
      onUploadSuccess?.()
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.response?.data?.message || 'Failed to upload document')
    } finally {
      setUploading('')
    }
  }

  const validateFile = (file: File): boolean => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    const maxSize = 2 * 1024 * 1024 // 2MB limit for faster uploads

    if (!allowedTypes.includes(file.type)) {
      toast.error('❌ Only PDF and image files (JPEG, PNG) are allowed')
      return false
    }

    if (file.size > maxSize) {
      const sizeMB = Math.round(file.size / (1024 * 1024) * 10) / 10
      toast.error(`📦 File too large (${sizeMB}MB). Maximum size is 2MB`)
      return false
    }

    if (file.size === 0) {
      toast.error('❌ File is empty')
      return false
    }

    return true
  }

  const handleDelete = async (docId: string, docType: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      await API.delete(`/documents/${docId}`)
      setDocuments((prev) => prev.filter((d) => d._id !== docId))
      toast.success('Document deleted successfully')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete document')
    }
  }

  const handleResubmit = async (docType: string) => {
    fileInputRef.current[docType]?.click()
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = 'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold'
    switch (status) {
      case 'approved':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            <CheckCircle className="w-3 h-3" /> Approved
          </span>
        )
      case 'rejected':
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            <AlertCircle className="w-3 h-3" /> Rejected
          </span>
        )
      case 'under_review':
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            <Clock className="w-3 h-3" /> Under Review
          </span>
        )
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            <Clock className="w-3 h-3" /> Pending
          </span>
        )
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 border-green-200'
      case 'rejected':
        return 'bg-red-50 border-red-200'
      case 'under_review':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100'
    }
  }

  const approvedCount = documents.filter((d) => d.status === 'approved').length
  const completionPercentage = (approvedCount / REQUIRED_DOCUMENTS.length) * 100

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading documents...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-2">📤 Document Management</h1>
        <p className="text-gray-600">Upload and manage your required documents</p>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Upload Progress</h2>
          <span className="text-2xl font-bold text-blue-600">{Math.round(completionPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full"
          />
        </div>
        <p className="text-sm text-gray-600 mt-3">
          {approvedCount} of {REQUIRED_DOCUMENTS.length} documents approved
        </p>
      </motion.div>

      {/* Alerts */}
      {documents.some((d) => d.status === 'rejected') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3"
        >
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800">Rejected Documents</h3>
            <p className="text-sm text-red-700 mt-1">
              Some documents were rejected and need to be resubmitted. Please review the feedback and upload new
              versions.
            </p>
          </div>
        </motion.div>
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {REQUIRED_DOCUMENTS.map((docType, idx) => {
          const uploadedDoc = getDocumentStatus(docType.id)
          const isRejected = uploadedDoc?.status === 'rejected'

          return (
            <motion.div
              key={docType.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              className={`rounded-xl border-2 p-6 transition-all ${getStatusColor(uploadedDoc?.status)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-3xl">{docType.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{docType.name}</h3>
                    <p className="text-sm text-gray-600">{docType.description}</p>
                  </div>
                </div>
                {uploadedDoc && getStatusBadge(uploadedDoc.status)}
              </div>

              {uploadedDoc ? (
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{uploadedDoc.fileName}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(uploadedDoc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {uploadedDoc.status === 'approved' && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </div>

                  {isRejected && uploadedDoc.rejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-red-800 mb-1">Rejection Reason:</p>
                      <p className="text-xs text-red-700">{uploadedDoc.rejectionReason}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {isRejected && (
                      <button
                        onClick={() => handleResubmit(docType.id)}
                        disabled={uploading === docType.id}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                      >
                        <RefreshCw className="w-4 h-4" />
                        {uploading === docType.id ? 'Uploading...' : 'Resubmit'}
                      </button>
                    )}
                    <button
                      onClick={() => uploadedDoc && handleDelete(uploadedDoc._id, docType.id)}
                      className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragOverId(docType.id)
                  }}
                  onDragLeave={() => setDragOverId('')}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragOverId('')
                    const files = e.dataTransfer.files
                    if (files && files.length > 0) {
                      uploadDocument(files[0], docType.id)
                    }
                  }}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                    dragOverId === docType.id
                      ? 'bg-blue-100 border-blue-600'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    {uploading === docType.id ? 'Uploading...' : 'Drag & drop or click to upload'}
                  </p>
                  <p className="text-xs text-gray-600">PDF (max 10MB)</p>

                  <input
                    ref={(el) => {
                      if (el) fileInputRef.current[docType.id] = el
                    }}
                    type="file"
                    onChange={(e) => handleFileSelect(e, docType.id)}
                    disabled={uploading === docType.id}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                  />

                  <button
                    onClick={() => fileInputRef.current[docType.id]?.click()}
                    disabled={uploading === docType.id}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold inline-block transition"
                  >
                    Choose File
                  </button>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Completion Message */}
      {approvedCount === REQUIRED_DOCUMENTS.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-8 text-white text-center"
        >
          <CheckCircle className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">All Documents Approved! 🎉</h2>
          <p className="mb-6">Your application is now complete and eligible for interviews.</p>
          <button
            onClick={() => (window.location.href = '/job-seeker/dashboard')}
            className="bg-white text-green-600 hover:bg-gray-50 px-6 py-3 rounded-lg font-bold transition"
          >
            Go to Dashboard
          </button>
        </motion.div>
      )}
    </div>
  )
}
