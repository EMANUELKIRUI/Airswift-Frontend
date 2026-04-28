/**
 * ✅ FRONTEND SAFE STATE HANDLING BEST PRACTICES
 * 
 * This guide shows how to properly handle API responses to prevent crashes like:
 *   TypeError: eZ.map is not a function
 * 
 * The root cause: Backend returns data in various structures, but frontend assumes
 * it's always an array or specific format
 * 
 * KEY PATTERNS:
 * 1. Always use ensureArray() before calling .map() on API responses
 * 2. Use fetchData() for all API calls - it handles error cases
 * 3. Provide safe defaults in catch blocks
 * 4. Never assume response structure - validate with helper functions
 */

import { fetchData, ensureArray } from '@/utils/fetchData'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ GOOD PATTERN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/*
useEffect(() => {
  fetchData('/api/items')
    .then(data => setItems(ensureArray(data, [])))
    .catch(() => setItems([]))
}, [])

return (
  <ul>
    {ensureArray(items, []).map(item => (
      <li key={item.id}>{item.name}</li>
    ))}
  </ul>
)
*/

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ❌ BAD PATTERN (Don't do this)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/*
items.map(item => item)          // Could crash if items isn't array
response.data.map()              // API response structure might vary
items?.map()                     // Still not fully safe
*/

export const SAFE_STATE_HANDLING_CHECKLIST = {
  patterns: [
    '✅ Always use ensureArray() before .map()',
    '✅ Use fetchData() for API calls',
    '✅ Provide safe defaults in catch',
    '✅ Validate response structure with helpers',
    '❌ Never directly call .map() on API responses',
    '❌ Dont assume data structure',
    '❌ Dont forget error handling',
  ],
  functions: ['ensureArray', 'fetchData', 'ensureObject', 'getSafeArray'],
  benefits: [
    'No more ".map is not a function" errors',
    'Type-safe API handling',
    'Consistent state management',
    'Better error recovery',
    'Centralized API logic',
  ],
}

export default SAFE_STATE_HANDLING_CHECKLIST

