export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * 🔥 Enhanced date formatting with time (en-KE locale)
 * @example formatDateTime('2026-04-17T15:42:00') => "17 April 2026, 15:42"
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A'
  try {
    return new Date(date).toLocaleString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (error) {
    console.warn('Date formatting error:', error)
    return 'Invalid date'
  }
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount)
}

export const truncateText = (text: string, length: number): string => {
  return text.length > length ? `${text.substring(0, length)}...` : text
}

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
}

/**
 * Ensures a value is an array. Returns the value if it's already an array,
 * otherwise returns the provided fallback (default empty array).
 * @example ensureArray(null, []) => []
 * @example ensureArray([1, 2], []) => [1, 2]
 */
export const ensureArray = <T,>(value: T | T[] | null | undefined, fallback: T[] = []): T[] => {
  if (Array.isArray(value)) return value
  return fallback
}