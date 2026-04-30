import axios from 'axios'

// ✅ FIXED: API Configuration with Axios Interceptors
// This file provides automatic Authorization header handling

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.REACT_APP_API_URL || 'https://airswift-backend-fjt3.onrender.com/api'
const normalizedBaseUrl = rawApiUrl.replace(/\/+$/, '')
const baseURL = normalizedBaseUrl.endsWith('/api')
  ? normalizedBaseUrl
  : `${normalizedBaseUrl}/api`

// Create axios instance with base configuration
const api = axios.create({
  baseURL,
  withCredentials: true, // Include cookies for authentication
})

console.log('📡 API baseURL set to:', baseURL)

// ✅ REQUEST INTERCEPTOR: Add Authorization header with Bearer token
api.interceptors.request.use((config) => {
  const url = config.url || ''
  const token = localStorage.getItem('token')

  const isAuthRequest = url.includes('/auth/login') ||
                       url.includes('/auth/register') ||
                       url.includes('/auth/google')

  console.log('📤 API REQUEST INTERCEPTOR:')
  console.log('   URL:', url)
  console.log('   Method:', config.method?.toUpperCase())
  console.log('   Token in localStorage:', token ? '✓ EXISTS' : '✗ MISSING')

  if (!isAuthRequest && token) {
    config.headers.Authorization = `Bearer ${token}`
    console.log('   ✅ Authorization header set: Bearer [token]')
  } else if (!isAuthRequest && !token) {
    console.warn('   ⚠️ No token found - request may fail with 401')
  } else {
    console.log('   ℹ️ Skipping Authorization header for auth request')
  }

  return config
})

// ✅ RESPONSE INTERCEPTOR: Handle authentication errors
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      // ✅ DO NOT immediately remove token on 401
      console.warn("Unauthorized (401) - Token may be expired or invalid");
      // The token will be handled by the app's auth logic
      // Token removal should only happen on explicit logout
    }
    return Promise.reject(err);
  }
)

export default api

