/**
 * Dropdown Filter Types
 * 
 * Purpose: TypeScript interfaces and types for dropdown filter component system
 * Used in: All dropdown filter components
 * Why: Provides type safety and consistent filter configuration
 */

import type { FilterConfig, FilterOption } from "../filter-types"
import type { LucideIcon } from "lucide-react"

/**
 * Extended filter option with counts for dropdown filtering
 * WHY: Dropdown filters need both total count and filtered count for selectability logic
 * HOW: Extends FilterOption with additional count properties
 */
export interface DropdownFilterOption extends FilterOption {
  /**
   * Raw value from data source (before formatting)
   * WHY: Needed for formatDisplayValue function to work correctly
   * HOW: Stores original value from data
   */
  rawValue: any
  
  /**
   * Total count of items with this value (from all data)
   * WHY: Shows total availability regardless of other filters
   * HOW: Counted from full data source
   */
  totalCount: number
  
  /**
   * Initial count of items with this value (original count before filtering)
   * WHY: Determines if option is selectable when other filters are active
   * HOW: Counted from full data source (same as count for now, will differ with hierarchical filtering)
   */
  initialCount: number
}

/**
 * Props for the main DropdownFilter component
 * WHY: Provides all configuration and callbacks needed for dropdown filtering
 * HOW: Used by parent components to configure and control dropdown behavior
 */
export interface DropdownFilterProps {
  /**
   * Filter configuration
   * WHY: Defines which filter to display and its properties
   * HOW: Contains key, label, type, and optional options
   */
  filter: FilterConfig
  
  /**
   * Whether dropdown is currently open (optional for uncontrolled mode)
   * WHY: Control dropdown visibility from parent
   * HOW: Parent manages open state, or component manages internally if not provided
   */
  isOpen?: boolean
  
  /**
   * Callback when dropdown open state changes (optional for uncontrolled mode)
   * WHY: Allow parent to control dropdown visibility
   * HOW: Called with new open state, or no-op if not provided
   */
  onOpenChange?: (open: boolean) => void
  
  /**
   * Optional data source for option generation
   * WHY: If options not provided in FilterConfig, calculate from data
   * HOW: Used to extract unique values and calculate counts
   */
  dataSource?: any[]
  
  /**
   * Optional formatter for display values
   * WHY: Customize how option values are displayed
   * HOW: Function that converts raw value to display string
   */
  formatDisplayValue?: (value: any) => string
  
  /**
   * Whether to auto-apply filter changes
   * WHY: Control whether changes apply immediately or require Apply button
   * HOW: If true, updates URL immediately on toggle; if false, shows Apply button
   */
  autoApply?: boolean
  
  /**
   * Whether to show active filter badges
   * WHY: Control visibility of active filters section
   * HOW: If true, shows badges when filters are active
   */
  showBadges?: boolean
  
  /**
   * Whether this is the last column (for dropdown positioning)
   * WHY: Position dropdown to avoid going off-screen
   * HOW: If true, aligns dropdown to right; otherwise to left
   */
  isLastColumn?: boolean
  
  /**
   * All active filters across all columns
   * WHY: Needed for selectability logic and count calculations
   * HOW: Object mapping column keys to their active filter values
   */
  allActiveFilterColumns?: Record<string, any>
  
  /**
   * Button configuration - use icon button or FilterBoxButton
   * WHY: Support both button styles from old component
   * HOW: If true, uses icon button; if false, uses FilterBoxButton
   */
  useFilterIcon?: boolean
  
  /**
   * Custom text for FilterBoxButton
   * WHY: Allow customization of button text
   * HOW: Used when useFilterIcon is false
   */
  useFilterIconText?: string
  
  /**
   * Custom width for FilterBoxButton
   * WHY: Allow customization of button width
   * HOW: Used when useFilterIcon is false
   */
  useFilterIconWidth?: string
  
  /**
   * Custom icon component for FilterBoxButton
   * WHY: Allow customization of button icon
   * HOW: Used when useFilterIcon is false
   */
  filterIcon?: React.ComponentType<{ size?: number; className?: string }>
  
  /**
   * Fallback when `filter.defaultRangeExpanded` is omitted on FilterConfig.
   * WHY: Pages without per-filter config still control default; filter wins when set.
   */
  defaultRangeExpanded?: boolean
  
  /**
   * Whether to display initial count alongside count
   * WHY: Show both count and initialCount in format "count / initialCount"
   * HOW: If true, displays "count / initialCount"; if false, displays only "count"
   * Default: false
   */
  showInitialCount?: boolean
  
  /**
   * Optional icon configuration mapping filter keys to Lucide icons
   * WHY: Display icons on FilterBoxButton for each filter
   * HOW: Object mapping filter key strings to Lucide icon components
   */
  iconConfig?: Record<string, LucideIcon>

  /**
   * When set, shows the URL column-sort strip (Asc/Desc/None/Clear all)
   * above option search. Omit / null keeps the dropdown filter-only.
   * @see feature-sorting/docs/DROPDOWN_SORT_CONTROLS_PLAN.md
   */
  columnSort?: { key: string; label: string } | null
}
