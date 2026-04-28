import React from 'react'
import { FileText, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react'

interface Document {
  type: string
  status: 'pending' | 'approved' | 'rejected' | 'under_review'
  name?: string
  rejectionReason?: string
}

interface DocumentChecklistProps {
  documents: Document[]
  className?: string
}

const DocumentChecklist: React.FC<DocumentChecklistProps> = ({
  documents = [],
  className = '',
}) => {
  const getStatusIcon = (status: string) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600'
      case 'rejected':
        return 'text-red-600'
      case 'under_review':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50'
      case 'rejected':
        return 'bg-red-50'
      case 'under_review':
        return 'bg-yellow-50'
      default:
        return 'bg-gray-50'
    }
  }

  const formatDocumentType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {documents.map(doc => (
        <div
          key={doc.type}
          className={`flex items-center justify-between p-4 rounded-lg border ${getStatusBgColor(
            doc.status
          )} border-gray-200`}
        >
          <div className="flex items-center gap-3 flex-1">
            <FileText className="w-5 h-5 text-gray-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900">{doc.name || formatDocumentType(doc.type)}</p>
              {doc.status === 'rejected' && doc.rejectionReason && (
                <p className="text-xs text-red-600 mt-1">Reason: {doc.rejectionReason}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-2">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${getStatusColor(doc.status)}`}>
              {doc.status.replace('_', ' ')}
            </span>
            {getStatusIcon(doc.status)}
          </div>
        </div>
      ))}
    </div>
  )
}

export default DocumentChecklist
