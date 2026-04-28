import React, { useState, useEffect } from 'react'

interface DocumentStatus {
  total: number
  approved: number
  pending: number
  rejected: number
  allApproved: boolean
}

interface InterviewSchedulerProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

// Format date to yyyy-MM-ddTHH:mm format for datetime-local input
const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export const InterviewScheduler: React.FC<InterviewSchedulerProps> = ({
  onSuccess,
  onError,
}) => {
  const [canSchedule, setCanSchedule] = useState(false)
  const [documentsStatus, setDocumentsStatus] = useState<DocumentStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scheduling, setScheduling] = useState(false)
  
  // Set default date to tomorrow at current time
  const getDefaultDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return formatDateForInput(tomorrow)
  }
  
  const [formData, setFormData] = useState({
    scheduled_at: getDefaultDate(),
    type: 'video',
    mode: 'online',
    notes: '',
  })

  // Check eligibility on mount
  useEffect(() => {
    checkEligibility()
  }, [])

  const checkEligibility = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      const res = await fetch('/api/interview/schedule', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Failed to check eligibility')
      }

      setCanSchedule(data.canScheduleInterview)
      setDocumentsStatus(data.documentStats)
    } catch (err: any) {
      console.error('Error checking eligibility:', err)
      setError(err.message)
      onError?.(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canSchedule) {
      setError('You must complete all document reviews first')
      return
    }

    try {
      setScheduling(true)
      const token = localStorage.getItem('token')

      const res = await fetch('/api/interview/schedule', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.status === 403 && data.blocking) {
        setError(data.message)
        onError?.(data.message)
        return
      }

      if (!res.ok) {
        throw new Error(data.message || 'Failed to schedule interview')
      }

      setError(null)
      onSuccess?.()

      // Reset form
      setFormData({
        scheduled_at: getDefaultDate(),
        type: 'video',
        mode: 'online',
        notes: '',
      })
    } catch (err: any) {
      console.error('Error scheduling interview:', err)
      setError(err.message)
      onError?.(err.message)
    } finally {
      setScheduling(false)
    }
  }

  if (loading) {
    return <div className="p-4 text-center">Loading interview eligibility...</div>
  }

  // Case 1: Cannot schedule - show why
  if (!canSchedule) {
    return (
      <div className="max-w-md mx-auto p-6 border border-yellow-300 bg-yellow-50 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-4">
          ⚠️ Cannot Schedule Interview Yet
        </h3>

        <p className="text-yellow-700 mb-4">
          Please wait for all documents to be approved before scheduling an interview.
        </p>

        {documentsStatus && (
          <div className="bg-white p-3 rounded mb-4 space-y-2">
            <div className="text-sm">
              <span className="font-semibold">Status:</span> {documentsStatus.approved}/
              {documentsStatus.total} approved
            </div>

            {documentsStatus.pending > 0 && (
              <div className="text-sm text-yellow-700">
                ⏳ Pending: {documentsStatus.pending} documents awaiting review
              </div>
            )}

            {documentsStatus.rejected > 0 && (
              <div className="text-sm text-red-700">
                ❌ Rejected: {documentsStatus.rejected} documents need resubmission
              </div>
            )}
          </div>
        )}

        <button
          disabled
          className="w-full py-2 px-4 bg-gray-300 text-gray-600 rounded font-semibold cursor-not-allowed"
        >
          Schedule Interview (Complete Documents First)
        </button>

        {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
      </div>
    )
  }

  // Case 2: Can schedule - show form
  return (
    <div className="max-w-md mx-auto p-6 border border-green-300 bg-green-50 rounded-lg">
      <h3 className="text-lg font-semibold text-green-800 mb-4">
        ✅ All Documents Approved - Schedule Your Interview
      </h3>

      <form onSubmit={handleSchedule} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Interview Date & Time
          </label>
          <input
            type="datetime-local"
            name="scheduled_at"
            required
            min={formatDateForInput(new Date())}
            value={formData.scheduled_at}
            onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Interview Type
          </label>
          <select
            name="type"
            required
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="video">Video Interview</option>
            <option value="voice_ai">AI Voice Interview</option>
            <option value="in_person">In-Person</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Mode</label>
          <select
            name="mode"
            required
            value={formData.mode}
            onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="online">Online</option>
            <option value="in_person">In-Person</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            name="notes"
            placeholder="Any notes for the interviewer..."
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>

        <button
          type="submit"
          disabled={scheduling}
          className="w-full py-2 px-4 bg-green-600 text-white rounded font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {scheduling ? 'Scheduling...' : 'Schedule Interview'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>
      )}
    </div>
  )
}

export default InterviewScheduler
