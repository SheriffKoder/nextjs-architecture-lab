/**
 * Get Field Names Utility
 * 
 * Purpose: Extract and format field names from data objects
 * Used in: dropdown components, form builders
 * Why: Provides human-readable field names for UI components
 * 
 * Function Index:
 * - splitFieldName: Splits camelCase/PascalCase/snake_case into words
 * - capitalizeWords: Capitalizes each word in a string
 * - getFieldNames: Extracts unique field names from data array
 * 
 * Steps:
 * 1. Extract all keys from data objects
 * 2. Split field names into words
 * 3. Capitalize each word
 * 4. Return formatted field names
 */

//////////////////////////////////
// Split Field Name into Words
//////////////////////////////////

/**
 * Splits a field name into words
 * Handles camelCase, PascalCase, snake_case, and kebab-case
 * 
 * @param fieldName - The field name to split (e.g., "created_at", "firstName", "user-name")
 * @returns Array of words (e.g., ["created", "at"], ["first", "name"])
 * 
 * @example
 * splitFieldName("created_at") // ["created", "at"]
 * splitFieldName("firstName") // ["first", "name"]
 * splitFieldName("user-name") // ["user", "name"]
 */
export function splitFieldName(fieldName: string): string[] {
  // Handle snake_case and kebab-case
  if (fieldName.includes('_') || fieldName.includes('-')) {
    return fieldName.split(/[_-]/).filter(Boolean)
  }
  
  // Handle camelCase and PascalCase
  // Split on capital letters or numbers
  return fieldName
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/([0-9])/g, ' $1') // Add space before numbers
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}

//////////////////////////////////
// Capitalize Words
//////////////////////////////////

/**
 * Capitalizes each word in a string
 * 
 * @param words - Array of words to capitalize
 * @returns Capitalized string (e.g., "Created At", "First Name")
 * 
 * @example
 * capitalizeWords(["created", "at"]) // "Created At"
 * capitalizeWords(["first", "name"]) // "First Name"
 */
export function capitalizeWords(words: string[]): string {
  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

//////////////////////////////////
// Get Field Names from Data
//////////////////////////////////

/**
 * Extracts unique field names from data array and formats them
 * 
 * @param data - Array of data objects
 * @returns Array of formatted field names with original keys
 * 
 * @example
 * getFieldNames([{ id: 1, created_at: '...', firstName: 'John' }])
 * // [{ key: 'id', label: 'Id' }, { key: 'created_at', label: 'Created At' }, { key: 'firstName', label: 'First Name' }]
 */
export function getFieldNames<T extends Record<string, any>>(
  data: T[]
): Array<{ key: string; label: string }> {
  if (!data || data.length === 0) {
    return []
  }
  
  // Get all unique keys from all objects
  const allKeys = new Set<string>()
  data.forEach((item) => {
    Object.keys(item).forEach((key) => allKeys.add(key))
  })
  
  // Convert to array and format
  return Array.from(allKeys)
    .map((key) => {
      const words = splitFieldName(key)
      const label = capitalizeWords(words)
      return { key, label }
    })
    .sort((a, b) => a.label.localeCompare(b.label)) // Sort alphabetically
}

