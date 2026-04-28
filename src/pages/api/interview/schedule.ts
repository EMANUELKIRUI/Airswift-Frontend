// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import Interview from '@/lib/models/Interview'
import Application from '@/lib/models/Application'
import User from '@/lib/models/User'
import Document from '@/lib/models/Document'
import Notification from '@/lib/models/Notification'
import jwt from 'jsonwebtoken'
import {
  checkDocumentsComplete,
  validateInterviewParams,
  logInterviewActivity,
} from '@/lib/middleware/interviewValidation'

const JWT_SECRET = process.env.JWT_SECRET || 'change_me'

// Main handler for scheduling interviews
const scheduleInterviewHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    await connectDB()

    const userId = (req as any).userId
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' })
    }

    const { scheduled_at, type, mode, notes, applicationId } = req.body

    // Get user
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Create interview
    const interview = await (Interview as any).create({
      candidateId: userId,
      scheduledAt: new Date(scheduled_at),
      interviewType: type || 'video',
      mode: mode || 'online',
      notes: notes || '',
      applicationId: applicationId || null,
      status: 'scheduled',
    })

    // Update application stage to 'interview'
    if (applicationId) {
      await (Application as any).findByIdAndUpdate(applicationId, {
        stage: 'interview',
      })
    }

    // Create notification for user
    await (Notification as any).create({
      userId,
      title: 'Interview Scheduled',
      message: `Your interview is scheduled for ${new Date(scheduled_at).toLocaleDateString()}`,
      type: 'interview',
      link: `/interviews/${interview._id}`,
    })

    // Emit Socket.IO notification if available
    if ((global as any).io) {
      ;(global as any).io.to(`user_${userId}`).emit('notification', {
        title: 'Interview Scheduled',
        message: `Your interview is scheduled for ${new Date(scheduled_at).toLocaleDateString()}`,
        type: 'interview',
        interviewId: interview._id,
      })
    }

    return res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully',
      interview: {
        id: interview._id,
        type: interview.interviewType,
        scheduledAt: interview.scheduledAt,
        mode: interview.mode,
        status: interview.status,
      },
    })
  } catch (error: any) {
    console.error('Error scheduling interview:', error)
    return res.status(500).json({
      message: 'Error scheduling interview',
      error: error.message,
    })
  }
}

// Check interview eligibility without scheduling
const checkEligibilityHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    await connectDB()

    const userId = (req as any).userId
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

    const canScheduleInterview =
      total > 0 && documents.every((d: any) => d.status === 'approved')

    return res.status(200).json({
      canScheduleInterview,
      documentStats: {
        total,
        approved,
        pending,
        rejected,
        allApproved: canScheduleInterview,
      },
    })
  } catch (error: any) {
    console.error('Error checking eligibility:', error)
    return res.status(500).json({
      message: 'Error checking interview eligibility',
      error: error.message,
    })
  }
}

// Main API handler with middleware support
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Extract and verify JWT token
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ message: 'No authorization token provided' })
    }

    const decoded: any = jwt.verify(token, JWT_SECRET)
    ;(req as any).userId = decoded.id
    ;(req as any).userEmail = decoded.email
    ;(req as any).userRole = decoded.role
    ;(req as any).user = decoded

    // GET request - check eligibility
    if (req.method === 'GET') {
      return checkEligibilityHandler(req, res)
    }

    // POST request - schedule interview with middleware
    if (req.method === 'POST') {
      // Apply middleware chain: checkDocumentsComplete -> validateInterviewParams -> logInterviewActivity -> handler
      const middlewares = [
        checkDocumentsComplete,
        validateInterviewParams,
        logInterviewActivity,
      ]

      let index = 0
      const next = async () => {
        if (index < middlewares.length) {
          const middleware = middlewares[index++]
          return middleware(req, res, next)
        }
        // All middleware passed, call handler
        return scheduleInterviewHandler(req, res)
      }

      return next()
    }

    return res.status(405).json({ message: 'Method Not Allowed' })
  } catch (error: any) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expired' })
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' })
    }
    return res.status(500).json({ message: 'Internal server error' })
  }
}
