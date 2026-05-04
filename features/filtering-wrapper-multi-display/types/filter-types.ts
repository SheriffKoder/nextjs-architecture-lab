/**
 * Filter Type Definitions
 * 
 * Purpose: Defines TypeScript interfaces for table filtering functionality
 * Used in: VirtualizedTable, VirtualizedTableHeader, and filter components
 * Why: Provides type safety for filter operations and data structures
 * 
 * Steps:
 * 1. Define filter-related interfaces and types
 * 2. Export for use across table components
 */

/**
 * Interface for number range filter values
 * Used for filtering numeric columns with min/max constraints
 */
export interface RangeFilter {
  // Minimum value for the range (null means no minimum)
  min: number | null;
  // Maximum value for the range (null means no maximum)
  max: number | null;
}

/**
 * Interface for date range filter values
 * Used for filtering date columns with start/end date constraints
 */
export interface DateRangeFilter {
  // Start date for the range (null means no start date)
  start: Date | null;
  // End date for the range (null means no end date)
  end: Date | null;
}

/**
 * Union type representing all possible filter value types
 * Supports string arrays (multi-select), boolean values, number ranges, and date ranges
 */
export type FilterValue = string[] | boolean | boolean[] | RangeFilter | DateRangeFilter; 