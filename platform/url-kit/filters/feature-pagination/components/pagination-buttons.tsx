/**
 * Pagination Buttons Component
 * 
 * Purpose: Renders page number buttons with navigation arrows for pagination
 * Used in: Pages that need pagination UI
 * Why: Provides detailed page navigation with current page context and ellipsis
 * 
 * Features:
 * - Page number buttons with ellipsis for large page counts
 * - Previous/Next navigation
 * - First/Last navigation
 * - Disabled states for boundaries
 * - Accessible (aria-labels, aria-current)
 * - Configurable max pages to show
 */

'use client'

import React, { useMemo } from 'react'
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react'
import type { PaginationButtonsProps } from '../types'
import { cn } from '@/shared/lib/utils'

/**
 * Pagination component with page numbers and navigation arrows
 * Shows current page with surrounding context and quick navigation
 * 
 * @param {PaginationButtonsProps} props - Component props
 * @returns {JSX.Element} Page number navigation with arrows
 * 
 * @example
 * ```tsx
 * <PaginationButtons
 *   currentPage={3}
 *   totalPages={10}
 *   onPageChange={handlePageChange}
 * />
 * ```
 */
export function PaginationButtons({
  currentPage,
  totalPages,
  onPageChange,
  className,
  maxPagesToShow = 5,
  textDisplay = false
}: PaginationButtonsProps) {
  ////////////////////////////////////
  // Page Number Calculation: Determine which pages to show
  ////////////////////////////////////
  
  /**
   * Calculate which page numbers to display around current page
   * Shows current page with ellipsis when there are many pages
   * 
   * @returns {(number | string)[]} Array of page numbers or '...' for ellipsis
   */
  const getPageNumbers = useMemo(() => {
    const pages: (number | string)[] = []
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are few
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)
      
      // Calculate middle pages
      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)
      
      // Adjust if we're near the start
      if (currentPage <= 3) {
        endPage = Math.min(totalPages - 1, 4)
      }
      
      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 3)
      }
      
      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push('...')
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
      
      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pages.push('...')
      }
      
      // Always show last page
      pages.push(totalPages)
    }
    
    return pages
  }, [currentPage, totalPages, maxPagesToShow])

  ////////////////////////////////////
  // Navigation Handlers: Quick navigation functions
  ////////////////////////////////////
  
  /**
   * Navigate to first page
   */
  const goToFirst = () => onPageChange(1)
  
  /**
   * Navigate to previous page
   */
  const goToPrevious = () => onPageChange(Math.max(1, currentPage - 1))
  
  /**
   * Navigate to next page
   */
  const goToNext = () => onPageChange(Math.min(totalPages, currentPage + 1))
  
  /**
   * Navigate to last page
   */
  const goToLast = () => onPageChange(totalPages)

  // Calculate disabled states
  const isFirst = currentPage === 1
  const isLast = currentPage >= totalPages || totalPages === 0

  if (totalPages <= 1) {
    return null
  }

  // Base button styles - consistent for all buttons
  // WHY: All buttons should have same height and base styling
  // HOW: Use consistent padding and rounded corners
  const baseButtonStyles = "h-9 rounded-md border transition-colors"
  
  // Base styles for navigation buttons (first, prev, next, last)
  // WHY: Consistent styling for navigation buttons
  // HOW: Apply base styles + text/icon specific styles
  const navButtonBaseStyles = cn(
    baseButtonStyles,
    "text-tertiary border-tertiary/30 dark:border-tertiary/20 bg-tertiary/10 dark:bg-white/5",
    "hover:bg-tertiary/20",
    "disabled:text-tertiary/50 disabled:border-tertiary/50 disabled:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
  )
  
  // Base styles for page number buttons
  // WHY: Consistent styling for page number buttons
  // HOW: Apply base styles + active/hover states
  const pageButtonBaseStyles = cn(
    baseButtonStyles,
    "text-tertiary border-tertiary/30 dark:border-tertiary/20 bg-tertiary/10 dark:bg-white/5",
    "hover:bg-tertiary/20"
  )
  
  // Active page button styles
  // WHY: Selected page should be visually distinct
  // HOW: Use bg-tertiary for selected state
  const activePageButtonStyles = cn(
    baseButtonStyles,
    "bg-tertiary text-background border-tertiary/50"
  )

  ////////////////////////////////////
  // Main Render: Navigation arrows and page numbers
  ////////////////////////////////////
  
  return (
    <div className={cn("flex items-center justify-center space-x-1", className)}>
      {/* First page navigation */}
      <button
        onClick={goToFirst}
        disabled={isFirst}
        className={cn(
          navButtonBaseStyles,
          textDisplay ? "px-3 min-w-[3rem]" : "p-2 w-9"
        )}
        aria-label="Go to first page"
      >
        {textDisplay ? (
          <span className="text-sm font-medium">First</span>
        ) : (
          <ChevronsLeft size={16} />
        )}
      </button>
      
      {/* Previous page navigation */}
      <button
        onClick={goToPrevious}
        disabled={isFirst}
        className={cn(
          navButtonBaseStyles,
          textDisplay ? "px-3 min-w-[3rem]" : "p-2 w-9"
        )}
        aria-label="Go to previous page"
      >
        {textDisplay ? (
          <span className="text-sm font-medium">Prev</span>
        ) : (
          <ChevronLeft size={16} />
        )}
      </button>
      
      {/* Page numbers */}
      <div className="flex items-center space-x-1">
        {getPageNumbers.map((page, index) => {
          if (typeof page === 'number') {
            const isActive = currentPage === page
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={cn(
                  isActive ? activePageButtonStyles : pageButtonBaseStyles,
                  "px-3 min-w-[2.25rem] text-sm font-medium"
                )}
                aria-label={`Go to page ${page}`}
                aria-current={isActive ? "page" : undefined}
              >
                {page}
              </button>
            )
          } else {
            // Ellipsis
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 h-9 flex items-center text-sm text-muted-foreground"
              >
                {page}
              </span>
            )
          }
        })}
      </div>
      
      {/* Next page navigation */}
      <button
        onClick={goToNext}
        disabled={isLast}
        className={cn(
          navButtonBaseStyles,
          textDisplay ? "px-3 min-w-[3rem]" : "p-2 w-9"
        )}
        aria-label="Go to next page"
      >
        {textDisplay ? (
          <span className="text-sm font-medium">Next</span>
        ) : (
          <ChevronRight size={16} />
        )}
      </button>
      
      {/* Last page navigation */}
      <button
        onClick={goToLast}
        disabled={isLast}
        className={cn(
          navButtonBaseStyles,
          textDisplay ? "px-3 min-w-[3rem]" : "p-2 w-9"
        )}
        aria-label="Go to last page"
      >
        {textDisplay ? (
          <span className="text-sm font-medium">Last</span>
        ) : (
          <ChevronsRight size={16} />
        )}
      </button>
    </div>
  )
}
