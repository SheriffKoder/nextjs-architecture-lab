/**
 * Header Filter Configuration Types
 * 
 * Purpose: Type definitions for filter dropdowns in table headers
 * Used in: VirtualizedTableHeader, SubHeadingsContainer, FilteringWrapper
 * Why: Provides type safety for header filter configuration
 */

/**
 * Header Filter Configuration
 * 
 * Controls which filters appear in table column headers and their behavior
 */
export interface HeaderFilterConfig {
  /**
   * Map column keys to filter keys
   * If not specified, uses column.key as filter.key
   * Example: { 'status': 'status', 'make': 'make' }
   */
  columnToFilterMap?: Record<string, string>
  
  /**
   * Which filters to show per column
   * If not provided, shows all matching filters
   * Example: { 'status': ['status'], 'make': ['make', 'location'] }
   */
  enabledFilterKeys?: Record<string, string[]>
  
  /**
   * Filter behavior props
   */
  autoApply?: boolean
  showBadges?: boolean
  defaultRangeExpanded?: boolean
  showInitialCount?: boolean
}
