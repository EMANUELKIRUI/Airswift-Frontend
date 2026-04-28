/**
 * API Documentation and Examples for Document Management
 * Shows how to implement the backend logic for:
 * - Admin document review
 * - Auto-stage updates when documents are approved
 * - Interview scheduling with document checks
 * - WebSocket notifications
 */

// ============================================================
// 🔒 SECURITY MIDDLEWARE EXAMPLE
// ============================================================
// In your API routes, use the middleware like this:

/*
import { isAdmin, isAuthenticated, hasRole } from '@/lib/middleware/adminMiddleware'
import type { NextApiRequest, NextApiResponse } from 'next'

// Admin-only route
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdmin(req, res)) return // Checks if user is admin

  // Your logic here
}

// OR using hasRole
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const checkRole = hasRole('admin')
  if (!checkRole(req, res)) return

  // Your logic here
}
*/

// ============================================================
// 📄 ADMIN DOCUMENTS ENDPOINT
// ============================================================

/*
// GET /api/admin/documents - Fetch all users' documents
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdmin(req, res)) return

  const documents = await Document.find({})
    .populate('userId', 'name email')
    .sort({ uploadedAt: -1 })

  res.json(documents)
}

// PUT /api/admin/documents/:id - Review document
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdmin(req, res)) return

  const { id } = req.query
  const { status, rejectionReason } = req.body

  if (!['approved', 'rejected', 'under_review'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' })
  }

  // Update document
  const doc = await Document.findByIdAndUpdate(
    id,
    {
      status,
      rejectionReason: status === 'rejected' ? rejectionReason : null,
    },
    { new: true }
  )

  // Send WebSocket notification
  io.to(doc.userId.toString()).emit('document:status_changed', {
    documentId: doc._id,
    type: doc.type,
    status: doc.status,
    message: `Your ${doc.type} has been ${status}`,
    rejectionReason: doc.rejectionReason,
  })

  // Check if all documents are approved
  const allApproved = await checkAllDocumentsApproved(doc.userId)

  if (allApproved) {
    // Update application stage to 'interview'
    await Application.findOneAndUpdate(
      { userId: doc.userId },
      { stage: 'interview' },
      { new: true }
    )

    // Notify user
    io.to(doc.userId.toString()).emit('notification', {
      type: 'application_stage_updated',
      message: '🎉 All documents approved! You can now schedule interviews.',
      data: { stage: 'interview' },
    })
  }

  res.json(doc)
}
*/

// ============================================================
// 🎤 INTERVIEW SCHEDULING WITH DOCUMENT CHECK
// ============================================================

/*
// POST /api/interviews/schedule - Schedule interview
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAuthenticated(req, res)) return

  const { userId } = req.user
  const { jobId, date, time } = req.body

  // Check if all documents are approved
  const documents = await Document.find({ userId })
  const allApproved = documents.every(d => d.status === 'approved')

  if (!allApproved) {
    return res.status(403).json({
      message: 'Complete all document reviews first before scheduling interviews',
      pendingDocuments: documents
        .filter(d => d.status !== 'approved')
        .map(d => ({ type: d.type, status: d.status })),
    })
  }

  // Create interview
  const interview = await Interview.create({
    userId,
    jobId,
    date,
    time,
  })

  // Notify user
  io.to(userId).emit('interview:scheduled', {
    message: '📅 Interview scheduled successfully!',
    interview,
  })

  res.json(interview)
}
*/

// ============================================================
// 📤 DOCUMENT UPLOAD ENDPOINT
// ============================================================

/*
// POST /api/documents/upload
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAuthenticated(req, res)) return

  const { userId } = req.user
  const { type } = req.body
  const file = req.files.file

  // Validate file size
  const maxSize = 2 * 1024 * 1024 // 2MB
  if (file.size > maxSize) {
    return res.status(400).json({
      message: 'File too large. Maximum size is 2MB',
    })
  }

  // Save file and create document record
  const document = await Document.create({
    userId,
    type,
    fileName: file.name,
    fileUrl: uploadedFileUrl,
    status: 'pending', // Initially pending admin review
  })

  res.json({ document })
}
*/

// ============================================================
// 🔔 AUTO-NOTIFICATION LOGIC
// ============================================================

/*
// When a document is approved by admin:
const doc = await Document.findByIdAndUpdate(id, { status: 'approved' })

// Create notification
await Notification.create({
  userId: doc.userId,
  type: 'document_approved',
  message: `Your ${doc.type} has been approved!`,
  documentId: doc._id,
})

// Send real-time notification via WebSocket
io.to(doc.userId.toString()).emit('notification', {
  type: 'document_approved',
  message: `✅ Your ${doc.type} has been approved!`,
  documentId: doc._id,
  status: 'approved',
})
*/

// ============================================================
// 🧪 FRONTEND IMPLEMENTATION EXAMPLE
// ============================================================

/*
// In your React component:

import { useEffect } from 'react'
import socket from '@/services/socket'

function DocumentsPage() {
  useEffect(() => {
    // Listen for document status changes
    socket.on('document:status_changed', (data) => {
      console.log('Document status:', data.status)
      // Refresh documents list
      fetchDocuments()
    })

    // Listen for interview lock notifications
    socket.on('notification', (data) => {
      if (data.type === 'application_stage_updated') {
        // All documents approved, enable interview scheduling
        setInterviewsLocked(false)
      }
    })

    return () => {
      socket.off('document:status_changed')
      socket.off('notification')
    }
  }, [])

  return (
    <div>
      {interviewsLocked && (
        <div>🔒 Interviews locked until documents are approved</div>
      )}
    </div>
  )
}
*/

// ============================================================
// 📊 RECOMMENDED API ROUTES TO CREATE
// ============================================================

/*
Routes needed:

1. USER ROUTES
   - GET /api/documents - Get user's documents
   - POST /api/documents/upload - Upload document
   - GET /api/dashboard - Get dashboard data with stats

2. ADMIN ROUTES (Protected with isAdmin middleware)
   - GET /api/admin/documents - Get all documents for review
   - PUT /api/admin/documents/:id - Approve/reject document
   - GET /api/admin/documents/user/:userId - Get user's documents
   - DELETE /api/admin/documents/:id - Delete document

3. INTERVIEW ROUTES
   - POST /api/interviews/schedule - Schedule interview (check documents approved)
   - GET /api/interviews - Get user's interviews
   - PUT /api/interviews/:id - Update interview

4. APPLICATION ROUTES
   - GET /api/applications/stage - Get application stage (interview/document/etc)
   - POST /api/applications - Create application
*/

export default {}
