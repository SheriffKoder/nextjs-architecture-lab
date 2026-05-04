/**
 * useTablePagination Hook
 * 
 * Purpose: Manages pagination state and logic for virtualized table
 * Used in: VirtualizedTable component
 * Why: Separates pagination concerns and provides reusable pagination functionality
 * 
 * Steps:
 * 1. Initialize pagination state
 * 2. Provide page change handlers
 * 3. Calculate pagination data
 * 4. Handle pagination mode toggling
 */

import { useState, useCallback, useMemo, RefObject } from "react";
import { FixedSizeList, VariableSizeList } from "react-window";

////////////////////////////////////
// Type Definitions: Pagination state and configuration
////////////////////////////////////

/**
 * Parameters for the useTablePagination hook
 */
interface UseTablePaginationParams {
  // Initial pagination mode
  initialPaginationMode: boolean;
  // Number of items per page
  itemsPerPage: number;
  // Total number of items to paginate
  totalItems: number;
  // Reference to virtualized list for scroll control
  listRef: RefObject<FixedSizeList | VariableSizeList>;
}

/**
 * Return object from useTablePagination hook
 */
interface UseTablePaginationReturn {
  // Current page number
  currentPage: number;
  // Total number of pages
  totalPages: number;
  // Whether pagination mode is enabled
  usePagination: boolean;
  // Data to display based on pagination settings
  displayData: any[];
  // Handler for page changes
  handlePageChange: (page: number) => void;
  // Handler for pagination mode toggle
  togglePaginationMode: () => void;
  // Function to reset to first page
  resetPage: () => void;
}

////////////////////////////////////
// Hook Implementation: Pagination logic and state management
////////////////////////////////////

/**
 * Custom hook that manages table pagination functionality
 * Provides pagination state, handlers, and display data
 * 
 * @param {UseTablePaginationParams} params - Configuration parameters
 * @returns {UseTablePaginationReturn} Pagination state and handlers
 * 
 * @example
 * ```tsx
 * const { currentPage, totalPages, displayData, handlePageChange } = useTablePagination({
 *   initialPaginationMode: false,
 *   itemsPerPage: 20,
 *   totalItems: sortedData.length,
 *   listRef
 * });
 * ```
 */
export function useTablePagination({
  initialPaginationMode,
  itemsPerPage,
  totalItems,
  listRef
}: UseTablePaginationParams): UseTablePaginationReturn {
  ////////////////////////////////////
  // State Management: Track pagination state
  ////////////////////////////////////
  
  // Initialize current page to first page
  const [currentPage, setCurrentPage] = useState(1);
  // Initialize pagination mode based on props
  const [usePagination, setUsePagination] = useState(initialPaginationMode);

  ////////////////////////////////////
  // Calculations: Pagination metrics and data slicing
  ////////////////////////////////////
  
  /**
   * Calculate total number of pages based on items per page
   */
  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / itemsPerPage);
  }, [totalItems, itemsPerPage]);

  /**
   * Get data slice for current page
   * Returns all data if pagination is disabled
   */
  const displayData = useMemo(() => {
    // Return all data if pagination is disabled
    if (!usePagination) return [];
    
    // Calculate start and end indices for current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    // Return empty array (actual data will be passed from parent)
    // This hook only manages pagination state, not the actual data
    return [];
  }, [usePagination, currentPage, itemsPerPage]);

  ////////////////////////////////////
  // Event Handlers: Page changes and mode toggling
  ////////////////////////////////////
  
  /**
   * Handle page number changes
   * Updates current page and scrolls to top
   * 
   * @param {number} page - New page number
   */
  const handlePageChange = useCallback((page: number) => {
    // Update current page
    setCurrentPage(page);
    
    // Scroll to top when page changes for better UX
    if (listRef.current) {
      listRef.current.scrollTo(0);
    }
  }, [listRef]);

  /**
   * Toggle between pagination and virtualization modes
   * Resets to first page when switching modes
   */
  const togglePaginationMode = useCallback(() => {
    // Toggle pagination mode
    setUsePagination(prev => !prev);
    
    // Reset to first page when switching modes
    setCurrentPage(1);
  }, []);

  /**
   * Reset current page to first page
   * Useful for external triggers (sorting, filtering)
   */
  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  // Return pagination state and handlers
  return {
    currentPage,
    totalPages,
    usePagination,
    displayData,
    handlePageChange,
    togglePaginationMode,
    resetPage
  };
} 