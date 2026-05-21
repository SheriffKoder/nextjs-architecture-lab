/**
 * Sorting Control Feature Types
 * 
 * Purpose: TypeScript interfaces and types for sorting-control feature
 * Used in: All sorting-control components and hooks
 * Why: Provides type safety and consistent sorting configuration
 */

// Re-export from sorting-feature for convenience
import type { SortDirection, SortSpec, SortConfig } from '../feature-sorting/types'

/**
 * Props for SortingControl main component
 * WHY: Type-safe props for the main sorting control dropdown
 * HOW: Defines required and optional props
 */
export interface SortingControlProps {
  /**
   * Array of sort configurations (available keys)
   */
  sortConfig: SortConfig[]
  
  /**
   * Optional CSS classes
   */
  className?: string
  
  /**
   * Button text when no sorts are active
   */
  placeholder?: string
}

/**
 * Props for SortRow component
 * WHY: Type-safe props for individual sort row
 * HOW: Defines all props needed for a sort row
 */
export interface SortRowProps {
  /**
   * Current sort specification
   */
  sort: SortSpec
  
  /**
   * Priority level (0 = primary, 1 = secondary, etc.)
   */
  level: number
  
  /**
   * All available sort configs
   */
  availableConfigs: SortConfig[]
  
  /**
   * All active sorts (for determining available keys)
   */
  allSorts: SortSpec[]
  
  /**
   * Whether this is the first row (can't move up)
   */
  isFirst: boolean
  
  /**
   * Whether this is the last row (can't move down)
   */
  isLast: boolean
  
  /**
   * Callback when sort changes (key or direction)
   */
  onSortChange: (key: string, direction: SortDirection) => void
  
  /**
   * Callback when sort is removed
   */
  onRemove: () => void
  
  /**
   * Callback to move sort up (increase priority)
   */
  onMoveUp: () => void
  
  /**
   * Callback to move sort down (decrease priority)
   */
  onMoveDown: () => void
}

/**
 * Props for SortKeyDropdown component
 * WHY: Type-safe props for key selection dropdown
 * HOW: Defines props for selecting sort key
 */
export interface SortKeyDropdownProps {
  /**
   * Currently selected key
   */
  selectedKey: string
  
  /**
   * All available sort configs
   */
  availableConfigs: SortConfig[]
  
  /**
   * Keys already used in other sorts (to exclude)
   */
  excludedKeys: string[]
  
  /**
   * Callback when key changes
   */
  onKeyChange: (key: string) => void
}

/**
 * Props for SortDirectionDropdown component
 * WHY: Type-safe props for direction selection dropdown
 * HOW: Defines props for selecting sort direction
 */
export interface SortDirectionDropdownProps {
  /**
   * Currently selected direction
   */
  selectedDirection: SortDirection
  
  /**
   * Callback when direction changes
   */
  onDirectionChange: (direction: SortDirection) => void
}

/**
 * Props for AvailableSortsList component
 * WHY: Type-safe props for available sorts list
 * HOW: Defines props for displaying and selecting available sort keys
 */
export interface AvailableSortsListProps {
  /**
   * All available sort configs
   */
  availableConfigs: SortConfig[]
  
  /**
   * Keys already used in active sorts
   */
  usedKeys: string[]
  
  /**
   * Callback when a key is selected
   */
  onKeySelect: (key: string) => void
}
