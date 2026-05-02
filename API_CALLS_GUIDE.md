# Frontend API Calls Guide - AIRSWIFT

Complete guide for making API calls from the frontend to the AIRSWIFT backend. Includes authentication, all endpoints, error handling, and practical examples.

---

## Table of Contents
1. [Setup & Configuration](#setup--configuration)
2. [Authentication](#authentication)
3. [API Client Instance](#api-client-instance)
4. [Error Handling](#error-handling)
5. [Auth Endpoints](#auth-endpoints)
6. [Jobs Endpoints](#jobs-endpoints)
7. [Applications Endpoints](#applications-endpoints)
8. [Profile Endpoints](#profile-endpoints)
9. [Interviews Endpoints](#interviews-endpoints)
10. [Messages Endpoints](#messages-endpoints)
11. [Notifications Endpoints](#notifications-endpoints)
12. [Admin Endpoints](#admin-endpoints)
13. [Real-time (WebSocket)](#real-time-websocket)
14. [Best Practices](#best-practices)

---

## Setup & Configuration

### Environment Variables

Create `.env.local` in your frontend project:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_API_TIMEOUT=30000
```

For production:

```bash
NEXT_PUBLIC_API_URL=https://api.airswift.com/api
NEXT_PUBLIC_SOCKET_URL=https://api.airswift.com
```

### Install Dependencies

```bash
npm install axios socket.io-client
```

---

## Authentication

### Token Storage Strategy

The repository uses `localStorage` for the active token and also preserves the refresh token when available.

```javascript
const storeTokens = (accessToken, refreshToken) => {
  localStorage.setItem('token', accessToken)
  localStorage.setItem('accessToken', accessToken)
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken)
  }
}

const getAccessToken = () =>
  localStorage.getItem('token') || localStorage.getItem('accessToken')

const getRefreshToken = () => localStorage.getItem('refreshToken')

const clearTokens = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}
```

> In this repo, the main API client reads `token` first, then falls back to `accessToken`.

---

## API Client Instance

### Axios Instance with Interceptors

The frontend uses `src/lib/api.ts` as the centralized HTTP client. It is re-exported by `src/services/apiClient.ts`.

```javascript
import axios from 'axios'

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const normalizedBaseUrl = rawApiUrl.replace(/\/+$`, '')
const baseURL = normalizedBaseUrl.endsWith('/api')
  ? normalizedBaseUrl
  : `${normalizedBaseUrl}/api`

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})
```

### Request Interceptor

Adds the JWT token from `localStorage` to every request except public auth endpoints.

```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
  const url = config.url || ''
  const isAuthRequest = url.includes('/auth/login') ||
                       url.includes('/auth/register') ||
                       url.includes('/auth/google')

  if (!isAuthRequest && token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### Response Interceptor

Handles expired tokens by attempting refresh before redirecting to login.

```javascript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refreshToken')

      if (refreshToken) {
        try {
          const refreshResponse = await axios.post(
            `${baseURL}/auth/refresh`,
            { refreshToken },
            { withCredentials: true }
          )

          const newToken = refreshResponse.data?.token || refreshResponse.data?.accessToken
          if (newToken) {
            localStorage.setItem('token', newToken)
            localStorage.setItem('accessToken', newToken)
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return api(originalRequest)
          }
        } catch (refreshError) {
          console.warn('Token refresh failed', refreshError)
        }
      }

      localStorage.removeItem('token')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)
```

---

## Error Handling

### Standard Error Response Handler

```javascript
export const handleApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response

    switch (status) {
      case 400:
        return {
          code: 'VALIDATION_ERROR',
          message: data.message || 'Invalid request',
          details: data.details || null
        }
      case 401:
        return {
          code: 'UNAUTHORIZED',
          message: 'Authentication failed. Please login again.'
        }
      case 403:
        return {
          code: 'FORBIDDEN',
          message: 'You do not have permission to perform this action'
        }
      case 404:
        return {
          code: 'NOT_FOUND',
          message: data.message || 'Resource not found'
        }
      case 409:
        return {
          code: 'CONFLICT',
          message: data.message || 'Resource already exists'
        }
      case 413:
        return {
          code: 'FILE_TOO_LARGE',
          message: 'File size exceeds maximum limit (10MB)'
        }
      case 429:
        return {
          code: 'RATE_LIMITED',
          message: 'Too many requests. Please try again later.'
        }
      case 500:
        return {
          code: 'SERVER_ERROR',
          message: 'Server error. Please try again later.'
        }
      default:
        return {
          code: 'UNKNOWN_ERROR',
          message: data.message || 'An unexpected error occurred'
        }
    }
  } else if (error.request) {
    return {
      code: 'NO_RESPONSE',
      message: 'No response from server. Check your connection.'
    }
  }

  return {
    code: 'REQUEST_ERROR',
    message: error.message || 'An error occurred'
  }
}
```

### Usage Example

```javascript
try {
  const response = await API.post('/auth/login', data)
} catch (error) {
  const result = handleApiError(error)
  console.error(result.code, result.message)
}
```

---

## Auth Endpoints

### 1. Register

```javascript
export const register = async (userData) => {
  try {
    const response = await API.post('/auth/register', {
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: userData.password
    })
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

### 2. Verify Registration OTP

```javascript
export const verifyRegistrationOTP = async (email, otp) => {
  try {
    const response = await API.post('/auth/verify-registration-otp', { email, otp })
    const { accessToken, refreshToken, user } = response.data
    localStorage.setItem('token', accessToken)
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(user))
    return { user, accessToken }
  } catch (error) {
    throw handleApiError(error)
  }
}
```

### 3. Send Login OTP

```javascript
export const sendLoginOTP = async (email) => {
  try {
    const response = await API.post('/auth/send-login-otp', { email })
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

### 4. Verify Login OTP

```javascript
export const verifyLoginOTP = async (email, otp) => {
  try {
    const response = await API.post('/auth/verify-login-otp', {
      email,
      otp
    })
    const { accessToken, refreshToken, user } = response.data
    localStorage.setItem('token', accessToken)
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(user))
    return { user, accessToken }
  } catch (error) {
    throw handleApiError(error)
  }
}
```

### 5. Get Current User

```javascript
export const getCurrentUser = async () => {
  try {
    const response = await API.get('/auth/me')
    return response.data.user
  } catch (error) {
    throw handleApiError(error)
  }
}
```

### 6. Change Password

```javascript
export const changePassword = async (oldPassword, newPassword) => {
  try {
    const response = await API.put('/auth/change-password', {
      oldPassword,
      newPassword
    })
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

### 7. Forgot Password

```javascript
export const forgotPassword = async (email) => {
  try {
    const response = await API.post('/auth/forgot-password', { email })
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

### 8. Reset Password

```javascript
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await API.post(`/auth/reset-password/${token}`, {
      password: newPassword
    })
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

### 9. Logout

```javascript
export const logout = async () => {
  try {
    await API.post('/auth/logout')
  } catch (error) {
    // Clear tokens regardless of failure
  } finally {
    clearTokens()
  }
}
```

---

## Jobs Endpoints

### 1. Get All Jobs (Public)

```javascript
export const getJobs = async (page = 1, limit = 10) => {
  try {
    const response = await API.get('/jobs', { params: { page, limit } })
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

### 2. Search Jobs (Advanced)

```javascript
export const searchJobs = async (filters) => {
  try {
    const response = await API.get('/jobs/search', {
      params: {
        keyword: filters.keyword,
        location: filters.location,
        category: filters.category,
        minSalary: filters.minSalary,
        maxSalary: filters.maxSalary,
        remote: filters.remote,
        type: filters.type,
        page: filters.page || 1,
        limit: filters.limit || 10
      }
    })
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

### 3. Get Single Job

```javascript
export const getJobById = async (jobId) => {
  try {
    const response = await API.get(`/jobs/${jobId}`)
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

### 4. Get Job Categories

```javascript
export const getJobCategories = async () => {
  try {
    const response = await API.get('/jobs/categories')
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

---

## Applications Endpoints

### 1. Submit Application

```javascript
export const submitApplication = async (jobId, formData) => {
  try {
    const data = new FormData()
    data.append('jobId', jobId)
    data.append('cv', formData.cv)
    data.append('passport', formData.passport)
    data.append('nationalId', formData.nationalId)
    data.append('coverLetter', formData.coverLetter || '')

    const response = await API.post('/applications', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

### 2. Get My Applications

```javascript
export const getMyApplications = async () => {
  try {
    const response = await API.get('/applications')
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

### 3. Check if User Applied

```javascript
export const checkApplicationStatus = async () => {
  try {
    const response = await API.get('/applications/check')
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

### 4. Get Application Job Options

```javascript
export const getApplicationJobOptions = async () => {
  try {
    const response = await API.get('/applications/job-options')
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

---

## Profile Endpoints

### 1. Get Profile

```javascript
export const getProfile = async () => {
  try {
    const response = await API.get('/profile')
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

### 2. Update Profile

```javascript
export const updateProfile = async (profileData) => {
  try {
    const response = await API.put('/profile', profileData)
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

### 3. Upload CV

```javascript
export const uploadCV = async (cvFile, onUploadProgress) => {
  try {
    const data = new FormData()
    data.append('cv', cvFile)

    const response = await API.post('/profile/cv-upload', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    })

    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

### 4. Setup Profile (First Time)

```javascript
export const setupProfile = async (profileData, cvFile) => {
  try {
    const data = new FormData()
    data.append('name', profileData.name)
    data.append('phone', profileData.phone)
    data.append('location', profileData.location)
    data.append('bio', profileData.bio)
    data.append('skills', profileData.skills)
    if (cvFile) data.append('cv', cvFile)

    const response = await API.post('/profile/setup-profile', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

---

## Interviews Endpoints

### 1. Get My Interviews

```javascript
export const getMyInterviews = async () => {
  try {
    const response = await API.get('/interviews/my')
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

### 2. Get Interview Details

```javascript
export const getInterviewDetails = async (interviewId) => {
  try {
    const response = await API.get(`/interviews/${interviewId}`)
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

### 3. Submit Interview Responses

```javascript
export const submitInterviewResponses = async (interviewId, answers) => {
  try {
    const response = await API.post('/interviews/submit', {
      interviewId,
      answers
    })
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

### 4. Create Voice Interview Session

```javascript
export const createVoiceInterviewSession = async (interviewId) => {
  try {
    const response = await API.post('/interviews/session', { interviewId })
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

### 5. Score Response

```javascript
export const scoreResponse = async (interviewId, questionId, responseText) => {
  try {
    const response = await API.post('/interviews/score', {
      interviewId,
      questionId,
      response: responseText
    })
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

---

## Messages Endpoints

### 1. Send Message

```javascript
export const sendMessage = async (recipientId, content) => {
  try {
    const response = await API.post('/messages', {
      recipientId,
      content,
      attachments: []
    })
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

### 2. Get Messages

```javascript
export const getMessages = async (userId, page = 1, limit = 20) => {
  try {
    const response = await API.get('/messages', {
      params: { userId, page, limit }
    })
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

### 3. Get Recent Messages (Conversations)

```javascript
export const getRecentMessages = async () => {
  try {
    const response = await API.get('/messages/recent')
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

### 4. Mark Messages as Read

```javascript
export const markMessagesAsRead = async (messageIds) => {
  try {
    const response = await API.put('/messages/mark-as-read', {
      messageIds
    })
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

---

## Notifications Endpoints

### 1. Get Notifications

```javascript
export const getNotifications = async (page = 1, limit = 20) => {
  try {
    const response = await API.get('/notifications', {
      params: { page, limit }
    })
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

### 2. Get Unread Count

```javascript
export const getUnreadNotificationCount = async () => {
  try {
    const response = await API.get('/notifications/unread-count')
    return response.data
  } catch (error) {
    return 0
  }
}
```

### 3. Mark Notification as Read

```javascript
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await API.put(`/notifications/${notificationId}`)
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

### 4. Mark All as Read

```javascript
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await API.put('/notifications/mark-all-read')
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

### 5. Delete Notification

```javascript
export const deleteNotification = async (notificationId) => {
  try {
    const response = await API.delete(`/notifications/${notificationId}`)
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

---

## Admin Endpoints

### 1. Get Dashboard Stats

```javascript
export const getAdminDashboardStats = async () => {
  try {
    const response = await API.get('/admin')
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

### 2. Get All Users

```javascript
export const getAllUsers = async () => {
  try {
    const response = await API.get('/admin/users')
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

### 3. Create User

```javascript
export const createUser = async (userData) => {
  try {
    const response = await API.post('/admin/users', userData)
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

### 4. Get All Applications

```javascript
export const getAdminApplications = async (filters = {}) => {
  try {
    const response = await API.get('/applications/admin', {
      params: {
        page: filters.page || 1,
        limit: filters.limit || 10,
        status: filters.status,
        jobId: filters.jobId
      }
    })
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

### 5. Update Application Status

```javascript
export const updateApplicationStatus = async (appId, newStatus, notes = '') => {
  try {
    const response = await API.put(
      `/applications/admin/application/${appId}/status`,
      { status: newStatus, notes }
    )
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

### 6. Get All Interviews (Admin)

```javascript
export const getAdminInterviews = async (filters = {}) => {
  try {
    const response = await API.get('/interviews/admin', {
      params: {
        page: filters.page || 1,
        limit: filters.limit || 10,
        status: filters.status,
        jobId: filters.jobId
      }
    })
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

### 7. Create Interview (Admin)

```javascript
export const createInterview = async (interviewData) => {
  try {
    const response = await API.post('/interviews', interviewData)
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}
```

---

## Real-time (WebSocket)

### Setup Socket Connection

The repository already includes `src/services/socket.ts` for authenticated Socket.IO connections.

```javascript
import { initSocket, getSocket, disconnectSocket } from '@/services/socket'

const socket = initSocket()
```

### Listen for Events

```javascript
useEffect(() => {
  const socket = getSocket()
  if (!socket) return

  socket.on('statusUpdate', (data) => {
    console.log('Application status updated:', data)
  })

  socket.on('interviewScheduled', (data) => {
    console.log('Interview scheduled:', data)
  })

  socket.on('newMessage', (data) => {
    console.log('New message received:', data)
  })

  socket.on('notification', (data) => {
    console.log('Notification:', data)
  })

  return () => {
    socket.off('statusUpdate')
    socket.off('interviewScheduled')
    socket.off('newMessage')
    socket.off('notification')
  }
}, [])
```

### Emit Events

```javascript
const socket = getSocket()
if (!socket) return
socket.emit('joinRoom', { userId: currentUserId })
```

---

## Best Practices

### 1. Request/Response Pattern

```javascript
const apiFunction = async (params) => {
  try {
    if (!params.requiredField) {
      throw new Error('Required field is missing')
    }

    const response = await API.post('/endpoint', params)
    return { success: true, data: response.data }
  } catch (error) {
    throw handleApiError(error)
  }
}
```

### 2. Loading & Error States

```javascript
const [data, setData] = useState(null)
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)

useEffect(() => {
  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await apiFunction()
      setData(result.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  fetchData()
}, [])
```

### 3. Debounced Search

```javascript
import { debounce } from 'lodash'

const handleSearch = debounce(async (query) => {
  try {
    const results = await searchJobs({ keyword: query })
    setSearchResults(results.jobs)
  } catch (error) {
    console.error('Search error:', error)
  }
}, 300)
```

### 4. Cancel Requests

```javascript
const source = axios.CancelToken.source()

const fetchData = async () => {
  try {
    const response = await API.get('/endpoint', { cancelToken: source.token })
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('Request cancelled')
    }
  }
}

source.cancel('Request cancelled by user')
```

### 5. Batch Requests

```javascript
const fetchBatchData = async () => {
  try {
    const [jobs, applications, interviews] = await Promise.all([
      getJobs(),
      getMyApplications(),
      getMyInterviews()
    ])
    setJobs(jobs)
    setApplications(applications)
    setInterviews(interviews)
  } catch (error) {
    handleApiError(error)
  }
}
```

### 6. Retry Logic

```javascript
const apiCallWithRetry = async (apiFunction, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiFunction()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000))
    }
  }
}
```

### 7. Caching Responses

```javascript
const cache = new Map()

const getCachedData = async (key, apiFunction, ttl = 5000) => {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data
  }

  const data = await apiFunction()
  cache.set(key, { data, timestamp: Date.now() })
  return data
}
```

---

**Last Updated**: May 2026
**API Version**: v1.0.0
**Frontend Framework**: Next.js 14+
