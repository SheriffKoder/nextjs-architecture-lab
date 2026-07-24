/**
 * Pagination Feature Types
 * 
 * Purpose: TypeScript interfaces and types for pagination feature
 * Used in: All pagination components and hooks
 * Why: Provides type safety and consistent pagination configuration
 */

/**
 * Pagination configuration
 * WHY: Defines default page size and available options
 * HOW: Used to configure pagination behavior
 */
export interface PaginationConfig {
  /**
   * Default items per page
   */
  defaultPageSize?: number
  
  /**
   * Available page size options (e.g., [10, 20, 50, 100])
   */
  pageSizeOptions?: number[]
  
  /**
   * Whether page size is configurable by user
   */
  allowPageSizeChange?: boolean

  /**
   * Show an "All" control that sets `all=1` and removes `page` / `limit` from the URL
   */
  allowShowAll?: boolean

  /** Label for the show-all button (default: "All") */
  showAllLabel?: string
}

/**
 * Pagination state from URL
 * WHY: Represents current pagination state from URL parameters
 * HOW: Used to read/write pagination state
 */
export interface PaginationState {
  /**
   * Current page number (1-indexed)
   */
  page: number
  
  /**
   * Items per page
   */
  limit: number
}

/**
 * Calculated pagination values
 * WHY: Derived values computed from pagination state and total items
 * HOW: Used for display and navigation logic
 */
export interface PaginationCalculated {
  /**
   * Total number of pages
   */
  totalPages: number
  
  /**
   * Whether on first page
   */
  isFirst: boolean
  
  /**
   * Whether on last page
   */
  isLast: boolean
  
  /**
   * Whether there's a next page
   */
  hasNext: boolean
  
  /**
   * Whether there's a previous page
   */
  hasPrevious: boolean
  
  /**
   * First item number on current page (1-indexed)
   */
  startItem: number
  
  /**
   * Last item number on current page (1-indexed)
   */
  endItem: number
}

/**
 * Complete pagination info (state + calculated + totalItems)
 * WHY: Complete pagination information for components
 * HOW: Combines state, calculated values, and total items
 */
export interface PaginationInfo extends PaginationState, PaginationCalculated {
  /**
   * Total number of items
   */
  totalItems: number
}

/**
 * Props for PaginationButtons component
 * WHY: Type-safe props for pagination buttons
 * HOW: Defines required and optional props
 */
export interface PaginationButtonsProps {
  /**
   * Current page number
   */
  currentPage: number
  
  /**
   * Total number of pages
   */
  totalPages: number
  
  /**
   * Handler for page changes
   */
  onPageChange: (page: number) => void
  
  /**
   * Optional CSS classes
   */
  className?: string
  
  /**
   * Maximum number of page buttons to show (default: 5)
   */
  maxPagesToShow?: number
  
  /**
   * Show text labels instead of chevron icons for navigation buttons
   */
  textDisplay?: boolean
}

/**
 * Props for PaginationInfo component
 * WHY: Type-safe props for pagination info display
 * HOW: Defines required and optional props
 */
export interface PaginationInfoProps {
  /**
   * Start item number (1-indexed)
   */
  startItem: number
  
  /**
   * End item number (1-indexed)
   */
  endItem: number
  
  /**
   * Total number of items
   */
  totalItems: number
  
  /**
   * Optional CSS classes
   */
  className?: string

  /** When true, display "Showing all N" instead of a page range */
  showAll?: boolean
}

/**
 * Props for combined Pagination component
 * WHY: Type-safe props for combined pagination component
 * HOW: Defines props for optional combined component
 */
export interface PaginationProps {
  /**
   * Total number of items
   */
  totalItems: number
  
  /**
   * Optional CSS classes
   */
  className?: string
  
  /**
   * Show info text (default: true)
   */
  showInfo?: boolean
  
  /**
   * Show page size selector (default: false)
   */
  showPageSizeSelector?: boolean
}
