/**
 * Search Types
 * 
 * Purpose: TypeScript interfaces for search configuration
 * Used in: SearchBar component and search filtering utilities
 * Why: Provides type-safe search configuration across the application
 * 
 * Function Index:
 * - SearchConfig: Interface for search configuration
 * 
 * Steps:
 * 1. Define SearchConfig interface with searchableFields and placeholder
 */

/**
 * Search configuration for an entity
 * WHY: Defines which fields are searchable and search behavior
 * HOW: Specifies fields to search and placeholder text
 */
export interface SearchConfig<T extends Record<string, any>> {
  /**
   * Fields to search across (OR logic - matches if any field contains query)
   * WHY: Allows searching across multiple columns
   * HOW: Array of field keys from the data type
   */
  searchableFields: (keyof T)[]
  
  /**
   * Placeholder text for search input
   * WHY: Provides user guidance
   * HOW: String displayed when input is empty
   */
  placeholder?: string
  
  /**
   * Minimum characters before searching (optional)
   * WHY: Performance optimization - avoid searching on very short queries
   * HOW: Number of characters required (default: 0 = search immediately)
   */
  minLength?: number
}
