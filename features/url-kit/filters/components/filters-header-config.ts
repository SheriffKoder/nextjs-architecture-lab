/**
 * Filters Header Configuration Types
 * 
 * Purpose: Type definitions for FiltersHeader component configuration
 * Used in: FiltersHeader component and page configs
 * Why: Allows flexible filter UI layouts per page
 */

/**
 * Filter row type options
 * - 'dropdown-1': Row 1 - SearchBar + FiltersBar
 * - 'pill': Row 2 - PillFilter + DateFilterButton
 * - 'dropdown-2': Row 3 - DropdownSearchBar + DropdownFilters
 */
export type FiltersHeaderFilterType = 'dropdown-1' | 'pill' | 'dropdown-2'

/**
 * Filters Header Configuration
 * 
 * Controls which filter rows are displayed and their behavior
 */
export interface FiltersHeaderConfig {
  /**
   * Which filter row type to display (only one of first three rows)
   * - 'dropdown-1': Row 1 - SearchBar + FiltersBar
   * - 'pill': Row 2 - PillFilter + DateFilterButton
   * - 'dropdown-2': Row 3 - DropdownSearchBar + DropdownFilters
   */
  filterType: FiltersHeaderFilterType
  
  /**
   * Whether to show column options row (Row 4)
   * Controls FilterOptionsButtons visibility
   */
  showColumnOptions: boolean
  
  /**
   * Filter key to use for column options
   * Replaces filters[1].key in FilterOptionsButtons
   * Only used if showColumnOptions is true
   */
  columnOptionsKey?: string
  
  /**
   * Whether to show search bars
   * - Affects SearchBar in Row 1 (dropdown-1)
   * - Affects DropdownSearchBar in Row 3 (dropdown-2)
   * - Does NOT affect Row 2 (pill) - PillFilter has its own search
   */
  showSearch: boolean
  
  /**
   * Whether to show independent date select button
   * - Only affects Row 2 (pill)
   * - Controls DateFilterButton visibility next to PillFilter
   */
  showIndependentDateSelect: boolean
  
  /**
   * Optional array of filter keys to display
   * - If provided, only filters with keys in this array will be shown
   * - If not provided, all filters will be displayed
   * - Example: ['status', 'make', 'location'] - only shows these three filters
   */
  enabledFilterKeys?: string[]
}
