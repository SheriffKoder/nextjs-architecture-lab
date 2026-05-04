/**
 * Sorting Feature Types
 * 
 * Purpose: TypeScript interfaces and types for sorting feature
 * Used in: All sorting components and hooks
 * Why: Provides type safety and consistent sorting configuration
 */

/**
 * Sort direction
 * WHY: Type-safe sort direction values
 * HOW: Union type restricts to known values
 */
export type SortDirection = 'asc' | 'desc'

/**
 * Sort configuration for a sortable field
 * WHY: Defines which fields can be sorted and their display labels
 * HOW: Simple interface with key (field name) and label (for accessibility)
 */
export interface SortConfig {
  /**
   * The field key to sort by (matches data property name)
   * WHY: Identifies which field to sort
   * HOW: Used in URL params and data sorting
   */
  key: string
  
  /**
   * Human-readable label for the sort field
   * WHY: Accessibility and tooltips
   * HOW: Displayed in aria-label and tooltip attributes
   */
  label: string
  
  /**
   * Whether this sort should be applied initially when no sort exists
   * WHY: Provide default sorting on page load
   * HOW: If true and no sort param exists, automatically applies this sort
   */
  initial?: boolean
  
  /**
   * Initial sort direction when initial is true
   * WHY: Control default sort direction
   * HOW: Defaults to 'asc' if not specified
   */
  initialOrder?: 'asc' | 'desc'
}

/**
 * Sort specification with key and direction
 * WHY: Represents a single sort operation
 * HOW: Used in arrays to represent multi-level sorting
 */
export interface SortSpec {
  /**
   * The field key to sort by
   */
  key: string
  
  /**
   * Sort direction (ascending or descending)
   */
  direction: SortDirection
}

/**
 * Props for SortButton component
 * WHY: Type-safe props for single sort button
 * HOW: Defines required and optional props
 */
export interface SortButtonProps {
  /**
   * The field key to sort by
   */
  sortKey: string
  
  /**
   * Optional label for accessibility/tooltip
   */
  label?: string
  
  /**
   * Optional CSS classes
   */
  className?: string
  
  /**
   * Show priority badge if multi-level sorting
   */
  showPriority?: boolean
}

/**
 * Props for SortButtons component
 * WHY: Type-safe props for multiple sort buttons
 * HOW: Defines config-based props
 */
export interface SortButtonsProps {
  /**
   * Array of sort configurations
   */
  sortConfig: SortConfig[]
  
  /**
   * Optional CSS classes
   */
  className?: string
}
