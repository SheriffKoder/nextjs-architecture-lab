/**
 * Table Skeleton Component
 * 
 * Purpose: Loading skeleton for table displays
 * Used in: Loading states for pages with tables
 * Why: Provides consistent loading UI that matches table layout
 * 
 * Steps:
 * 1. Render skeleton header row
 * 2. Render multiple skeleton data rows
 */

import LoadingValue from '@/components/loading-value'

interface TableSkeletonProps {
  /** Number of columns to display */
  columnCount?: number
  /** Number of rows to display */
  rowCount?: number
  /** Minimum width for each column (default: 200px) */
  columnMinWidth?: string
  /** Whether to show header row */
  showHeader?: boolean
}

/**
 * Table skeleton component
 * 
 * Why: Matches table layout during loading
 * How: Uses LoadingValue components in table structure
 * 
 * Steps:
 * 1. Render header row with column skeletons
 * 2. Render data rows with column skeletons
 */
export default function TableSkeleton({
  columnCount = 5,
  rowCount = 10,
  columnMinWidth = '200px',
  showHeader = true
}: TableSkeletonProps) {
  return (
    <div className="h-full w-full">
      <div className="border rounded-lg overflow-hidden">
        {/* Table header skeleton */}
        {/* Why: Match table header structure */}
        {/* How: Row with LoadingValue components for each column */}
        {showHeader && (
          <div className="flex items-stretch bg-muted/50 border-b">
            {Array.from({ length: columnCount }).map((_, index) => (
              <div
                key={`header-${index}`}
                className="px-4 py-4 border-r last:border-r-0"
                style={{ minWidth: columnMinWidth }}
              >
                <LoadingValue className="h-5 w-20" />
              </div>
            ))}
          </div>
        )}

        {/* Table body skeleton rows */}
        {/* Why: Match table row structure */}
        {/* How: Multiple rows with LoadingValue components for each column */}
        <div className="divide-y">
          {Array.from({ length: rowCount }).map((_, rowIndex) => (
            <div
              key={`row-${rowIndex}`}
              className="flex items-stretch hover:bg-muted/30 transition-colors"
            >
              {Array.from({ length: columnCount }).map((_, colIndex) => (
                <div
                  key={`cell-${rowIndex}-${colIndex}`}
                  className="px-4 py-3 border-r last:border-r-0"
                  style={{ minWidth: columnMinWidth }}
                >
                  <LoadingValue className="h-4 w-full" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
