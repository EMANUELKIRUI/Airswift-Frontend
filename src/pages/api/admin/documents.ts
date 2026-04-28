// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/lib/mongodb'
import Document from '@/lib/models/Document'
import User from '@/lib/models/User'
import Application from '@/lib/models/Application'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'change_me'

// Get all documents (admin)
const getAllDocuments = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB()

  try {
    const userRole = (req as any).userRole

    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required' })
    }

    const { status, type, userId, sortBy = '-createdAt', page = 1, limit = 20 } = req.query

    const query: any = {}
    if (status) query.status = status
    if (type) query.type = type
    if (userId) query.userId = userId

    const skip = (Number(page) - 1) * Number(limit)
    const sort: any = {}

    // Parse sortBy parameter
    if (sortBy) {
      const [field, order] = String(sortBy).startsWith('-')
        ? [String(sortBy).substring(1), -1]
        : [String(sortBy), 1]
      sort[field] = order
    }

    const documents = await (Document as any)
      .find(query)
      .populate('userId', 'name email phone')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean()

    const total = await (Document as any).countDocuments(query)

    return res.status(200).json({
      message: 'Documents retrieved successfully',
      documents,
      total,
      page: Number(page),
      limit: Number(limit),
    })
  } catch (error: any) {
    console.error('Error fetching documents:', error)
    return res.status(500).json({
      message: 'Error fetching documents',
      error: error.message,
    })
  }
}

// Get all applications (admin)
const getAllApplications = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB()

  try {
    const userRole = (req as any).userRole

    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required' })
    }

    const { status, stage, userId, page = 1, limit = 20 } = req.query

    const query: any = {}
    if (status) query.status = status
    if (stage) query.stage = stage
    if (userId) query.user_id = userId

    const skip = (Number(page) - 1) * Number(limit)

    const applications = await (Application as any)
      .find(query)
      .populate('user_id', 'name email phone')
      .populate('job_id', 'title')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean()

    // Get document stats for each application
    const applicationsWithDocs = await Promise.all(
      applications.map(async (app: any) => {
        const docs = await (Document as any)
          .find({ userId: app.user_id._id })
          .select('status')
          .lean()

        return {
          ...app,
          documentsStatus: {
            total: docs.length,
            approved: docs.filter((d: any) => d.status === 'approved').length,
            pending: docs.filter((d: any) => d.status === 'pending').length,
            rejected: docs.filter((d: any) => d.status === 'rejected').length,
            allApproved: docs.length > 0 && docs.every((d: any) => d.status === 'approved'),
          },
        }
      })
    )

    const total = await (Application as any).countDocuments(query)

    return res.status(200).json({
      message: 'Applications retrieved successfully',
      applications: applicationsWithDocs,
      total,
      page: Number(page),
      limit: Number(limit),
    })
  } catch (error: any) {
    console.error('Error fetching applications:', error)
    return res.status(500).json({
      message: 'Error fetching applications',
      error: error.message,
    })
  }
}

// Get user's documents and application (admin)
const getUserDetails = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB()

  try {
    const userRole = (req as any).userRole
    const { userId } = req.query

    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required' })
    }

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' })
    }

    const user = await (User as any).findById(userId).select('-password').lean()
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const documents = await (Document as any)
      .find({ userId })
      .select('type status uploadedAt rejectionReason')
      .sort({ uploadedAt: -1 })
      .lean()

    const application = await (Application as any)
      .findOne({ user_id: userId })
      .populate('job_id', 'title company')
      .lean()

    const documentStats = {
      total: documents.length,
      approved: documents.filter((d: any) => d.status === 'approved').length,
      pending: documents.filter((d: any) => d.status === 'pending').length,
      rejected: documents.filter((d: any) => d.status === 'rejected').length,
    }

    return res.status(200).json({
      message: 'User details retrieved successfully',
      user,
      documents,
      application,
      documentStats,
    })
  } catch (error: any) {
    console.error('Error fetching user details:', error)
    return res.status(500).json({
      message: 'Error fetching user details',
      error: error.message,
    })
  }
}

// Check interview eligibility for a user (admin)
const checkInterviewEligibility = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB()

  try {
    const userRole = (req as any).userRole
    const { userId } = req.query

    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required' })
    }

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' })
    }

    const documents = await (Document as any)
      .find({ userId })
      .select('status')
      .lean()

    const approved = documents.filter((d: any) => d.status === 'approved').length
    const pending = documents.filter((d: any) => d.status === 'pending').length
    const rejected = documents.filter((d: any) => d.status === 'rejected').length
    const total = documents.length

    const canProceedToInterview =
      total > 0 && documents.every((d: any) => d.status === 'approved')

    const application = await (Application as any).findOne({ user_id: userId }).lean()

    return res.status(200).json({
      canProceedToInterview,
      documentsStatus: {
        total,
        approved,
        pending,
        rejected,
        allApproved: canProceedToInterview,
      },
      applicationStage: application?.stage || 'documents',
    })
  } catch (error: any) {
    console.error('Error checking eligibility:', error)
    return res.status(500).json({
      message: 'Error checking interview eligibility',
      error: error.message,
    })
  }
}

// Bulk review documents (admin)
const bulkReviewDocuments = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB()

  try {
    const userRole = (req as any).userRole
    const userId = (req as any).userId
    const { documentIds, status } = req.body

    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required' })
    }

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({ message: 'Document IDs are required' })
    }

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be 'approved' or 'rejected'",
      })
    }

    const updates = await (Document as any).updateMany(
      { _id: { $in: documentIds } },
      {
        status,
        reviewedAt: new Date(),
        reviewedBy: userId,
      }
    )

    return res.status(200).json({
      message: 'Documents reviewed successfully',
      modifiedCount: updates.modifiedCount,
    })
  } catch (error: any) {
    console.error('Error bulk reviewing documents:', error)
    return res.status(500).json({
      message: 'Error bulk reviewing documents',
      error: error.message,
    })
  }
}

// Main handler
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

    const { action } = req.query

    // GET endpoints
    if (req.method === 'GET') {
      if (action === 'documents') {
        return getAllDocuments(req, res)
      }
      if (action === 'applications') {
        return getAllApplications(req, res)
      }
      if (action === 'user') {
        return getUserDetails(req, res)
      }
      if (action === 'eligibility') {
        return checkInterviewEligibility(req, res)
      }
    }

    // PUT endpoints
    if (req.method === 'PUT' && action === 'bulk-review') {
      return bulkReviewDocuments(req, res)
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
