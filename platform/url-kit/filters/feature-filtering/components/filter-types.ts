/**
 * Filter Types
 * 
 * Purpose: TypeScript interfaces and types for filter configuration system
 * Used in: All filter components to define filter structure and options
 * Why: Provides type safety and consistent filter configuration across the application
 * 
 * Function Index:
 * - FilterType: Union type defining available filter types
 * - FilterOption: Interface for filter option items (label/value pairs)
 * - FilterConfig: Interface for complete filter configuration
 * 
 * Steps:
 * 1. Define FilterType union with all supported filter types
 * 2. Define FilterOption interface for option items
 * 3. Define FilterConfig interface for complete filter configuration
 */

/**
 * Available filter types in the system
 * WHY: Type-safe filter type definitions
 * HOW: Union type restricts filter type to known values
 */
export type FilterType =
  | "multi-select"
  | "single-select"
  | "date-range"
  | "number-range"

/**
 * Quick select type for range filters
 * WHY: Defines how unique values are presented in quick select
 * HOW: "unique" shows raw unique values, "buckets" and "presets" are future implementations
 */
export type QuickSelectType = "unique" | "buckets" | "presets"

/**
 * Filter option item with label, value, and optional count
 * WHY: Standardizes option structure across all filter types
 * HOW: Simple interface with label for display, value for URL params, and count for showing how many items match
 */
export interface FilterOption {
  label: string
  value: string
  /**
   * Number of items that match this option value (total count from all data)
   * WHY: Shows users how many items will be shown when selecting this option
   * HOW: Calculated when generating filter options from data source
   */
  count?: number
  /**
   * Initial count of items that match this option value (original count before filtering)
   * WHY: Shows original count regardless of filtering, used for display and selectability logic
   * HOW: Calculated from full data source (same as count for now, will differ with hierarchical filtering)
   */
  initialCount?: number
}

/**
 * Complete filter configuration
 * WHY: Provides type-safe filter configuration for FiltersBar
 * HOW: Includes key (URL param name), label (display name), type, and optional options array
 */
export interface FilterConfig {
  key: string
  label: string
  type: FilterType
  options?: FilterOption[]
  /**
   * Show quick select dropdown for range filters
   * WHY: Allows users to quickly select common values instead of manual input
   * HOW: When true, shows multi-select dropdown with unique values above range input
   */
  showQuickSelect?: boolean
  /**
   * Type of quick select to use
   * WHY: Future-proofing for different presentation methods
   * HOW: "unique" shows raw unique values, "buckets" and "presets" are future implementations
   */
  quickSelectType?: QuickSelectType
  /**
   * For multi/single-select in DropdownFilter: show the in-panel option search field.
   * Omit or true = search shown; false = hidden (short lists).
   */
  showOptionSearch?: boolean
  /**
   * For date-range / number-range in DropdownFilter: initial expand state of “Filter by range”.
   * When set, overrides DropdownFilter’s `defaultRangeExpanded` prop for this filter only.
   */
  defaultRangeExpanded?: boolean
  /**
   * For range filters with showQuickSelect: when false, quick-select values start behind a collapsible header.
   * When true or omitted, quick select is visible immediately (current behavior).
   */
  quickSelectOptionsExpanded?: boolean
}
