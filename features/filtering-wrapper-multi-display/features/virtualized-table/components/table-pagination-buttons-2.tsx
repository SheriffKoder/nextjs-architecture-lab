/**
 * VirtualizedTablePaginationNumbers Component
 * 
 * Purpose: Renders page numbers with navigation arrows for pagination
 * Used in: VirtualizedTable component (alongside existing pagination)
 * Why: Provides detailed page navigation with current page context
 * 
 * Steps:
 * 1. Import required types and icons
 * 2. Define component props interface
 * 3. Calculate page numbers to display
 * 4. Render navigation arrows and page numbers
 * 5. Handle page change interactions
 */

import React from "react";
// Import Lucide icons for navigation arrows
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";

////////////////////////////////////
// Type Definitions: Component props and interfaces
////////////////////////////////////

/**
 * Props for the VirtualizedTablePaginationNumbers component
 * Provides pagination state and handlers
 */
interface VirtualizedTablePaginationNumbersProps {
  // Current active page number
  currentPage: number;
  // Total number of pages available
  totalPages: number;
  // Handler for page changes
  onPageChange: (page: number) => void;
}

////////////////////////////////////
// Component Implementation: Page number navigation
////////////////////////////////////

/**
 * Pagination component with page numbers and navigation arrows
 * Shows current page with surrounding context and quick navigation
 * 
 * @param {VirtualizedTablePaginationNumbersProps} props - Component props
 * @returns {JSX.Element} Page number navigation with arrows
 * 
 * @example
 * ```tsx
 * <VirtualizedTablePaginationNumbers
 *   currentPage={3}
 *   totalPages={10}
 *   onPageChange={handlePageChange}
 * />
 * ```
 */
const VirtualizedTablePaginationNumbers: React.FC<VirtualizedTablePaginationNumbersProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  ////////////////////////////////////
  // Page Number Calculation: Determine which pages to show
  ////////////////////////////////////
  
  /**
   * Calculate which page numbers to display around current page
   * Shows current page with 2 pages on each side when possible
   * 
   * @returns {number[]} Array of page numbers to display
   */
  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    
    // Calculate range around current page
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    // Add pages in range
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  ////////////////////////////////////
  // Navigation Handlers: Quick navigation functions
  ////////////////////////////////////
  
  /**
   * Navigate to first page
   */
  const goToFirst = () => onPageChange(1);
  
  /**
   * Navigate to previous page
   */
  const goToPrevious = () => onPageChange(Math.max(1, currentPage - 1));
  
  /**
   * Navigate to next page
   */
  const goToNext = () => onPageChange(Math.min(totalPages, currentPage + 1));
  
  /**
   * Navigate to last page
   */
  const goToLast = () => onPageChange(totalPages);

  ////////////////////////////////////
  // Main Render: Navigation arrows and page numbers
  ////////////////////////////////////
  
  return (
    <div className="flex items-center justify-center space-x-1">
      {/* First page navigation */}
      <button
        onClick={goToFirst}
        disabled={currentPage === 1}
        className={`p-2 rounded-md transition-colors ${
          currentPage === 1
            ? "text-gray-300 cursor-not-allowed"
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
        }`}
        aria-label="Go to first page"
      >
        <ChevronsLeft size={16} />
      </button>
      
      {/* Previous page navigation */}
      <button
        onClick={goToPrevious}
        disabled={currentPage === 1}
        className={`p-2 rounded-md transition-colors ${
          currentPage === 1
            ? "text-gray-300 cursor-not-allowed"
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
        }`}
        aria-label="Go to previous page"
      >
        <ChevronLeft size={16} />
      </button>
      
      {/* Page numbers */}
      <div className="flex items-center space-x-1">
        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              currentPage === page
                ? "bg-primary text-white"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
            aria-label={`Go to page ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </button>
        ))}
      </div>
      
      {/* Next page navigation */}
      <button
        onClick={goToNext}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-md transition-colors ${
          currentPage === totalPages
            ? "text-gray-300 cursor-not-allowed"
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
        }`}
        aria-label="Go to next page"
      >
        <ChevronRight size={16} />
      </button>
      
      {/* Last page navigation */}
      <button
        onClick={goToLast}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-md transition-colors ${
          currentPage === totalPages
            ? "text-gray-300 cursor-not-allowed"
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
        }`}
        aria-label="Go to last page"
      >
        <ChevronsRight size={16} />
      </button>
    </div>
  );
};

// Export component with React.memo for performance optimization
export default React.memo(VirtualizedTablePaginationNumbers); 