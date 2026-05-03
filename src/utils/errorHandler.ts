/**
 * Standardized API Error Handler
 * Provides consistent error handling across all API calls
 * Follows AIRSWIFT API Guide
 */

interface ApiError {
  code: string
  message: string
  details?: any
  status?: number
}

export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response

    switch (status) {
      case 400:
        return {
          code: 'VALIDATION_ERROR',
          message: data.message || 'Invalid request',
          details: data.details || null,
          status
        }
      case 401:
        return {
          code: 'UNAUTHORIZED',
          message: 'Authentication failed. Please login again.',
          status
        }
      case 403:
        return {
          code: 'FORBIDDEN',
          message: 'You do not have permission to perform this action',
          status
        }
      case 404:
        return {
          code: 'NOT_FOUND',
          message: data.message || 'Resource not found',
          status
        }
      case 409:
        return {
          code: 'CONFLICT',
          message: data.message || 'Resource already exists',
          status
        }
      case 413:
        return {
          code: 'FILE_TOO_LARGE',
          message: 'File size exceeds maximum limit (10MB)',
          status
        }
      case 429:
        return {
          code: 'RATE_LIMITED',
          message: 'Too many requests. Please try again later.',
          status
        }
      case 500:
        return {
          code: 'SERVER_ERROR',
          message: 'Server error. Please try again later.',
          status
        }
      default:
        return {
          code: 'UNKNOWN_ERROR',
          message: data.message || 'An unexpected error occurred',
          status
        }
    }
  } else if (error.request) {
    // Request made but no response
    return {
      code: 'NO_RESPONSE',
      message: 'No response from server. Check your connection.'
    }
  } else {
    // Error in request setup
    return {
      code: 'REQUEST_ERROR',
      message: error.message || 'An error occurred'
    }
  }
}

/**
 * Wrapper for API calls with standardized error handling
 */
export const withErrorHandler = async <T>(apiCall: () => Promise<T>): Promise<T> => {
  try {
    return await apiCall()
  } catch (error) {
    const apiError = handleApiError(error)
    throw apiError
  }
}

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error: ApiError | any): string => {
  if (error?.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}
