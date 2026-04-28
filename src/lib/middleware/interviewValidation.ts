// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import Document from '@/lib/models/Document'
import User from '@/lib/models/User'

/**
 * Middleware: Check if user has all documents approved before allowing interview scheduling
 * 
 * Usage:
 * router.post('/schedule', verifyToken, checkDocumentsComplete, scheduleInterview)
 */
export const checkDocumentsComplete = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: any
) => {
  try {
    await connectDB()

    // Get userId from request (set by auth middleware)
    const userId = (req as any).user?.id || (req as any).userId

    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' })
    }

    // Fetch all documents for this user
    const documents = await (Document as any)
      .find({ userId })
      .select('status type rejectionReason')
      .lean()

    // Check if documents exist
    if (!documents || documents.length === 0) {
      return res.status(403).json({
        message: 'No documents found. Please upload all required documents first.',
        blocking: true,
        documentsStatus: {
          total: 0,
          approved: 0,
          pending: 0,
          rejected: 0,
        },
        documentsRequired: ['passport', 'cv', 'certificate'],
      })
    }

    // Count documents by status
    const approved = documents.filter((d: any) => d.status === 'approved').length
    const pending = documents.filter((d: any) => d.status === 'pending').length
    const rejected = documents.filter((d: any) => d.status === 'rejected').length
    const total = documents.length

    // Check if all documents are approved
    const allApproved = documents.every((d: any) => d.status === 'approved')

    if (!allApproved) {
      // Get list of pending/rejected documents for detailed response
      const pendingDocuments = documents
        .filter((d: any) => d.status !== 'approved')
        .map((d: any) => ({
          id: d._id?.toString?.() || d._id,
          type: d.type,
          status: d.status,
          rejectionReason: d.rejectionReason || null,
        }))

      return res.status(403).json({
        message: 'Cannot schedule interview. Complete all document reviews first.',
        blocking: true,
        documentsStatus: {
          total,
          approved,
          pending,
          rejected,
        },
        pendingDocuments,
      })
    }

    // All documents approved - allow to proceed
    // Attach document info to request for use in handler
    ;(req as any).documentsComplete = true
    ;(req as any).documentsStatus = {
      total,
      approved,
      pending,
      rejected,
    }

    // Continue to next middleware/handler
    return next()
  } catch (error: any) {
    console.error('Error checking documents:', error)
    return res.status(500).json({
      message: 'Error checking document status',
      error: error.message,
    })
  }
}

/**
 * Middleware: Validate interview parameters
 * 
 * Validates:
 * - scheduled_at is in the future
 * - type is valid (video, voice_ai, in_person)
 * - mode is valid (online, in_person, hybrid)
 */
export const validateInterviewParams = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: any
) => {
  try {
    const { scheduled_at, type, mode } = req.body

    // Required fields
    if (!scheduled_at) {
      return res.status(400).json({
        message: 'Interview date (scheduled_at) is required',
      })
    }

    // Validate type
    const validTypes = ['video', 'voice_ai', 'in_person']
    if (type && !validTypes.includes(type)) {
      return res.status(400).json({
        message: `Invalid interview type. Must be one of: ${validTypes.join(', ')}`,
      })
    }

    // Validate mode
    const validModes = ['online', 'in_person', 'hybrid']
    if (mode && !validModes.includes(mode)) {
      return res.status(400).json({
        message: `Invalid mode. Must be one of: ${validModes.join(', ')}`,
      })
    }

    // Check date is in future
    const scheduledDate = new Date(scheduled_at)
    if (scheduledDate <= new Date()) {
      return res.status(400).json({
        message: 'Interview date must be in the future',
      })
    }

    return next()
  } catch (error: any) {
    return res.status(400).json({
      message: 'Invalid interview parameters',
      error: error.message,
    })
  }
}

/**
 * Middleware: Log interview activity
 * 
 * Logs when interviews are scheduled, rescheduled, cancelled, etc.
 */
export const logInterviewActivity = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: any
) => {
  try {
    // This middleware just lets requests pass through but can be extended
    // to log activity after response is sent
    const originalJson = res.json.bind(res)

    res.json = function (data: any) {
      // Log after successful response
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log('[Interview Activity]', {
          userId: (req as any).user?.id,
          action: req.method === 'POST' ? 'interview_scheduled' : 'interview_updated',
          timestamp: new Date().toISOString(),
        })
      }
      return originalJson(data)
    }

    return next()
  } catch (error: any) {
    return next()
  }
}

/**
 * Middleware: Get interview eligibility status
 * 
 * Returns document status and whether user can proceed to interview
 */
export const getInterviewEligibility = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    await connectDB()
    const userId = (req as any).user?.id || (req as any).userId

    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' })
    }

    const documents = await (Document as any)
      .find({ userId })
      .select('status')
      .lean()

    const approved = documents.filter((d: any) => d.status === 'approved').length
    const pending = documents.filter((d: any) => d.status === 'pending').length
    const rejected = documents.filter((d: any) => d.status === 'rejected').length
    const total = documents.length

    const canProceedToInterview = total > 0 && documents.every((d: any) => d.status === 'approved')

    return res.status(200).json({
      canProceedToInterview,
      documentsStatus: {
        total,
        approved,
        pending,
        rejected,
        allApproved: canProceedToInterview,
      },
    })
  } catch (error: any) {
    console.error('Error getting interview eligibility:', error)
    return res.status(500).json({
      message: 'Error checking interview eligibility',
      error: error.message,
    })
  }
}
