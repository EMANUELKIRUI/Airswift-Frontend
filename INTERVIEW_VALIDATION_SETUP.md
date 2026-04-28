# 🔒 Interview Validation & Document Completion Lock - Implementation Guide

## Overview

This implementation prevents users from scheduling interviews until all their documents are approved by admins. It includes:

- **Document Model** - Tracks document uploads with status (pending/approved/rejected)
- **Interview Validation Middleware** - Blocks interview scheduling if documents incomplete
- **API Endpoints** - Document upload, review, and interview scheduling
- **Frontend Components** - UI for scheduling interviews and viewing document status
- **Socket.IO Integration** - Real-time notifications for document updates
- **Admin Dashboard** - Manage documents and check eligibility

---

## 📁 Files Created/Modified

### New Files
- ✅ `src/lib/models/Document.ts` - Document schema
- ✅ `src/lib/middleware/interviewValidation.ts` - Validation middleware
- ✅ `src/pages/api/interview/schedule.ts` - Interview scheduling endpoint
- ✅ `src/pages/api/documents/index.ts` - Document upload/review endpoints
- ✅ `src/pages/api/admin/documents.ts` - Admin document management
- ✅ `src/components/InterviewScheduler.tsx` - Interview scheduling component
- ✅ `src/components/DocumentStatusDisplay.tsx` - Document status display

### Modified Files
- ✅ `src/lib/models/Application.ts` - Added `stage` field

---

## 🚀 Quick Start

### 1. User Uploads Documents

```typescript
// POST /api/documents
// Body: FormData with file and type

const formData = new FormData()
formData.append('file', pdfFile)
formData.append('type', 'passport')

const response = await fetch('/api/documents', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData,
})
```

**Response:**
```json
{
  "message": "Document uploaded successfully",
  "document": {
    "_id": "doc123",
    "type": "passport",
    "status": "pending",
    "uploadedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 2. Admin Reviews Documents

```typescript
// PUT /api/documents?action=review
// Body: { status: 'approved' | 'rejected', rejectionReason?: string }

const response = await fetch(`/api/documents?action=review`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    documentId: 'doc123',
    status: 'approved',
  }),
})
```

### 3. User Checks Interview Eligibility

```typescript
// GET /api/interview/schedule

const response = await fetch('/api/interview/schedule', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
})

const data = await response.json()
// Returns: { canScheduleInterview: boolean, documentStats: {...} }
```

### 4. User Schedules Interview (Only If Documents Approved)

```typescript
// POST /api/interview/schedule
// Middleware: checkDocumentsComplete validates docs first

const response = await fetch('/api/interview/schedule', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    scheduled_at: '2024-02-15T10:00:00Z',
    type: 'video',
    mode: 'online',
    notes: 'Optional notes'
  }),
})

const data = await response.json()

// If documents not complete (403):
// {
//   "blocking": true,
//   "message": "Cannot schedule interview. Complete all document reviews first.",
//   "documentsStatus": { total: 5, approved: 2, pending: 3, rejected: 0 },
//   "pendingDocuments": [...]
// }

// If successful (201):
// {
//   "success": true,
//   "interview": { id: "int123", type: "video", scheduledAt: "..." }
// }
```

---

## 📋 API Endpoints

### Document Endpoints

#### Upload Document
```http
POST /api/documents
Content-Type: multipart/form-data
Authorization: Bearer <token>

file=<binary>
type=passport|cv|certificate|cover_letter|photo|national_id
```

**Response (201):**
```json
{
  "message": "Document uploaded successfully",
  "document": {
    "_id": "docId",
    "type": "passport",
    "status": "pending",
    "uploadedAt": "2024-01-01T00:00:00Z",
    "fileUrl": "/uploads/documents/..."
  }
}
```

#### Get User's Documents
```http
GET /api/documents
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Documents retrieved successfully",
  "documents": [
    {
      "_id": "docId",
      "type": "passport",
      "status": "approved",
      "uploadedAt": "2024-01-01T00:00:00Z",
      "reviewedAt": "2024-01-02T00:00:00Z",
      "rejectionReason": null
    }
  ]
}
```

#### Review Document (Admin)
```http
PUT /api/documents?action=review
Content-Type: application/json
Authorization: Bearer <adminToken>

{
  "documentId": "docId",
  "status": "approved",
  "rejectionReason": "Photo too blurry"  // Optional, only for rejections
}
```

**Response (200):**
```json
{
  "message": "Document approved successfully",
  "document": {
    "_id": "docId",
    "type": "passport",
    "status": "approved",
    "reviewedAt": "2024-01-02T00:00:00Z"
  }
}
```

### Interview Endpoints

#### Check Interview Eligibility
```http
GET /api/interview/schedule
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "canScheduleInterview": true,
  "documentStats": {
    "total": 5,
    "approved": 5,
    "pending": 0,
    "rejected": 0,
    "allApproved": true
  }
}
```

#### Schedule Interview (With Document Validation)
```http
POST /api/interview/schedule
Content-Type: application/json
Authorization: Bearer <token>

{
  "scheduled_at": "2024-02-15T10:00:00Z",
  "type": "video",
  "mode": "online",
  "notes": "Optional",
  "applicationId": "appId"  // Optional
}
```

**Response (201 - Success):**
```json
{
  "success": true,
  "message": "Interview scheduled successfully",
  "interview": {
    "id": "int123",
    "type": "video",
    "scheduledAt": "2024-02-15T10:00:00Z",
    "mode": "online",
    "status": "scheduled"
  }
}
```

**Response (403 - Documents Not Complete):**
```json
{
  "message": "Cannot schedule interview. Complete all document reviews first.",
  "blocking": true,
  "documentsStatus": {
    "total": 5,
    "approved": 2,
    "pending": 2,
    "rejected": 1
  },
  "pendingDocuments": [
    {
      "id": "doc123",
      "type": "cv",
      "status": "pending",
      "rejectionReason": null
    }
  ]
}
```

### Admin Endpoints

#### Get All Documents (Admin)
```http
GET /api/admin/documents?action=documents&status=pending&type=passport&page=1&limit=20
Authorization: Bearer <adminToken>
```

**Response (200):**
```json
{
  "message": "Documents retrieved successfully",
  "documents": [
    {
      "_id": "docId",
      "userId": {
        "_id": "userId",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "type": "passport",
      "status": "pending",
      "uploadedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 20
}
```

#### Get All Applications (Admin)
```http
GET /api/admin/documents?action=applications&stage=documents&page=1&limit=20
Authorization: Bearer <adminToken>
```

**Response (200):**
```json
{
  "message": "Applications retrieved successfully",
  "applications": [
    {
      "_id": "appId",
      "user_id": {
        "_id": "userId",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "status": "pending",
      "stage": "documents",
      "documentsStatus": {
        "total": 5,
        "approved": 2,
        "pending": 3,
        "rejected": 0,
        "allApproved": false
      }
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 20
}
```

#### Get User's Documents & Application (Admin)
```http
GET /api/admin/documents?action=user&userId=userId
Authorization: Bearer <adminToken>
```

**Response (200):**
```json
{
  "message": "User details retrieved successfully",
  "user": {
    "_id": "userId",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "documents": [
    {
      "_id": "docId",
      "type": "passport",
      "status": "approved",
      "uploadedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "application": {
    "_id": "appId",
    "status": "pending",
    "stage": "documents"
  },
  "documentStats": {
    "total": 5,
    "approved": 2,
    "pending": 2,
    "rejected": 1
  }
}
```

#### Check Interview Eligibility (Admin)
```http
GET /api/admin/documents?action=eligibility&userId=userId
Authorization: Bearer <adminToken>
```

**Response (200):**
```json
{
  "canProceedToInterview": true,
  "documentsStatus": {
    "total": 5,
    "approved": 5,
    "pending": 0,
    "rejected": 0,
    "allApproved": true
  },
  "applicationStage": "documents"
}
```

#### Bulk Review Documents (Admin)
```http
PUT /api/admin/documents?action=bulk-review
Content-Type: application/json
Authorization: Bearer <adminToken>

{
  "documentIds": ["doc1", "doc2", "doc3"],
  "status": "approved"
}
```

**Response (200):**
```json
{
  "message": "Documents reviewed successfully",
  "modifiedCount": 3
}
```

---

## 🎨 Frontend Components

### InterviewScheduler Component

**Usage:**
```typescript
import { InterviewScheduler } from '@/components/InterviewScheduler'

export function MyPage() {
  return (
    <InterviewScheduler
      onSuccess={() => alert('Interview scheduled!')}
      onError={(error) => alert(error)}
    />
  )
}
```

**Features:**
- ✅ Checks document eligibility
- ✅ Shows blocking message if documents incomplete
- ✅ Form to schedule interview (date, type, mode, notes)
- ✅ Real-time status display
- ✅ Error handling with retry

### DocumentStatusDisplay Component

**Usage:**
```typescript
import { DocumentStatusDisplay } from '@/components/DocumentStatusDisplay'

export function Dashboard() {
  return (
    <DocumentStatusDisplay
      onStatusChange={() => console.log('Documents updated')}
    />
  )
}
```

**Features:**
- ✅ Shows all documents with status
- ✅ Progress bar with approved/total count
- ✅ Displays rejection reasons
- ✅ Auto-refresh every 30 seconds
- ✅ Download button for documents

---

## 🔐 Middleware: checkDocumentsComplete

Located in: `src/lib/middleware/interviewValidation.ts`

### How It Works

```typescript
// Before any request reaches the interview handler,
// this middleware checks if all documents are approved

export const checkDocumentsComplete = async (req, res, next) => {
  // 1. Get userId from JWT token
  const userId = req.user?.id

  // 2. Fetch all documents for user
  const documents = await Document.find({ userId })

  // 3. Check if ALL documents have status === 'approved'
  const allApproved = documents.every(d => d.status === 'approved')

  // 4. If NOT all approved, return 403 Forbidden
  if (!allApproved) {
    return res.status(403).json({
      message: 'Cannot schedule interview. Complete all document reviews first.',
      blocking: true,
      documentsStatus: { ... },
      pendingDocuments: [ ... ]
    })
  }

  // 5. If all approved, allow to continue to handler
  return next()
}
```

### Usage in Interview Route

```typescript
router.post(
  '/schedule',
  verifyToken,
  checkDocumentsComplete,      // ← Check documents first
  validateInterviewParams,     // ← Validate interview details
  logInterviewActivity,        // ← Log the action
  scheduleInterview            // ← Actually schedule
)
```

---

## 🔌 Socket.IO Real-Time Notifications

### Document Upload Notification (To Admins)

When a user uploads a document, all admins receive real-time notification:

```typescript
// In documentController.ts - uploadDocument()
if (global.io) {
  admins.forEach((admin) => {
    global.io.to(`user_${admin._id}`).emit('notification', {
      title: 'New Document Upload',
      message: `John Doe uploaded a new passport document`,
      type: 'document',
      documentId: document._id,
      userId: userId,
    })
  })
}
```

### Document Review Notification (To User)

When admin approves/rejects document, user gets real-time notification:

```typescript
// In documentController.ts - reviewDocument()
if (global.io) {
  global.io.to(`user_${document.userId}`).emit('notification', {
    title: 'Document Approved',
    message: 'Your passport document has been approved',
    type: 'document',
    status: 'approved',
    documentId: document._id,
  })
}
```

### Interview Ready Notification

When ALL documents approved, user gets notification they can schedule interview:

```typescript
// When final document is approved and all are now complete
global.io.to(`user_${userId}`).emit('notification', {
  title: 'Documents Complete! Ready for Interview',
  message: 'All your documents have been approved. You can now schedule your interview.',
  type: 'interview',
})
```

### Frontend: Listen for Notifications

```typescript
import { useSocket } from '@/hooks/useSocket'

function Dashboard() {
  const socket = useSocket()

  useEffect(() => {
    socket?.on('notification', (data) => {
      if (data.type === 'document' && data.status === 'approved') {
        // Document approved! Refresh interview eligibility
        checkEligibility()
      }
      
      if (data.type === 'interview') {
        // Interview ready notification
        showToast('You can now schedule your interview!')
      }
    })

    return () => socket?.off('notification')
  }, [socket])

  return <div>Dashboard</div>
}
```

---

## ✅ Complete Workflow

### Stage 1: Document Upload & Review

```
1. User uploads document via PUT /api/documents
   ├─ File validated (PDF only)
   ├─ Stored in /public/uploads/documents/
   ├─ Document record created with status: 'pending'
   ├─ User notified: "Document uploaded, pending review"
   └─ All admins notified via Socket.IO

2. Admin sees notification + dashboard update
   ├─ Reviews document via PUT /api/documents?action=review
   ├─ Approves: status = 'approved'
   ├─ Rejects: status = 'rejected' + reason

3. User receives notification
   ├─ GET /api/documents returns updated status
   ├─ DocumentStatusDisplay component refreshes
   └─ If all docs approved, "Ready for Interview" notification
```

### Stage 2: Check Interview Eligibility

```
User loads Interview Scheduler component
   ↓
Component calls: GET /api/interview/schedule
   ↓
Endpoint returns: { canScheduleInterview: true/false, documentStats: {...} }
   ↓
If false: Show blocking message with status
If true: Show interview scheduling form
```

### Stage 3: Schedule Interview (With Lock)

```
User submits interview scheduling form
   ↓
Request: POST /api/interview/schedule
   ↓
Middleware #1: checkDocumentsComplete()
   ├─ Fetch all documents for user
   ├─ Check: document.status === 'approved' for ALL
   ├─ If NO → Return 403 Forbidden
   └─ If YES → Continue to next middleware
   ↓
Middleware #2: validateInterviewParams()
   ├─ Check: scheduled_at is in future
   ├─ Check: type is valid
   └─ Check: mode is valid
   ↓
Middleware #3: logInterviewActivity()
   └─ Prepare activity log
   ↓
Handler: scheduleInterview()
   ├─ Create Interview record
   ├─ Update Application stage = 'interview'
   ├─ Create notification
   └─ Return 201 with interview details
```

---

## 🧪 Testing

### Test 1: User with No Documents

```bash
# Try to schedule interview
curl -X POST http://localhost:3000/api/interview/schedule \
  -H "Authorization: Bearer USER_TOKEN_NO_DOCS" \
  -H "Content-Type: application/json" \
  -d '{
    "scheduled_at": "2024-02-15T10:00:00Z",
    "type": "video"
  }'

# Expected Response (403):
# {
#   "message": "No documents found. Please upload all required documents first.",
#   "blocking": true,
#   "documentsStatus": { "total": 0, "approved": 0, "pending": 0, "rejected": 0 }
# }
```

### Test 2: User with Pending Documents

```bash
# Try to schedule interview
curl -X POST http://localhost:3000/api/interview/schedule \
  -H "Authorization: Bearer USER_TOKEN_PENDING_DOCS" \
  -H "Content-Type: application/json" \
  -d '{
    "scheduled_at": "2024-02-15T10:00:00Z",
    "type": "video",
    "mode": "online"
  }'

# Expected Response (403):
# {
#   "message": "Cannot schedule interview. Complete all document reviews first.",
#   "blocking": true,
#   "documentsStatus": {
#     "total": 3,
#     "approved": 1,
#     "pending": 2,
#     "rejected": 0
#   },
#   "pendingDocuments": [
#     {
#       "type": "cv",
#       "status": "pending"
#     },
#     {
#       "type": "certificate",
#       "status": "pending"
#     }
#   ]
# }
```

### Test 3: User with All Documents Approved

```bash
# Schedule interview
curl -X POST http://localhost:3000/api/interview/schedule \
  -H "Authorization: Bearer USER_TOKEN_APPROVED_DOCS" \
  -H "Content-Type: application/json" \
  -d '{
    "scheduled_at": "2024-02-15T10:00:00Z",
    "type": "video",
    "mode": "online"
  }'

# Expected Response (201):
# {
#   "success": true,
#   "message": "Interview scheduled successfully",
#   "interview": {
#     "id": "int123",
#     "type": "video",
#     "scheduledAt": "2024-02-15T10:00:00Z",
#     "mode": "online",
#     "status": "scheduled"
#   }
# }
```

### Test 4: Upload Document (PDF only)

```bash
# Upload PDF
curl -X POST http://localhost:3000/api/documents \
  -H "Authorization: Bearer USER_TOKEN" \
  -F "file=@passport.pdf" \
  -F "type=passport"

# Expected Response (201):
# {
#   "message": "Document uploaded successfully",
#   "document": {
#     "_id": "...",
#     "type": "passport",
#     "status": "pending",
#     "fileUrl": "/uploads/documents/..."
#   }
# }
```

### Test 5: Try Non-PDF (Should Fail)

```bash
# Try to upload JPG
curl -X POST http://localhost:3000/api/documents \
  -H "Authorization: Bearer USER_TOKEN" \
  -F "file=@photo.jpg" \
  -F "type=passport"

# Expected Response (400):
# {
#   "message": "Only PDF files are allowed"
# }
```

### Test 6: Admin Review Documents

```bash
# Admin approves document
curl -X PUT http://localhost:3000/api/documents?action=review \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "doc123",
    "status": "approved"
  }'

# Expected Response (200):
# {
#   "message": "Document approved successfully",
#   "document": {
#     "_id": "doc123",
#     "status": "approved",
#     "reviewedAt": "..."
#   }
# }
```

---

## 📊 Database Schema

### Document Model

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  type: 'passport' | 'cv' | 'certificate' | 'cover_letter' | 'photo' | 'national_id',
  fileUrl: String,
  fileName: String,
  fileSize: Number,
  mimeType: String,
  status: 'missing' | 'uploaded' | 'pending' | 'approved' | 'rejected',
  rejectionReason: String,
  uploadedAt: Date,
  reviewedAt: Date,
  reviewedBy: ObjectId (ref: User),
  applicationId: ObjectId (ref: Application),
  createdAt: Date,
  updatedAt: Date
}
```

### Application Model (Updated)

```typescript
{
  _id: ObjectId,
  user_id: ObjectId (ref: User),
  job_id: ObjectId (ref: Job),
  status: 'pending' | 'shortlisted' | 'accepted' | 'rejected',
  stage: 'documents' | 'interview' | 'final',  // ← NEW
  // ... other fields
}
```

---

## 🛡️ Security Notes

1. **JWT Token Validation** - All endpoints require valid JWT token
2. **Role-Based Access** - Admin endpoints check for `role === 'admin'`
3. **File Type Validation** - Only PDF files allowed
4. **File Size Limit** - 10 MB maximum
5. **Ownership Validation** - Users can only access their own documents
6. **Interview Lock** - Enforced by middleware, not frontend

---

## 🔄 Error Scenarios

### No Documents Uploaded

```json
{
  "message": "No documents found. Please upload all required documents first.",
  "blocking": true,
  "documentsRequired": ["passport", "cv", "certificate"]
}
```

### Documents Still Pending

```json
{
  "message": "Cannot schedule interview. Complete all document reviews first.",
  "blocking": true,
  "documentsStatus": {
    "total": 3,
    "approved": 1,
    "pending": 2,
    "rejected": 0
  }
}
```

### Document Rejected

```json
{
  "message": "Cannot schedule interview. Complete all document reviews first.",
  "blocking": true,
  "pendingDocuments": [
    {
      "type": "passport",
      "status": "rejected",
      "rejectionReason": "Photo too blurry, please resubmit"
    }
  ]
}
```

### Invalid Interview Date

```json
{
  "message": "Interview date must be in the future"
}
```

---

## 📈 Next Steps

1. **Test All Endpoints** - Use curl commands or Postman
2. **Set Up Socket.IO** - Ensure global.io is properly configured
3. **Add Admin Dashboard** - Create UI to review documents
4. **Set Up Notifications** - Configure email/push notifications
5. **Monitor Uploads** - Set up file cleanup for old uploads
6. **Add Analytics** - Track interview scheduling metrics

---

## 📚 Related Files

- [Document Model](src/lib/models/Document.ts)
- [Application Model](src/lib/models/Application.ts)
- [Interview Validation Middleware](src/lib/middleware/interviewValidation.ts)
- [Interview Schedule Endpoint](src/pages/api/interview/schedule.ts)
- [Document Upload Endpoint](src/pages/api/documents/index.ts)
- [Admin Documents Endpoint](src/pages/api/admin/documents.ts)
- [InterviewScheduler Component](src/components/InterviewScheduler.tsx)
- [DocumentStatusDisplay Component](src/components/DocumentStatusDisplay.tsx)

---

## ✨ Summary

| Component | Purpose | Location |
|-----------|---------|----------|
| Document Model | Stores document data | `/src/lib/models/Document.ts` |
| Application Model | Updated with stage field | `/src/lib/models/Application.ts` |
| checkDocumentsComplete | Validates docs before interview | `/src/lib/middleware/interviewValidation.ts` |
| Interview Schedule API | Endpoint with middleware | `/src/pages/api/interview/schedule.ts` |
| Document Upload API | Upload & review documents | `/src/pages/api/documents/index.ts` |
| Admin API | Manage documents & applications | `/src/pages/api/admin/documents.ts` |
| InterviewScheduler | Frontend scheduling UI | `/src/components/InterviewScheduler.tsx` |
| DocumentStatusDisplay | Show document status | `/src/components/DocumentStatusDisplay.tsx` |

**Key Feature:** The `checkDocumentsComplete` middleware enforces the interview lock, preventing users from scheduling interviews until all documents are approved by admins.
