# Airswift AI Ranking & Mobile Apps - Implementation Guide

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Frontend Dashboard Implementation](#frontend-dashboard-implementation)
3. [React Native Candidate App](#react-native-candidate-app)
4. [React Native Admin App](#react-native-admin-app)
5. [Backend Integration](#backend-integration)
6. [Security & Authentication](#security--authentication)
7. [Real-Time Features](#real-time-features)
8. [Deployment Guide](#deployment-guide)

---

## 🎯 System Overview

This implementation creates a complete hiring platform ecosystem:

```
┌─────────────────────────────────────────────────────────┐
│                    AIRSWIFT PLATFORM                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐    ┌──────────────┐   ┌────────────┐ │
│  │   WEB ADMIN  │    │   CANDIDATE  │   │    ADMIN   │ │
│  │  DASHBOARD   │    │  MOBILE APP  │   │   MOBILE   │ │
│  │  (React)     │    │ (React Native)   │   APP      │ │
│  └──────────────┘    └──────────────┘   │(React Native)│
│         │                   │            └────────────┘ │
│         └───────────────────┼─────────────────┬──────────┘
│                             │                  │
│         ┌───────────────────▼──────────────────▼────────┐
│         │      SHARED SERVICES LAYER                    │
│         │  (API Client, Socket.IO, Auth)               │
│         └────────────────┬─────────────────────────────┘
│                          │
│         ┌────────────────▼────────────────────────────┐
│         │        BACKEND API SERVER                    │
│         │  (Node.js/Express + MongoDB)                │
│         │  - Authentication (JWT + Refresh Tokens)    │
│         │  - Application Management                   │
│         │  - Document Processing                      │
│         │  - AI Scoring & Ranking                     │
│         │  - Real-time Socket.IO Events               │
│         │  - Analytics & Reporting                    │
│         └─────────────────────────────────────────────┘
```

---

## 🎨 Frontend Dashboard Implementation

### What Was Built

#### 1. **Application Model Updates**
**File**: `src/lib/models/Application.ts`

Added AI scoring and ranking fields:
```typescript
export interface AIScore {
  total: number        // Overall score (0-100)
  skills: number       // Skills assessment
  experience: number   // Experience assessment
  communication: number // Communication skills
}

export interface IApplication extends Document {
  // ... existing fields ...
  aiScore?: AIScore
  rank?: number
}
```

**Database Schema Updates** (Backend):
```javascript
aiScore: {
  total: { type: Number, default: 0 },
  skills: { type: Number, default: 0 },
  experience: { type: Number, default: 0 },
  communication: { type: Number, default: 0 },
},
rank: {
  type: Number,
  default: null,
  index: true
}
```

#### 2. **API Service Extensions**
**File**: `src/services/applicationService.ts`

Added new methods:
```typescript
getTopCandidates(limit = 20, jobId?) - Fetch top candidates
getJobTopCandidates(jobId, limit) - Get top candidates for a job
getCandidateRankings(filters) - Get ranking data with filters
```

#### 3. **Top Candidates Dashboard Component**
**File**: `src/components/TopCandidates.tsx`

Features:
- **Ranked table display** with rank badges
- **Score color coding** (Green: 85+, Blue: 70-84, Yellow: 55-69, Red: <55)
- **Multi-dimensional scoring** (Skills, Experience, Communication, Overall)
- **Candidate profiles** with avatars and emails
- **Status indicators** (Shortlisted, Accepted, Rejected, Pending)
- **Responsive design** with Tailwind CSS
- **Loading states** and error handling
- **Score legend** at bottom

#### 4. **Admin Candidate Rankings Page**
**File**: `src/pages/admin/candidate-rankings.tsx`

Features:
- **Dashboard statistics**
  - Total applications
  - Average, median, top, and lowest scores
  - Quality distribution (Excellent/Good/Moderate/Poor)
- **Filtering system**
  - Filter by job position
  - Filter by score range
  - Show top 10/20/50/100
- **Real-time ranking data**
- **Analytics cards** showing score distribution
- **Integration with TopCandidates component**

### Usage Example

```typescript
import TopCandidates from '@/components/TopCandidates'

// In your admin page
<TopCandidates 
  jobId={selectedJobId}  // Optional filter by job
  limit={20}              // Number of candidates to show
/>
```

---

## 📱 React Native Candidate App

### Project Structure
```
/workspaces/AirswiftMobile/
├── src/
│   ├── screens/
│   │   ├── LoginScreen.js           # Authentication
│   │   ├── CandidateDashboardScreen.js  # Main dashboard
│   │   └── MyDocumentsScreen.js     # Document management
│   ├── services/
│   │   ├── api.js                   # API client & services
│   │   └── socket.js                # Real-time features
│   └── components/                  # Reusable UI components
├── package.json
└── README.md
```

### Key Features Implemented

#### 1. **Shared API Service** (`src/services/api.js`)

Provides complete API client with:
- **Auto-refresh token** - Handles 401 errors automatically
- **Service methods** organized by feature:
  - `authService` - Login, register, logout, refresh
  - `applicationService` - Submit, view applications
  - `documentService` - Upload, view documents
  - `messageService` - Send/receive messages
  - `paymentService` - Payment management
  - `notificationService` - Notification handling
  - `userService` - Profile management

Example:
```javascript
// Login
const { accessToken, refreshToken } = await authService.login(email, password)

// Submit application
await applicationService.submitApplication(jobId, phone, cvFile, passportFile, nationalId)

// Upload document
await documentService.uploadDocument('cv', file)
```

#### 2. **Socket.IO Service** (`src/services/socket.js`)

Real-time features:
- **EventListeners**
  - Notifications
  - Messages
  - Document updates
  - Application status changes
  - Interview scheduling
  - Payment confirmation

- **Event emitters**
  - Send messages
  - Typing status
  - Call initiation
  - Document requests

Example:
```javascript
await initializeSocket()
setupSocketListeners({
  onNotification: (data) => { /* handle */ },
  onMessage: (data) => { /* handle */ },
  onDocumentUpdated: (data) => { /* handle */ }
})

socketEmit.sendMessage(receiverId, content)
```

#### 3. **Login Screen** (`src/screens/LoginScreen.js`)

Features:
- Email/password authentication
- Secure password input with show/hide toggle
- Loading states during authentication
- Error handling with alerts
- Navigation to dashboard on success
- Forgot password link
- Sign up link

```javascript
const handleLogin = async () => {
  const data = await authService.login(email, password)
  navigation.replace('CandidateDashboard')
}
```

#### 4. **Dashboard Screen** (`src/screens/CandidateDashboardScreen.js`)

Features:
- **Profile greeting** with user info
- **Quick statistics**
  - Total applications
  - Shortlisted count
  - Accepted count
  - Notifications
- **Quick action buttons**
  - New Application
  - My Documents
  - Messages
  - Payments
- **Recent applications list** with:
  - Job title
  - Status badge (with color coding)
  - Application stage
  - Date applied
- **Real-time integration** with Socket.IO
- **Pull-to-refresh** functionality
- **Logout button**

#### 5. **My Documents Screen** (`src/screens/MyDocumentsScreen.js`)

Features:
- **Document upload** for:
  - CV
  - Passport
  - National ID
- **Document listing** with:
  - Status (Pending, Approved, Rejected, Expired)
  - Upload date
  - Admin feedback display
- **Document actions**
  - Download
  - Delete
- **Status icons** and color coding
- **Pull-to-refresh**

---

## 🧑‍💼 React Native Admin App

### Project Structure
```
/workspaces/AirswiftAdminMobile/
├── src/
│   ├── screens/
│   │   ├── AdminDashboardScreen.js      # Main dashboard
│   │   ├── TopCandidatesScreen.js       # Ranked candidates
│   │   ├── DocumentReviewScreen.js      # Document review
│   │   └── ...
│   ├── services/
│   │   ├── api.js                       # Admin API client
│   │   └── socket.js                    # Admin socket events
│   └── components/
├── package.json
└── README.md
```

### Key Features Implemented

#### 1. **Admin API Service** (`src/services/api.js`)

Extended API client with admin-specific methods:
```javascript
adminApplicationService.getAllApplications()
adminApplicationService.getTopCandidates(limit)
adminApplicationService.getCandidateRankings(filters)
adminApplicationService.updateApplicationStatus(id, status, notes)

adminDocumentService.getAllDocuments(filters)
adminDocumentService.reviewDocument(id, status, feedback)

adminUserService.getAllUsers()
adminUserService.updateUserStatus(id, status)
adminUserService.getOnlineUsers()

adminAnalyticsService.getDashboardStats()
adminAnalyticsService.getApplicationStats()
adminAnalyticsService.getPaymentStats()
```

#### 2. **Admin Socket Service** (`src/services/socket.js`)

Admin-specific real-time features:
```javascript
// Listen for urgent events
setupAdminSocketListeners({
  onNewApplication: () => { },
  onDocumentUploaded: () => { },
  onDocumentNeedsReview: () => { },
  onPaymentReceived: () => { }
})

// Admin actions
adminSocketEmit.sendNotification(userId, title, message)
adminSocketEmit.sendBulkNotification(userIds, title, message)
adminSocketEmit.ReviewDocument(docId, status, feedback)
adminSocketEmit.broadcastAnnouncement(title, message)
```

#### 3. **Admin Dashboard Screen** (`src/screens/AdminDashboardScreen.js`)

Components:
- **Header** with notification badge
- **Key Statistics Cards**
  - Total users
  - Total applications
  - Online users
  - Pending documents (highlighted)
- **Quick action grid**
  - Top Candidates
  - Analytics
  - Messages
  - Payments
  - Documents
  - Settings
- **Metrics display**
  - Pending applications
  - Total revenue
  - Completion rate
  - Total payments
- **Bottom action buttons**
  - Review applications
  - Review documents
- **Notification system** with real-time updates

#### 4. **Top Candidates Screen** (`src/screens/TopCandidatesScreen.js`)

Features:
- **Ranked candidate list**
  - Rank badge (#1, #2, etc.)
  - Candidate name and email
  - Avatar with initials
- **Score breakdown**
  - Overall score (color-coded)
  - Skills score
  - Experience score
  - Communication score
- **Status indicator** (Shortlisted, Pending, etc.)
- **View profile button**
- **Filtering and pagination**
  - Show top 10/20/50
  - Refresh data
- **Target rate loading** states

#### 5. **Document Review Screen** (`src/screens/DocumentReviewScreen.js`)

Workflow:
1. **Document Queue**
   - List of pending documents
   - Filter by status (Pending, Approved, Rejected)
   - Document type icon
   - Candidate name
   - Upload date

2. **Review Workflow**
   - Document details display
   - File preview/download button
   - Feedback textarea
   - Approve button
   - Reject button

3. **Smart UI**
   - Back button to return to list
   - Loading states during submission
   - Error handling
   - Success notifications

```javascript
// Approve document
await adminDocumentService.reviewDocument(docId, 'approved', feedback)

// Reject document  
await adminDocumentService.reviewDocument(docId, 'rejected', feedback)
```

---

## 🔧 Backend Integration

### Required Backend Updates

#### 1. **Application Model** (MongoDB)
```javascript
const applicationSchema = new Schema({
  // ... existing fields ...
  aiScore: {
    total: Number,
    skills: Number,
    experience: Number,
    communication: Number
  },
  rank: Number
})
```

#### 2. **Ranking Service** (backend)

Create `services/rankingService.js`:
```javascript
exports.rankCandidates = async (jobId) => {
  const apps = await Application.find({ job: jobId });
  const sorted = apps.sort((a, b) => b.aiScore.total - a.aiScore.total);
  
  for (let i = 0; i < sorted.length; i++) {
    sorted[i].rank = i + 1;
    await sorted[i].save();
  }
  
  return sorted;
};

exports.getTopCandidates = async (req, res) => {
  const top = await Application.find()
    .sort({ 'aiScore.total': -1 })
    .limit(req.query.limit || 20)
    .populate('user job');
    
  res.json(top);
};
```

#### 3. **API Routes** (backend)

```javascript
// routes/applications.js
router.get('/top-candidates', adminOnly, getTopCandidates);
router.get('/rankings', adminOnly, getCandidateRankings);
router.get('/job/:jobId/top-candidates', getJobTopCandidates);
```

#### 4. **JWT Refresh Token System** (backend)

```javascript
// Login endpoint
const accessToken = jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '15m' }
);

const refreshToken = jwt.sign(
  { id: user._id },
  process.env.REFRESH_SECRET,
  { expiresIn: '7d' }
);

user.refreshToken = refreshToken;
await user.save();

res.json({ accessToken, refreshToken });

// Refresh endpoint
exports.refreshToken = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.sendStatus(401);
  
  const user = await User.findOne({ refreshToken: token });
  if (!user) return res.sendStatus(403);
  
  jwt.verify(token, process.env.REFRESH_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    
    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    res.json({ accessToken: newAccessToken });
  });
};
```

#### 5. **Socket.IO Admin Events** (backend)

```javascript
const adminNamespace = io.of('/admin');

adminNamespace.on('connection', (socket) => {
  console.log('Admin connected:', socket.id);
  
  // Join admin room
  socket.on('joinAdminRoom', (userId) => {
    socket.join(`admin:${userId}`);
  });
  
  // Broadcast new application
  socket.emit('newApplication', applicationData);
  
  // Document review action
  socket.on('reviewDocument', async (data) => {
    await Document.findByIdAndUpdate(data.documentId, {
      status: data.status,
      feedback: data.feedback
    });
    socket.emit('documentReviewed', data);
  });
});
```

---

## 🔐 Security & Authentication

### Mobile App Security

#### 1. **Token Storage**
```javascript
// Store tokens in AsyncStorage (encrypted on device)
await AsyncStorage.setItem('token', accessToken)
await AsyncStorage.setItem('refreshToken', refreshToken)
```

#### 2. **Automatic Token Refresh**
```javascript
// API interceptor
api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      const refresh = await AsyncStorage.getItem('refreshToken')
      const res = await axios.post('/auth/refresh', { token: refresh })
      await AsyncStorage.setItem('token', res.data.accessToken)
      // Retry original request
      return api(originalRequest)
    }
    return Promise.reject(err)
  }
)
```

#### 3. **Secured API Requests**
```javascript
// All requests automatically include JWT token
// via Authorization header
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

---

## 📡 Real-Time Features

### Socket.IO Integration

#### 1. **Candidate App Events**
```javascript
// Listen for updates
socket.on('notification', handleNotification)
socket.on('documentUpdated', handleDocumentUpdate)
socket.on('applicationStatusChanged', handleStatusChange)

// Emit actions
socketEmit.sendMessage(receiverId, content)
socketEmit.joinConversation(conversationId)
```

#### 2. **Admin App Events**
```javascript
// Listen for urgent updates
socket.on('newApplication', handleNewApp)
socket.on('documentUploaded', handleDocUpload)
socket.on('paymentReceived', handlePayment)

// Admin actions
adminSocketEmit.sendNotification(userId, title, message)
adminSocketEmit.broadcastAnnouncement(title, message)
```

---

## 🚀 Deployment Guide

### Frontend Web Dashboard
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Deploy to Vercel/Firebase/AWS
# (See DEPLOYMENT.md for details)
```

### Candidate Mobile App
```bash
# Install dependencies
npm install

# Build iOS
expo build:ios

# Build Android
expo build:android

# Or publish to Expo
expo publish
```

### Admin Mobile App
```bash
# Install dependencies
npm install

# Build iOS
expo build:ios

# Build Android
expo build:android
```

### Backend Integration
1. Update Application model with AI scoring
2. Implement ranking service
3. Add refresh token system
4. Set up Socket.IO admin events
5. Configure environment variables

---

## 📊 Next Steps

### Phase 1: Backend Setup ✅
- [ ] Extend Application model
- [ ] Implement ranking service
- [ ] Add JWT refresh tokens
- [ ] Set up Redis for Socket.IO (if scaling)

### Phase 2: Frontend Dashboard ✅
- [x] TopCandidates component
- [x] Candidate rankings page
- [x] API service updates

### Phase 3: Mobile Apps ✅
- [x] Candidate app structure
- [x] Admin app structure
- [x] Shared services

### Phase 4: Testing & Deployment
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance optimization
- [ ] Security audit
- [ ] Production deployment

---

## 🔗 Related Documentation

- **Main Frontend**: `/workspaces/Airswift-Frontend/README.md`
- **Candidate Mobile**: `/workspaces/AirswiftMobile/README.md`
- **Admin Mobile**: `/workspaces/AirswiftAdminMobile/README.md`
- **Backend Repo**: (Separate repository)

---

## 📞 Support

For questions or issues:
1. Check the READMEs in each project
2. Review code comments
3. Contact the development team
4. Create an issue in the repository

---

## 📝 License

Proprietary - Airswift Inc.

All code and documentation are proprietary and confidential.
