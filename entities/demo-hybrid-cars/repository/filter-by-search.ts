/**
 * @file entities/demo-hybrid-cars/repository/filter-by-search.ts
 * Generic text search filter for mock rental car rows.
 *
 * Purpose: Apply `q` search across configured searchable fields
 * Used in: `repository/filter-rental-cars.ts`
 * Used for: Shared search narrowing for list and facet pipelines
 *
 * Function Index:
 * - filterBySearch — case-insensitive match across field list
 *
 * Steps:
 * 1. Normalize search query to lowercase.
 * 2. Keep rows where any searchable field contains the query.
 * 3. Skip null/undefined field values safely.
 * 4. Return filtered array.
 */

//////////////////////////////////
// Types
//////////////////////////////////

/**
 * Generic data record type
 * WHY: Allows function to work with any data type
 * HOW: Constrains to objects with string keys
 */
type DataRecord = Record<string, any>

//////////////////////////////////
// Main Function
//////////////////////////////////

/**
 * Filter data by search query
 * WHY: Centralized search logic used by both server and API
 * HOW: Searches across specified fields with OR logic (matches if any field contains query)
 * 
 * @param {T[]} data - Data array to search
 * @param {string} query - Search query string
 * @param {(keyof T)[]} searchableFields - Fields to search across
 * @returns {T[]} Filtered data array
 */
export function filterBySearch<T extends DataRecord>(
  data: T[],
  query: string,
  searchableFields: (keyof T)[]
): T[] {
  // Return all data if query is empty
  // WHY: Empty query should not filter anything
  // HOW: Early return if query is empty or whitespace
  if (!query || query.trim().length === 0) {
    return data
  }
  
  // Normalize query to lowercase for case-insensitive matching
  // WHY: Case-insensitive search is more user-friendly
  // HOW: Convert query to lowercase once for efficiency
  const normalizedQuery = query.trim().toLowerCase()
  
  // Filter data by checking if any searchable field contains the query
  // WHY: OR logic - match if ANY field contains the query
  // HOW: Use Array.some() to check if any field matches
  return data.filter((item) => {
    return searchableFields.some((field) => {
      const fieldValue = item[field]
      
      // Handle null/undefined values
      // WHY: Prevent errors when field is null or undefined
      // HOW: Return false if value is null or undefined
      if (fieldValue === null || fieldValue === undefined) {
        return false
      }
      
      // Convert field value to string and search (case-insensitive)
      // WHY: Support searching across different data types (string, number, etc.)
      // HOW: Convert to string, lowercase, and check if contains query
      const stringValue = String(fieldValue).toLowerCase()
      return stringValue.includes(normalizedQuery)
    })
  })
}
