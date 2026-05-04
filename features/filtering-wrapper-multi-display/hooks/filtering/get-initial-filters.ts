/**
 * Get Initial Filters Helper
 * 
 * Purpose: Extracts initial filter values from column definitions
 * Used in: useTableFiltering hook
 * Why: Separates initial filter extraction logic for reusability and testing
 * 
 * Steps:
 * 1. Iterate through columns to find initialAppliedFilterValues
 * 2. Validate filter values (skip empty arrays, ranges, date ranges)
 * 3. Return record of initial filters keyed by column key
 * 4. Supports string arrays, boolean values, number ranges, and date ranges
 */

import { TableColumn } from "../../features/subheadings/types/table-column";
import { FilterValue } from "../../types/filter-types";

////////////////////////////////////
// Type Definitions: Helper function parameters
////////////////////////////////////

/**
 * Parameters for extracting initial filters from columns
 */
interface GetInitialFiltersParams<T> {
  // Available columns for filtering
  columns: TableColumn<T>[];
}

////////////////////////////////////
// Helper Function: Extract initial filters from columns
////////////////////////////////////

/**
 * Extracts initial filter values from column definitions
 * Validates and filters out empty filter values
 * 
 * @template T - The type of data items in the table
 * @param {GetInitialFiltersParams<T>} params - Parameters containing columns
 * @returns {Record<string, FilterValue>} Record of initial filters keyed by column key
 * 
 * @example
 * ```tsx
 * const initialFilters = getInitialFiltersFromColumns({ columns });
 * // Returns: { status: ['active'], created_at: { start: Date, end: Date } }
 * ```
 */
export function getInitialFiltersFromColumns<T>(
  params: GetInitialFiltersParams<T>
): Record<string, FilterValue> {
  const { columns } = params;
  const initialFilters: Record<string, FilterValue> = {};
  
  if (!columns || columns.length === 0) {
    return initialFilters;
  }
  
  // Check each column for initial filter values
  columns.forEach(column => {
    if (column.initialAppliedFilterValues !== undefined) {
      const filterValue = column.initialAppliedFilterValues;
      
      // Skip empty arrays (but allow boolean arrays)
      if (Array.isArray(filterValue) && filterValue.length === 0) {
        return;
      }
      
      // Skip empty range filters (both min and max are null)
      if (!Array.isArray(filterValue) && typeof filterValue !== 'boolean' && 'min' in filterValue) {
        const rangeFilter = filterValue as { min: number | null; max: number | null };
        if (rangeFilter.min === null && rangeFilter.max === null) {
          return;
        }
      }
      
      // Skip empty date range filters (both start and end are null)
      if (!Array.isArray(filterValue) && typeof filterValue !== 'boolean' && 'start' in filterValue) {
        const dateRangeFilter = filterValue as { start: Date | null; end: Date | null };
        if (dateRangeFilter.start === null && dateRangeFilter.end === null) {
          return;
        }
      }
      
      // Apply the initial filter value (boolean values are always valid)
      initialFilters[column.key] = filterValue;
    }
  });
  
  return initialFilters;
}
