import React, { useState, useEffect } from 'react'

interface Document {
  _id: string
  type: string
  status: 'pending' | 'approved' | 'rejected'
  uploadedAt: string
  reviewedAt?: string
  rejectionReason?: string
  fileUrl?: string
}

interface DocumentStatusDisplayProps {
  onStatusChange?: () => void
}

export const DocumentStatusDisplay: React.FC<DocumentStatusDisplayProps> = ({
  onStatusChange,
}) => {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDocuments()

    // Optional: Set up interval to refresh every 30 seconds
    const interval = setInterval(fetchDocuments, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      const res = await fetch('/api/documents', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch documents')
      }

      setDocuments(data.documents || [])
      setError(null)
      onStatusChange?.()
    } catch (err: any) {
      console.error('Error fetching documents:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading && documents.length === 0) {
    return <div className="p-4 text-center">Loading documents...</div>
  }

  if (documents.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No documents uploaded yet. Upload documents to proceed.
      </div>
    )
  }

  const approved = documents.filter((d) => d.status === 'approved')
  const pending = documents.filter((d) => d.status === 'pending')
  const rejected = documents.filter((d) => d.status === 'rejected')

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">✓ Approved</span>
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">✗ Rejected</span>
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">⏳ Pending</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-semibold">{status}</span>
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 border border-gray-300 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Document Review Status</h3>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="bg-green-50 p-3 rounded text-center">
          <div className="text-2xl font-bold text-green-700">{approved.length}</div>
          <div className="text-xs text-gray-600">Approved</div>
        </div>
        <div className="bg-yellow-50 p-3 rounded text-center">
          <div className="text-2xl font-bold text-yellow-700">{pending.length}</div>
          <div className="text-xs text-gray-600">Pending</div>
        </div>
        <div className="bg-red-50 p-3 rounded text-center">
          <div className="text-2xl font-bold text-red-700">{rejected.length}</div>
          <div className="text-xs text-gray-600">Rejected</div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
          <span className="text-sm text-gray-600">
            {approved.length} / {documents.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(approved.length / documents.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Document List */}
      <div className="space-y-3">
        {documents.map((doc) => (
          <div key={doc._id} className="border border-gray-200 rounded p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-semibold text-gray-800 capitalize">{doc.type}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                </div>
                {doc.reviewedAt && (
                  <div className="text-xs text-gray-500">
                    Reviewed: {new Date(doc.reviewedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
              <div>{getStatusBadge(doc.status)}</div>
            </div>

            {/* Rejection reason if rejected */}
            {doc.status === 'rejected' && doc.rejectionReason && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                <strong>Rejection Reason:</strong> {doc.rejectionReason}
              </div>
            )}

            {/* Download Button */}
            {doc.fileUrl && (
              <div className="mt-3">
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  View Document
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-2">
        <button
          onClick={fetchDocuments}
          className="flex-1 py-2 px-4 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700"
        >
          Refresh Status
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>
      )}
    </div>
  )
}

export default DocumentStatusDisplay
