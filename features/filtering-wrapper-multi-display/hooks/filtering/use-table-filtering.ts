/**
 * useTableFiltering Hook
 * 
 * Purpose: Manages filtering state and logic for virtualized table
 * Used in: VirtualizedTable component
 * Why: Separates filtering concerns and provides reusable filtering functionality
 * 
 * Steps:
 * 1. Initialize filtering state
 * 2. Provide filter change handlers
 * 3. Apply filters to data using utility functions
 * 4. Handle scroll reset on filter changes
 */

import { useCallback, useMemo, RefObject } from "react";
import { FixedSizeList, VariableSizeList } from "react-window";
import { TableColumn } from "../../features/subheadings/types/table-column";
import { FilterValue } from "../../types/filter-types";
import { applyFilters, applyFiltersExcludingColumn } from "../../utils/filtering/apply-filters";
import { useInitialFilters } from "./use-initial-filters";
import { getInitialFiltersFromColumns } from "./get-initial-filters";

////////////////////////////////////
// Type Definitions: Filtering state and configuration
////////////////////////////////////

/**
 * Parameters for the useTableFiltering hook
 */
interface UseTableFilteringParams<T> {
  // Original data array
  data: T[];
  // Available columns for filtering
  columns: TableColumn<T>[];
  // Reference to virtualized list for scroll control
  listRef: RefObject<FixedSizeList | VariableSizeList>;
  // Whether pagination is enabled (for page reset)
  usePagination: boolean;
  // Function to reset current page
  resetPage: () => void;
}

/**
 * Return object from useTableFiltering hook
 */
interface UseTableFilteringReturn<T> {
  // Current active filters
  filters: Record<string, FilterValue>;
  // Handler for filter changes
  handleFilterChange: (columnKey: string, values: FilterValue) => void;
  // Clear all filters
  clearAllFilters: () => void;
  // Filtered data array
  filteredData: T[];
  // Function to get filtered data excluding a specific column
  getFilteredDataExcludingColumn: (excludeColumnKey: string) => T[];
}

////////////////////////////////////
// Hook Implementation: Filtering logic and state management
////////////////////////////////////

/**
 * Custom hook that manages table filtering functionality
 * Provides filter state, handlers, and filtered data
 * 
 * @template T - The type of data items in the table
 * @param {UseTableFilteringParams<T>} params - Configuration parameters
 * @returns {UseTableFilteringReturn<T>} Filtering state and handlers
 * 
 * @example
 * ```tsx
 * const { filters, handleFilterChange, filteredData } = useTableFiltering({
 *   data: originalData,
 *   columns,
 *   listRef,
 *   usePagination,
 *   resetPage
 * });
 * ```
 */
export function useTableFiltering<T>({
  data,
  columns,
  listRef,
  usePagination,
  resetPage
}: UseTableFilteringParams<T>): UseTableFilteringReturn<T> {
  ////////////////////////////////////
  // State Management: Track active filters
  ////////////////////////////////////
  
  // Initialize filters state with initial values from columns
  const [filters, setFilters] = useInitialFilters({ columns });

  ////////////////////////////////////
  // Event Handlers: Filter changes and updates
  ////////////////////////////////////
  
  /**
   * Handle filter changes for a specific column
   * Updates filter state and resets pagination/scroll
   * 
   * @param {string} columnKey - Key of the column being filtered
   * @param {FilterValue} values - Filter values to apply
   */
  const handleFilterChange = useCallback((columnKey: string, values: FilterValue) => {
    // Create new filters object with updated values
    const newFilters = { ...filters };
    newFilters[columnKey] = values;
    
    // Update filter state
    setFilters(newFilters);
    
    // Reset to first page when filters change (if pagination is enabled)
    if (usePagination) {
      resetPage();
    }
    
    // Scroll to top when filters change for better UX
    if (listRef.current) {
      listRef.current.scrollTo(0);
    }
  }, [filters, usePagination, resetPage, listRef]);

  /**
   * Clear all active filters and restore initial filters
   */
  const clearAllFilters = useCallback(() => {
    // Restore initial filters instead of clearing everything
    const initialFilters = getInitialFiltersFromColumns({ columns });
    setFilters(initialFilters);
    if (usePagination) {
      resetPage();
    }
  }, [columns, usePagination, resetPage, setFilters]);

  ////////////////////////////////////
  // Data Processing: Apply filters using utility functions
  ////////////////////////////////////
  
  /**
   * Apply current filters to data array
   * Uses utility function for consistent filter application
   */
  const filteredData = useMemo(() => {
    return applyFilters({
      data,
      filters,
      columns
    });
  }, [data, filters, columns]);

  /**
   * Get filtered data excluding a specific column
   * Useful for calculating filter counts in other columns
   * 
   * @param {string} excludeColumnKey - Column key to exclude from filtering
   * @returns {T[]} Filtered data array (excluding specified column)
   */
  const getFilteredDataExcludingColumn = useCallback((excludeColumnKey: string) => {
    return applyFiltersExcludingColumn(
      { data, filters, columns },
      excludeColumnKey
    );
  }, [data, filters, columns]);

  // Return filtering state and handlers
  return {
    filters,
    handleFilterChange,
    clearAllFilters,
    filteredData,
    getFilteredDataExcludingColumn
  };
} 