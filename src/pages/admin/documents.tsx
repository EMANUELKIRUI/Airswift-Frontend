import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import { CheckCircle, XCircle, Clock, FileText, Download, Send } from 'lucide-react'
import toast from 'react-hot-toast'

interface AdminDocument {
  _id: string
  userId: {
    _id: string
    name: string
    email: string
  }
  type: string
  fileName: string
  status: 'pending' | 'approved' | 'rejected' | 'under_review'
  uploadedAt: string
  rejectionReason?: string
  fileUrl?: string
}

export default function AdminDocumentsReview() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [documents, setDocuments] = useState<AdminDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewing, setReviewing] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState<string>('')
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)

  // 🔒 Admin Guard
  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (user?.role?.toLowerCase() !== 'admin') {
      router.push('/unauthorized')
      return
    }
  }, [user, isLoading, router])

  // Fetch all users' documents
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/documents')
      if (!response.ok) {
        if (response.status === 403) {
          toast.error('Access denied. Admin rights required.')
          router.push('/unauthorized')
          return
        }
        throw new Error('Failed to fetch documents')
      }

      const data = await response.json()
      setDocuments(Array.isArray(data) ? data : data.documents || [])
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    if (user && !isLoading && user?.role?.toLowerCase() === 'admin') {
      fetchDocuments()
    }
  }, [user, isLoading, fetchDocuments])

  // Review document (approve/reject)
  const reviewDocument = useCallback(
    async (docId: string, status: 'approved' | 'rejected', reason?: string) => {
      if (status === 'rejected' && !reason?.trim()) {
        toast.error('Please provide a rejection reason')
        return
      }

      try {
        setReviewing(docId)
        const response = await fetch(`/api/admin/documents/${docId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status,
            rejectionReason: status === 'rejected' ? reason : undefined,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to update document')
        }

        const updatedDoc = await response.json()
        setDocuments(docs =>
          docs.map(d => (d._id === docId ? updatedDoc : d))
        )

        toast.success(
          status === 'approved'
            ? '✅ Document approved successfully'
            : '❌ Document rejected with reason provided'
        )

        setSelectedDocId(null)
        setRejectionReason('')
      } catch (error) {
        console.error('Error reviewing document:', error)
        toast.error('Failed to update document status')
      } finally {
        setReviewing(null)
      }
    },
    []
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'under_review':
        return <Clock className="w-5 h-5 text-yellow-600" />
      default:
        return <FileText className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 border-l-4 border-green-500'
      case 'rejected':
        return 'bg-red-50 border-l-4 border-red-500'
      case 'under_review':
        return 'bg-yellow-50 border-l-4 border-yellow-500'
      default:
        return 'bg-gray-50 border-l-4 border-gray-500'
    }
  }

  const pendingDocs = documents.filter(d => d.status === 'pending')
  const underReviewDocs = documents.filter(d => d.status === 'under_review')
  const approvedDocs = documents.filter(d => d.status === 'approved')
  const rejectedDocs = documents.filter(d => d.status === 'rejected')

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">📋 Document Review Queue</h1>
          <p className="text-gray-600 mt-2">Review and approve/reject user documents</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-500">
            <p className="text-gray-600 text-sm">Pending Review</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{pendingDocs.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <p className="text-gray-600 text-sm">Under Review</p>
            <p className="text-3xl font-bold text-yellow-600 mt-1">{underReviewDocs.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm">Approved</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{approvedDocs.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <p className="text-gray-600 text-sm">Rejected</p>
            <p className="text-3xl font-bold text-red-600 mt-1">{rejectedDocs.length}</p>
          </div>
        </div>

        {/* Documents List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-lg" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No documents to review</p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map(doc => (
              <div
                key={doc._id}
                className={`rounded-lg shadow p-6 ${getStatusColor(doc.status)}`}
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {/* User Info */}
                  <div className="md:col-span-2">
                    <p className="font-semibold text-gray-900">{doc.userId.name}</p>
                    <p className="text-sm text-gray-600">{doc.userId.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-700">{doc.type}</p>
                    </div>
                  </div>

                  {/* Document Info */}
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">File: {doc.fileName}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                    {doc.rejectionReason && (
                      <div className="mt-2 p-2 bg-red-100 rounded">
                        <p className="text-xs text-red-800">
                          <strong>Reason:</strong> {doc.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Status & Actions */}
                  <div className="md:col-span-1 flex flex-col gap-2">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(doc.status)}
                      <span className="text-sm font-semibold capitalize">
                        {doc.status.replace('_', ' ')}
                      </span>
                    </div>

                    {doc.status === 'pending' || doc.status === 'under_review' ? (
                      <>
                        {doc.fileUrl && (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            View
                          </a>
                        )}

                        {/* Rejection Reason Input */}
                        {selectedDocId === doc._id ? (
                          <div className="mt-2 space-y-2">
                            <textarea
                              value={rejectionReason}
                              onChange={e => setRejectionReason(e.target.value)}
                              placeholder="Enter rejection reason..."
                              className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                              rows={3}
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  reviewDocument(doc._id, 'rejected', rejectionReason)
                                  setSelectedDocId(null)
                                }}
                                disabled={reviewing === doc._id}
                                className="flex-1 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-1"
                              >
                                <Send className="w-3 h-3" />
                                Reject
                              </button>
                              <button
                                onClick={() => setSelectedDocId(null)}
                                className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => reviewDocument(doc._id, 'approved')}
                              disabled={reviewing === doc._id}
                              className="flex-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-1"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Approve
                            </button>
                            <button
                              onClick={() => setSelectedDocId(doc._id)}
                              className="flex-1 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                            >
                              <XCircle className="w-3 h-3" />
                              Reject
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-xs text-gray-600">No action available</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export async function getServerSideProps(context: any) {
  const { req } = context
  const token = req.cookies.accessToken

  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  return {
    props: {},
  }
}
