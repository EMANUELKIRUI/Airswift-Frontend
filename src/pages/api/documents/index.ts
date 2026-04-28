// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import { connectDB } from '@/lib/mongodb'
import Document from '@/lib/models/Document'
import User from '@/lib/models/User'
import Notification from '@/lib/models/Notification'
import AuditLog from '@/lib/models/AuditLog'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'change_me'

export const config = {
  api: {
    bodyParser: false,
  },
}

const getSingleValue = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0] || ''
  }
  return value || ''
}

const makeUploadDir = async () => {
  const folder = path.join(process.cwd(), 'public', 'uploads', 'documents', `${Date.now()}`)
  await fs.promises.mkdir(folder, { recursive: true })
  return folder
}

const saveFile = async (file: formidable.File, uploadDir: string) => {
  if (!file || !file.filepath) {
    return null
  }

  const originalName = file.originalFilename || path.basename(file.filepath)
  const safeName = `${Date.now()}-${originalName.replace(/\s+/g, '_')}`
  const destination = path.join(uploadDir, safeName)

  await fs.promises.rename(file.filepath, destination)

  return `/uploads/documents/${path.basename(uploadDir)}/${safeName}`
}

// Upload document
const uploadDocument = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB()

  const form = formidable({
    multiples: false,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10 MB limit
    filter: ({ mimetype }) => {
      // Only accept PDF files
      return mimetype === 'application/pdf'
    },
  })

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err)
      if (err.message?.includes('mimetype')) {
        return res.status(400).json({ message: 'Only PDF files are allowed' })
      }
      return res.status(400).json({ message: err.message || 'Error parsing form data' })
    }

    try {
      const userId = (req as any).userId
      const type = getSingleValue(fields.type)
      const file = files.file as formidable.File | undefined

      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' })
      }

      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' })
      }

      if (!type) {
        return res.status(400).json({ message: 'Document type is required' })
      }

      const validTypes = ['passport', 'cv', 'certificate', 'cover_letter', 'photo', 'national_id']
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          message: `Invalid document type. Must be one of: ${validTypes.join(', ')}`,
        })
      }

      // Check for duplicate documents
      const existing = await (Document as any).findOne({ userId, type })
      if (existing) {
        // Delete old document file if it exists
        if (existing.fileUrl) {
          const oldFilePath = path.join(process.cwd(), 'public', existing.fileUrl)
          try {
            await fs.promises.unlink(oldFilePath)
          } catch (e) {
            console.warn('Could not delete old file:', e)
          }
        }
        // Update existing document
        existing.fileUrl = await saveFile(file, await makeUploadDir())
        existing.fileName = file.originalFilename || 'document.pdf'
        existing.fileSize = file.size
        existing.mimeType = file.mimetype || 'application/pdf'
        existing.status = 'pending'
        existing.rejectionReason = null
        existing.uploadedAt = new Date()
        await existing.save()

        // Notify user
        await (Notification as any).create({
          userId,
          title: 'Document Updated',
          message: `Your ${type} document has been updated for review`,
          type: 'document',
        })

        // Log activity
        await (AuditLog as any).create({
          userId,
          action: 'updated_document',
          description: `Updated ${type} document`,
          metadata: { documentId: existing._id, type },
        })

        // Notify admins via Socket.IO
        if ((global as any).io) {
          const admins = await (User as any).find({ role: 'admin' })
          const user = await (User as any).findById(userId)
          admins.forEach((admin: any) => {
            ;(global as any).io.to(`user_${admin._id}`).emit('notification', {
              title: 'Document Updated',
              message: `${user?.name} updated their ${type} document`,
              type: 'document',
              documentId: existing._id,
              userId,
            })
          })
        }

        return res.status(200).json({
          message: 'Document updated successfully',
          document: {
            _id: existing._id,
            type: existing.type,
            status: existing.status,
            uploadedAt: existing.uploadedAt,
            fileUrl: existing.fileUrl,
          },
        })
      }

      // Create new document
      const uploadDir = await makeUploadDir()
      const fileUrl = await saveFile(file, uploadDir)

      const document = await (Document as any).create({
        userId,
        type,
        fileUrl,
        fileName: file.originalFilename || 'document.pdf',
        fileSize: file.size,
        mimeType: file.mimetype || 'application/pdf',
        status: 'pending',
        uploadedAt: new Date(),
      })

      // Notify user
      await (Notification as any).create({
        userId,
        title: 'Document Uploaded',
        message: `Your ${type} document has been uploaded and is pending review`,
        type: 'document',
      })

      // Log activity
      await (AuditLog as any).create({
        userId,
        action: 'uploaded_document',
        description: `Uploaded ${type} document`,
        metadata: { documentId: document._id, type },
      })

      // Notify admins via Socket.IO
      if ((global as any).io) {
        const admins = await (User as any).find({ role: 'admin' })
        const user = await (User as any).findById(userId)
        admins.forEach((admin: any) => {
          ;(global as any).io.to(`user_${admin._id}`).emit('notification', {
            title: 'New Document Upload',
            message: `${user?.name} uploaded a new ${type} document`,
            type: 'document',
            documentId: document._id,
            userId,
          })
        })
      }

      return res.status(201).json({
        message: 'Document uploaded successfully',
        document: {
          _id: document._id,
          type: document.type,
          status: document.status,
          uploadedAt: document.uploadedAt,
          fileUrl: document.fileUrl,
        },
      })
    } catch (error: any) {
      console.error('Error uploading document:', error)
      return res.status(500).json({
        message: 'Error uploading document',
        error: error.message,
      })
    }
  })
}

// Get user's documents
const getUserDocuments = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB()

  try {
    const userId = (req as any).userId

    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' })
    }

    const documents = await (Document as any)
      .find({ userId })
      .select('type status uploadedAt reviewedAt rejectionReason fileUrl')
      .sort({ uploadedAt: -1 })
      .lean()

    return res.status(200).json({
      message: 'Documents retrieved successfully',
      documents,
    })
  } catch (error: any) {
    console.error('Error fetching documents:', error)
    return res.status(500).json({
      message: 'Error fetching documents',
      error: error.message,
    })
  }
}

// Admin: Review document
const reviewDocument = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB()

  try {
    const userId = (req as any).userId
    const userRole = (req as any).userRole
    const { documentId } = req.query
    const { status, rejectionReason } = req.body

    // Check admin role
    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required' })
    }

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be 'approved' or 'rejected'",
      })
    }

    const document = await (Document as any).findById(documentId)
    if (!document) {
      return res.status(404).json({ message: 'Document not found' })
    }

    // Update document
    document.status = status
    document.reviewedAt = new Date()
    document.reviewedBy = userId
    if (status === 'rejected' && rejectionReason) {
      document.rejectionReason = rejectionReason
    }
    await document.save()

    // Notify user via Socket.IO
    if ((global as any).io) {
      const message =
        status === 'approved'
          ? `Your ${document.type} document has been approved`
          : `Your ${document.type} document was rejected: ${rejectionReason || 'Please resubmit'}`

      ;(global as any).io.to(`user_${document.userId}`).emit('notification', {
        title: status === 'approved' ? 'Document Approved' : 'Document Rejected',
        message,
        type: 'document',
        documentId: document._id,
        status,
      })
    }

    // Create notification
    await (Notification as any).create({
      userId: document.userId,
      title: status === 'approved' ? 'Document Approved' : 'Document Rejected',
      message:
        status === 'approved'
          ? `Your ${document.type} document has been approved`
          : `Your ${document.type} document was rejected: ${rejectionReason || 'Please resubmit'}`,
      type: 'document',
    })

    // Log activity
    await (AuditLog as any).create({
      userId,
      action: status === 'approved' ? 'document_approved' : 'document_rejected',
      description: `${status === 'approved' ? 'Approved' : 'Rejected'} ${document.type} document`,
      metadata: { documentId: document._id, status },
    })

    // Check if all documents approved
    const allDocuments = await (Document as any).find({ userId: document.userId })
    const allApproved = allDocuments.every((d: any) => d.status === 'approved')

    if (allApproved && allDocuments.length > 0) {
      // Notify user they can schedule interview
      ;(global as any).io?.to(`user_${document.userId}`).emit('notification', {
        title: 'Documents Complete! Ready for Interview',
        message: 'All your documents have been approved. You can now schedule your interview.',
        type: 'interview',
      })

      await (Notification as any).create({
        userId: document.userId,
        title: 'Documents Complete! Ready for Interview',
        message:
          'All your documents have been approved. You can now schedule your interview.',
        type: 'interview',
      })
    }

    return res.status(200).json({
      message: `Document ${status} successfully`,
      document: {
        _id: document._id,
        type: document.type,
        status: document.status,
        reviewedAt: document.reviewedAt,
      },
    })
  } catch (error: any) {
    console.error('Error reviewing document:', error)
    return res.status(500).json({
      message: 'Error reviewing document',
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

    if (req.method === 'POST' && !action) {
      return uploadDocument(req, res)
    }

    if (req.method === 'GET') {
      return getUserDocuments(req, res)
    }

    if (req.method === 'PUT' && action === 'review') {
      return reviewDocument(req, res)
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
