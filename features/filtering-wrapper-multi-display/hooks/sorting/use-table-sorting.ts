/**
 * useTableSorting Hook
 * 
 * Purpose: Manages sorting state and logic for virtualized table
 * Used in: VirtualizedTable component
 * Why: Separates sorting concerns and provides reusable sorting functionality
 * 
 * Steps:
 * 1. Initialize sorting state with initial configuration
 * 2. Provide sort handler with direction toggling
 * 3. Apply sorting to filtered data
 * 4. Handle scroll reset on sort changes
 */

import { useState, useCallback, useMemo, useEffect, useRef, RefObject } from "react";
import { FixedSizeList, VariableSizeList } from "react-window";
import { TableColumn } from "../../features/subheadings/types/table-column";

////////////////////////////////////
// Type Definitions: Sorting state and configuration
////////////////////////////////////

/**
 * Configuration object for table sorting
 * Tracks the current sort column and direction
 */
export interface SortConfig {
  // Key of the column being sorted (empty string means no sorting)
  key: string;
  // Sort direction (ascending, descending, or none)
  direction: "ascending" | "descending" | "none";
}

/**
 * Parameters for the useTableSorting hook
 */
interface UseTableSortingParams<T> {
  // Initial sort column key
  initialSortKey?: string;
  // Initial sort direction (only applies when initialSortKey is provided)
  initialSortDirection?: "ascending" | "descending";
  // Available columns for sorting
  columns: TableColumn<T>[];
  // Data to be sorted
  data: T[];
  // Reference to virtualized list for scroll control
  listRef: RefObject<FixedSizeList | VariableSizeList>;
  // Whether pagination is enabled (for page reset)
  usePagination: boolean;
  // Function to reset current page
  resetPage: () => void;
  /** When provided, called after sort changes with API sort spec e.g. "arv:asc" or undefined when cleared. Use to refetch from server with sort + filters. */
  onSortChange?: (sortSpec: string | undefined) => void;
}

/**
 * Return object from useTableSorting hook
 */
interface UseTableSortingReturn<T> {
  // Current sort configuration
  sortConfig: SortConfig;
  // Handler for sort column changes
  handleSort: (key: string) => void;
  // Sorted data array
  sortedData: T[];
}

////////////////////////////////////
// Hook Implementation: Sorting logic and state management
////////////////////////////////////

/**
 * Custom hook that manages table sorting functionality
 * Provides sort state, handlers, and sorted data
 * 
 * @template T - The type of data items in the table
 * @param {UseTableSortingParams<T>} params - Configuration parameters
 * @returns {UseTableSortingReturn<T>} Sorting state and handlers
 * 
 * @example
 * ```tsx
 * const { sortConfig, handleSort, sortedData } = useTableSorting({
 *   initialSortKey: "name",
 *   initialSortDirection: "descending",
 *   columns,
 *   data: filteredData,
 *   listRef,
 *   usePagination,
 *   resetPage
 * });
 * ```
 */
function buildSortSpec(config: SortConfig): string | undefined {
  if (!config.key || config.direction === "none") return undefined;
  return `${config.key}:${config.direction === "descending" ? "desc" : "asc"}`;
}

export function useTableSorting<T>({
  initialSortKey,
  initialSortDirection,
  columns,
  data,
  listRef,
  usePagination,
  resetPage,
  onSortChange
}: UseTableSortingParams<T>): UseTableSortingReturn<T> {
  ////////////////////////////////////
  // State Management: Track sort configuration
  ////////////////////////////////////
  
  // Initialize sort configuration with provided key and direction
  // If initialSortDirection is provided, use it; otherwise default to "ascending" if initialSortKey exists
  const [sortConfig, setSortConfig] = useState<SortConfig>(() => {
    if (initialSortKey) {
      return {
        key: initialSortKey,
        direction: initialSortDirection || "ascending"
      };
    }
    return {
      key: "",
      direction: "none"
    };
  });
  const sortConfigRef = useRef(sortConfig);
  sortConfigRef.current = sortConfig;

  // Reset sort configuration when initialSortKey or initialSortDirection changes
  useEffect(() => {
    if (initialSortKey) {
      setSortConfig({
        key: initialSortKey,
        direction: initialSortDirection || "ascending"
      });
    } else {
      setSortConfig({
        key: "",
        direction: "none"
      });
    }
  }, [initialSortKey, initialSortDirection]);

  // Reset sort configuration when columns change (meaning we moved to a different type of table)
  useEffect(() => {
    if (initialSortKey) {
      setSortConfig({
        key: initialSortKey,
        direction: initialSortDirection || "ascending"
      });
    } else {
      setSortConfig({
        key: "",
        direction: "none"
      });
    }
  }, [columns, initialSortKey, initialSortDirection]);

  ////////////////////////////////////
  // Event Handlers: Sort column changes and direction toggling
  ////////////////////////////////////
  
  /**
   * Handle sort column changes with direction cycling
   * Cycles through: ascending → descending → none → ascending
   * Resets pagination and scrolls to top when sort changes
   * 
   * @param {string} key - Column key to sort by
   */
  const handleSort = useCallback((key: string) => {
    const prev = sortConfigRef.current;
    const next: SortConfig =
      prev.key !== key
        ? { key, direction: "ascending" }
        : prev.direction === "ascending"
          ? { key, direction: "descending" }
          : prev.direction === "descending"
            ? { key: "", direction: "none" }
            : { key, direction: "ascending" };
    setSortConfig(next);
    onSortChange?.(buildSortSpec(next));

    if (usePagination) resetPage();
    if (listRef.current) listRef.current.scrollTo(0);
  }, [usePagination, resetPage, listRef, onSortChange]);

  ////////////////////////////////////
  // Data Processing: Apply sorting to filtered data
  ////////////////////////////////////
  
  /**
   * Sort filtered data based on current sort configuration
   * Handles different data types (numbers, strings, dates) appropriately
   * Returns original data when direction is "none" or key is empty
   */
  const sortedData = useMemo(() => {
    const { key, direction } = sortConfig;
    // Return original data if no sort key is specified or direction is "none"
    if (!key || direction === "none") return data;
    
    // Create sorted copy of the data array
    return [...data].sort((a, b) => {
      // Extract values for comparison
      const aValue = a[key as keyof T];
      const bValue = b[key as keyof T];
      
      // Handle null/undefined values (place them at the end)
      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;
      
      // Find column definition to determine data type
      const column = columns.find(col => col.key === key);
      
      let comparison = 0;
      
      // Sort based on data type
      if (column?.isNumberField) {
        // Handle numeric sorting with proper type conversion
        const aNum = typeof aValue === 'number' ? aValue : parseFloat(String(aValue));
        const bNum = typeof bValue === 'number' ? bValue : parseFloat(String(bValue));
        
        // Handle invalid numbers (place them at the end)
        if (isNaN(aNum)) return 1;
        if (isNaN(bNum)) return -1;
        
        comparison = aNum - bNum;
      } else {
        // Handle string sorting (works for dates too with MM/DD/YYYY format)
        comparison = String(aValue).localeCompare(String(bValue));
      }
      
      // Apply sort direction
      return direction === 'ascending' ? comparison : -comparison;
    });
  }, [data, sortConfig, columns]);

  // Return sorting state and handlers
  return {
    sortConfig,
    handleSort,
    sortedData
  };
} 