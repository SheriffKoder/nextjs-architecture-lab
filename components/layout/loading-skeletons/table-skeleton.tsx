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

import styles from './table-skeleton.module.css'
import { ArrowUpDownIcon, ListFilterIcon } from 'lucide-react'
import PaginationSkeleton from './pagination-skeleton'

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
    <div className="h-full w-full flex flex-col">
      <div
        className={[styles.rootAppear, 'blur-sm  overflow-hidden rounded-sm  border-border/50'].join(
          ' '
        )}
      >
        {/* Table header skeleton */}
        {/* Why: Match table header structure */}
        {/* How: Row with LoadingValue components for each column */}
        {showHeader && (
          <div className="flex items-stretch min-h-[58.33px]">
            {Array.from({ length: columnCount }).map((_, index) => {
              const isFirst = index === 0
              const isLast = index === columnCount - 1
              return (
                <div
                  key={`header-${index}`}
                  className={[
                    'relative flex items-center border-b border-t border-border/50 bg-[#f1f1f1] px-4 py-2 dark:bg-[#131313]',
                    'flex items-center justify-start gap-2',
                    isFirst ? 'rounded-tl border-l' : '',
                    isLast ? 'rounded-tr' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{ minWidth: columnMinWidth }}
                >
                  {/* <LoadingValue className="h-5 w-20 opacity-50" /> */}
                  <span className='text-foreground text-sm font-bold'>{`Header ${index}`}</span>
                  <ListFilterIcon className='w-4 h-4 text-tertiary' />
                  <ArrowUpDownIcon className='w-4 h-4 text-tertiary ml-2' />
                </div>
              )
            })}
          </div>
        )}

        {/* Table body skeleton rows */}
        {/* Why: Match table row structure */}
        {/* How: Multiple rows with LoadingValue components for each column */}
        <div>
          {Array.from({ length: rowCount }).map((_, rowIndex) => {
            return (
            <div
              key={`row-${rowIndex}`}
              data-index={rowIndex}
              className={[
                styles.rowAppear,
                'flex items-stretch border-b border-tertiary/10 bg-tertiary/5',
              ].join(' ')}
            >
              {Array.from({ length: columnCount }).map((_, colIndex) => (
                <div
                  key={`cell-${rowIndex}-${colIndex}`}
                  className={[
                    'border-b border-tertiary/5 px-4 py-3 last:border-r-0 h-[58.33px]',
                    colIndex === 0 ? 'border-l' : '',
                    colIndex === columnCount - 1 ? 'border-r' : '',
                  ].join(' ')}
                  style={{ minWidth: columnMinWidth }}
                >
                  {/* <LoadingValue className="h-4 w-full" /> */}
                  <span className='text-foreground/50 blur-sm'>{`Cell ${rowIndex}-${colIndex}`}</span>
                </div>
              ))}
            </div>
          )})}
        </div>
      </div>

      <div className='mt-auto flex items-center justify-end'>
        <PaginationSkeleton />
      </div>
    </div>
  )
}
