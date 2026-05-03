/**
 * API Best Practices Utilities
 * Implements patterns from AIRSWIFT API Guide
 * Includes: debounced requests, batch operations, retry logic, caching
 */

import axios from 'axios'

/**
 * Debounced API Call (e.g., for search)
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 */
export const debounceApiCall = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number = 300
): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
  let timeoutId: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    return new Promise((resolve, reject) => {
      clearTimeout(timeoutId)

      timeoutId = setTimeout(async () => {
        try {
          const result = await fn(...args)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }, delay)
    })
  }
}

/**
 * Batch API Requests
 * Makes multiple parallel requests and returns all results
 */
export const batchRequests = async <T>(requests: Promise<T>[]): Promise<T[]> => {
  try {
    return await Promise.all(requests)
  } catch (error) {
    console.error('Batch request failed:', error)
    throw error
  }
}

/**
 * Retry Logic with Exponential Backoff
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retry attempts
 * @param backoffMultiplier - Exponential backoff multiplier
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  backoffMultiplier: number = 1000
): Promise<T> => {
  let lastError: any

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // If this is the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        throw error
      }

      // Calculate delay with exponential backoff
      const delay = backoffMultiplier * Math.pow(2, attempt)
      console.warn(
        `Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`,
        error
      )

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

/**
 * Response Caching with TTL
 */
class ResponseCache {
  private cache = new Map<string, { data: any; timestamp: number }>()

  get<T>(key: string, ttl: number = 5000): T | null {
    const cached = this.cache.get(key)

    if (!cached) {
      return null
    }

    // Check if cache has expired
    if (Date.now() - cached.timestamp > ttl) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  clear(): void {
    this.cache.clear()
  }

  remove(key: string): void {
    this.cache.delete(key)
  }
}

export const responseCache = new ResponseCache()

/**
 * Get cached data or fetch fresh data
 */
export const getCachedData = async <T>(
  key: string,
  apiFunction: () => Promise<T>,
  ttl: number = 60000
): Promise<T> => {
  // Try to get from cache first
  const cached = responseCache.get<T>(key, ttl)
  if (cached) {
    console.log(`✅ Using cached data for key: ${key}`)
    return cached
  }

  // Fetch fresh data
  const data = await apiFunction()

  // Store in cache
  responseCache.set(key, data)

  return data
}

/**
 * Cancel Request Support
 * Creates a cancellation token source
 */
export const createCancelToken = () => {
  return axios.CancelToken.source()
}

/**
 * Check if error is from cancellation
 */
export const isCancelledRequest = (error: any): boolean => {
  return axios.isCancel(error)
}

/**
 * Request Factory with Standardized Error Handling
 */
export const createApiRequest = <T>(
  apiCall: () => Promise<T>,
  options: {
    retry?: number
    cache?: number
    timeout?: number
    onRetry?: (attempt: number) => void
  } = {}
) => {
  return async (): Promise<T> => {
    const {
      retry = 1,
      cache = 0,
      onRetry = () => {},
    } = options

    // Try cache first if enabled
    if (cache > 0) {
      const cacheKey = apiCall.toString()
      const cached = responseCache.get<T>(cacheKey, cache)
      if (cached) return cached
    }

    // Retry logic
    for (let attempt = 0; attempt < retry; attempt++) {
      try {
        const result = await apiCall()

        // Cache if enabled
        if (cache > 0) {
          responseCache.set(apiCall.toString(), result)
        }

        return result
      } catch (error) {
        if (attempt < retry - 1) {
          onRetry(attempt + 1)
          // Exponential backoff
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          )
        } else {
          throw error
        }
      }
    }

    throw new Error('Request failed after retries')
  }
}
