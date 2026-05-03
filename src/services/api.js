import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10),
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // ✅ DO NOT immediately remove token
      // Token might be temporarily invalid; let the app handle logout
      console.warn('Unauthorized (401) - Token may be expired or invalid');
      
      // Only redirect to login if specifically needed
      if (typeof window !== 'undefined') {
        // Optionally redirect after a delay or on user action
        console.warn('Please refresh or log in again');
      }
    }
    return Promise.reject(error);
  }
);

export default api;