/**
 * ✅ CENTRALIZED API FETCH HELPER
 * 
 * This is the SINGLE SOURCE OF TRUTH for all API calls.
 * Every API response is normalized and validated before returning.
 * 
 * 🔥 KEY FEATURES:
 * 1. Always returns data only (no response wrapper)
 * 2. Validates that arrays are arrays before returning
 * 3. Provides safe defaults for missing data
 * 4. Handles both axios responses and raw fetch
 * 5. Logs all API interactions for debugging
 */

import API from '@/services/apiClient';

interface APIResponse<T = any> {
  data?: T;
  success?: boolean;
  message?: string;
  [key: string]: any;
}

/**
 * Centralized fetch wrapper that handles all API response patterns
 * 
 * Usage:
 *   const data = await fetchData('/api/users');
 *   const settings = await fetchData('/api/settings/category/general');
 */
export const fetchData = async <T = any>(
  url: string,
  options?: any
): Promise<T> => {
  try {
    console.log(`📡 API FETCH: ${options?.method || 'GET'} ${url}`);
    
    const response = await API(url, {
      method: 'GET',
      ...options,
    });

    // Always extract the data portion of the response
    const result = response.data || {};
    
    console.log(`✅ API RESPONSE: ${url}`, result);

    // Return only the data - always
    // Handle various response structures from backend
    if (result.success === false) {
      throw new Error(result.message || 'API request failed');
    }

    // Some endpoints return data nested in .data property
    // Others return data directly
    // This handles both patterns
    return result.data ?? result;
  } catch (error: any) {
    console.error(`❌ API ERROR: ${url}`, {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

/**
 * Safe array converter - ensures we always get an array
 * 
 * Usage:
 *   const items = await fetchData('/api/items');
 *   const safeItems = ensureArray(items);
 *   safeItems.map(item => ...)  // ✅ Safe now
 */
export const ensureArray = <T = any>(value: any, fallback: T[] = []): T[] => {
  if (Array.isArray(value)) {
    return value;
  }
  
  // Handle common patterns where data is nested
  if (value?.items && Array.isArray(value.items)) {
    return value.items;
  }
  if (value?.data && Array.isArray(value.data)) {
    return value.data;
  }
  if (value?.list && Array.isArray(value.list)) {
    return value.list;
  }
  if (value?.results && Array.isArray(value.results)) {
    return value.results;
  }
  
  // If it's a single object but we need an array, wrap it
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return [value];
  }
  
  return fallback;
};

/**
 * Safe object extractor - ensures we have an object
 * 
 * Usage:
 *   const dashboard = await fetchData('/api/admin/dashboard');
 *   const safeDashboard = ensureObject(dashboard);
 *   safeDashboard.stats?.total // ✅ Safe now
 */
export const ensureObject = <T extends Record<string, any> = any>(
  value: any,
  fallback: T = {} as T
): T => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value;
  }
  return fallback;
};

/**
 * Extract safe array from common response patterns
 * 
 * Usage:
 *   const logs = await fetchData('/api/audit-logs');
 *   const safeLogs = getSafeArray(logs, 'logs');
 *   safeLogs.map(log => ...)  // ✅ Safe
 */
export const getSafeArray = <T = any>(
  data: any,
  key?: string,
  fallback: T[] = []
): T[] => {
  if (Array.isArray(data)) {
    return data;
  }

  // If key is specified, try to extract from that key
  if (key && typeof data === 'object' && data !== null) {
    const extracted = data[key];
    if (Array.isArray(extracted)) {
      return extracted;
    }
  }

  // Try common array key patterns
  const arrayKeys = ['items', 'data', 'list', 'results', 'records', 'logs'];
  for (const arrayKey of arrayKeys) {
    if (typeof data === 'object' && data !== null) {
      const extracted = data[arrayKey];
      if (Array.isArray(extracted)) {
        return extracted;
      }
    }
  }

  return fallback;
};

/**
 * Post data and get normalized response
 */
export const postData = async <T = any>(
  url: string,
  payload: any,
  options?: any
): Promise<T> => {
  return fetchData(url, {
    method: 'POST',
    data: payload,
    ...options,
  });
};

/**
 * Put data and get normalized response
 */
export const putData = async <T = any>(
  url: string,
  payload: any,
  options?: any
): Promise<T> => {
  return fetchData(url, {
    method: 'PUT',
    data: payload,
    ...options,
  });
};

/**
 * Delete and get normalized response
 */
export const deleteData = async <T = any>(
  url: string,
  options?: any
): Promise<T> => {
  return fetchData(url, {
    method: 'DELETE',
    ...options,
  });
};

export default fetchData;
