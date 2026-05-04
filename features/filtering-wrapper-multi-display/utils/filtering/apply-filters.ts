// @ts-nocheck
/**
 * Apply Filters Utility
 * 
 * Purpose: Applies filter logic to table data
 * Used in: VirtualizedTable component and filtering hooks
 * Why: Separates filter application logic for reusability and testing
 * 
 * Steps:
 * 1. Process each filter value against data items
 * 2. Handle different filter types (string arrays, number ranges, date ranges)
 * 3. Return filtered data array
 */

import { TableColumn } from "../../types";
import { FilterValue, RangeFilter, DateRangeFilter } from "../../types/filter-types";

////////////////////////////////////
// Type Definitions: Filter application parameters
////////////////////////////////////

/**
 * Parameters for applying filters to data
 */
interface ApplyFiltersParams<T> {
  // Original data array to filter
  data: T[];
  // Current active filters
  filters: Record<string, FilterValue>;
  // Column definitions for type checking
  columns: TableColumn<T>[];
}

////////////////////////////////////
// Filter Application Logic: Process different filter types
////////////////////////////////////

/////////////////////////////////
// Helper function to extract filterable value from any format
/////////////////////////////////

/**
 * Extracts a filterable string value from any data format
 * Handles objects, arrays, and primitives consistently with display formatting
 * 
 * @template T - The type of data items
 * @param {any} value - The value to extract a filterable string from
 * @param {TableColumn<T> | undefined} column - Optional column definition for formatter
 * @returns {string} Extracted filterable string value
 */
function extractFilterValue<T>(value: any, column?: TableColumn<T>): string {
  // Priority 1: Use column formatter if available (most consistent with display)
  if (column?.formatter) {
    return column.formatter(value);
  }
  
  // Priority 2: Handle objects (extract meaningful display values)
  if (typeof value === 'object' && value !== null) {
    if (value.username) return value.username;
    if (value.name) return value.name;
    if (value.email) return value.email;
    if (value.id) return String(value.id);
    return JSON.stringify(value);
  }
  
  // Priority 3: Handle primitives (strings, numbers, booleans, etc.)
  return String(value);
}

/**
 * Applies filters to data array based on filter configuration
 * Handles different filter types: string arrays (multi-select), number ranges, and date ranges
 * 
 * @template T - The type of data items
 * @param {ApplyFiltersParams<T>} params - Filter application parameters
 * @returns {T[]} Filtered data array
 * 
 * @example
 * ```tsx
 * const filteredData = applyFilters({
 *   data: originalData,
 *   filters: { 
 *     status: ["active", "pending"],
 *     createdAt: { start: new Date('2024-01-01'), end: new Date('2024-12-31') }
 *   },
 *   columns: tableColumns
 * });
 * ```
 */
export function applyFilters<T>({
  data,
  filters,
  columns
}: ApplyFiltersParams<T>): T[] {
  // Return original data if no filters are applied
  if (Object.keys(filters).length === 0) {
    return data;
  }

  // Filter data items based on active filters
  return data.filter(item => {
    // Check each active filter
    for (const [key, filterValue] of Object.entries(filters)) {
      // Skip empty filters (no filtering applied)
      if (Array.isArray(filterValue) && filterValue.length === 0) continue;
      
      // Extract item value for the current filter key
      const value = item[key as keyof T];
      
      // Skip items with undefined/null values for this filter
      if (value === undefined || value === null) return false;
      
      // Find column definition to determine filter type
      const column = columns.find(col => col.key === key);
      
      // Handle number range filters
      if (column?.isNumberField && !Array.isArray(filterValue) && 'min' in filterValue) {
        const rangeFilter = filterValue as RangeFilter;
        const numValue = typeof value === 'number' ? value : parseFloat(String(value));
        
        // Skip items with invalid numbers
        if (isNaN(numValue)) return false;
        
        // Check minimum value constraint
        if (rangeFilter.min !== null && numValue < rangeFilter.min) return false;
        
        // Check maximum value constraint
        if (rangeFilter.max !== null && numValue > rangeFilter.max) return false;
      }
      // Handle date range filters
      else if (column?.isDateField && !Array.isArray(filterValue) && 'start' in filterValue) {
        const dateRangeFilter = filterValue as DateRangeFilter;
        
        // Convert item value to Date object for comparison
        let itemDate: Date;
        if (value instanceof Date) {
          itemDate = value;
        } else if (typeof value === 'string') {
          itemDate = new Date(value);
        } else if (typeof value === 'number') {
          itemDate = new Date(value);
        } else {
          // Skip items with invalid date values
          return false;
        }
        
        // Skip items with invalid dates
        if (isNaN(itemDate.getTime())) return false;
        
        // Check start date constraint (item date must be >= start date)
        if (dateRangeFilter.start !== null) {
          // Normalize to start of day for consistent comparison
          const startDate = new Date(dateRangeFilter.start);
          startDate.setHours(0, 0, 0, 0);
          
          if (itemDate < startDate) return false;
        }
        
        // Check end date constraint (item date must be <= end date)
        if (dateRangeFilter.end !== null) {
          // Normalize to end of day for consistent comparison
          const endDate = new Date(dateRangeFilter.end);
          endDate.setHours(23, 59, 59, 999);
          
          if (itemDate > endDate) return false;
        }
      }
      // Handle regular string filters (multi-select)
      else if (Array.isArray(filterValue)) {
        //////////////////////////////////
        // Array handling: Check if any element in array matches filter values
        //////////////////////////////////
        if (Array.isArray(value)) {
          // For array values, check if any element in the array matches any filter value
          const hasMatch = value.some(arrayItem => {
            // Extract filterable value using helper function
            const displayValue = extractFilterValue(arrayItem, column);
            return filterValue.includes(displayValue);
          });
          
          if (!hasMatch) return false;
        } else {
          //////////////////////////////////
          // String/primitive handling: Extract and compare filterable value
          //////////////////////////////////
          // For non-array values, extract filterable value using helper function
          const stringValue = extractFilterValue(value, column);
          if (!filterValue.includes(stringValue)) return false;
        }
      }
    }
    
    // Item passes all filters
    return true;
  });
}

/**
 * Applies filters excluding a specific column
 * Useful for calculating filter counts in other columns
 * 
 * @template T - The type of data items
 * @param {ApplyFiltersParams<T>} params - Filter application parameters
 * @param {string} excludeColumnKey - Column key to exclude from filtering
 * @returns {T[]} Filtered data array (excluding specified column)
 * 
 * @example
 * ```tsx
 * const dataWithoutStatusFilter = applyFiltersExcludingColumn({
 *   data: originalData,
 *   filters: { status: ["active"], role: ["admin"] },
 *   columns: tableColumns
 * }, "status");
 * ```
 */
export function applyFiltersExcludingColumn<T>(
  params: ApplyFiltersParams<T>,
  excludeColumnKey: string
): T[] {
  // Create a new filters object without the excluded column
  const filtersWithoutColumn = { ...params.filters };
  delete filtersWithoutColumn[excludeColumnKey];
  
  // Apply filters with the modified filter object
  return applyFilters({
    ...params,
    filters: filtersWithoutColumn
  });
} 