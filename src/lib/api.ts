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
  headers: {
    'Content-Type': 'application/json'
  }
})

console.log('📡 API baseURL set to:', baseURL)

// ✅ REQUEST INTERCEPTOR: Add Authorization header with Bearer token
api.interceptors.request.use((config) => {
  const url = config.url || ''
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken')

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

// ✅ RESPONSE INTERCEPTOR: Handle authentication errors and refresh expired tokens
api.interceptors.response.use(
  res => res,
  async (err) => {
    const originalRequest = err.config

    if (err.response?.status === 401 && originalRequest && !originalRequest._retry) {
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
          console.warn('🔄 Token refresh failed:', refreshError)
        }
      }

      localStorage.removeItem('token')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
    }

    return Promise.reject(err)
  }
)

export default api

