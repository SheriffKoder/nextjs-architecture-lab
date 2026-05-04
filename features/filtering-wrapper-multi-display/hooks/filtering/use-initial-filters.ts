/**
 * useInitialFilters Hook
 * 
 * Purpose: Manages initial filter state from column definitions
 * Used in: useTableFiltering hook
 * Why: Separates initial filter initialization logic for reusability and testing
 * 
 * Steps:
 * 1. Extract initial filters from columns on mount
 * 2. Handle async column loading with useEffect fallback
 * 3. Prevent re-applying initial filters after user changes
 */

import { useState, useEffect, useRef } from "react";
import { TableColumn } from "../../features/subheadings/types/table-column";
import { FilterValue } from "../../types/filter-types";
import { getInitialFiltersFromColumns } from "./get-initial-filters";

////////////////////////////////////
// Type Definitions: Hook parameters
////////////////////////////////////

/**
 * Parameters for the useInitialFilters hook
 */
interface UseInitialFiltersParams<T> {
  // Available columns for filtering
  columns: TableColumn<T>[];
}

////////////////////////////////////
// Hook Implementation: Initial filter state management
////////////////////////////////////

/**
 * Custom hook that manages initial filter state from column definitions
 * Handles both synchronous and asynchronous column loading
 * 
 * @template T - The type of data items in the table
 * @param {UseInitialFiltersParams<T>} params - Configuration parameters
 * @returns {[Record<string, FilterValue>, React.Dispatch<React.SetStateAction<Record<string, FilterValue>>>]} Filter state and setter
 * 
 * @example
 * ```tsx
 * const [filters, setFilters] = useInitialFilters({ columns });
 * ```
 */
export function useInitialFilters<T>(
  params: UseInitialFiltersParams<T>
): [Record<string, FilterValue>, React.Dispatch<React.SetStateAction<Record<string, FilterValue>>>] {
  const { columns } = params;
  
  // Initialize filters state with initial values from columns
  const [filters, setFilters] = useState<Record<string, FilterValue>>(() => {
    const initialFilters = getInitialFiltersFromColumns({ columns });
    if (Object.keys(initialFilters).length > 0) {
      console.log('[useInitialFilters] Initializing with filters:', initialFilters);
    }
    return initialFilters;
  });
  
  // Track if we need to update filters when columns change (for async loading)
  const initialFiltersAppliedRef = useRef(false);

  ////////////////////////////////////
  // Initial Filter Application: Update filters if columns load asynchronously
  ////////////////////////////////////
  
  /**
   * Update filters if columns are loaded asynchronously after initial render
   * Only runs if columns weren't available during initial state initialization
   */
  useEffect(() => {
    // Skip if already applied
    if (initialFiltersAppliedRef.current) {
      return;
    }
    
    // Skip if columns are empty (not loaded yet)
    if (!columns || columns.length === 0) {
      return;
    }
    
    // Only apply if no filters are currently set (to avoid overriding user changes)
    if (Object.keys(filters).length > 0) {
      initialFiltersAppliedRef.current = true;
      return;
    }
    
    const initialFilters = getInitialFiltersFromColumns({ columns });
    
    // Only set initial filters if any were found
    if (Object.keys(initialFilters).length > 0) {
      console.log('[useInitialFilters] Applying initial filters from async columns:', initialFilters);
      setFilters(initialFilters);
    }
    
    initialFiltersAppliedRef.current = true;
  }, [columns, filters]);
  
  return [filters, setFilters];
}
