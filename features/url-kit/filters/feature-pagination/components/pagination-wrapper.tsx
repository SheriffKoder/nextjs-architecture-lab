/**
 * Pagination Wrapper Component
 * 
 * Purpose: Client component wrapper for pagination that uses useUrlPagination hook
 * Used in: RSC pages that need pagination functionality
 * Why: RSC pages can't use hooks directly, so this wrapper provides the client-side logic
 */

'use client'

import React, { useMemo } from 'react'
import { useUrlPagination } from '../hooks'
import { PaginationButtons, PaginationInfo } from './index'
import { PaginationPageSizeButtons } from './pagination-page-size-buttons'
import type { PaginationConfig } from '../types'

interface PaginationWrapperProps {
  /**
   * Total number of items
   */
  totalItems: number
  
  /**
   * Optional pagination configuration
   */
  config?: PaginationConfig
  
  /**
   * Optional CSS classes
   */
  className?: string

  /**
   * Show text display
   */
  textDisplay?: boolean
}

/**
 * Pagination wrapper component that integrates with URL state
 * WHY: Provides complete pagination UI with URL state management
 * HOW: Uses useUrlPagination hook and renders PaginationInfo and PaginationButtons
 */
export function PaginationWrapper({
  totalItems,
  config,
  className,
  textDisplay = false
}: PaginationWrapperProps) {
  const { page, limit, setPage, setLimit, calculatePagination } = useUrlPagination(config)
  const paginationInfo = calculatePagination(totalItems)

  const showPageSizeSelector = useMemo(() => {
    const opts = config?.pageSizeOptions
    if (!opts || opts.length === 0) return false
    if (config.allowPageSizeChange === false) return false
    return true
  }, [config?.pageSizeOptions, config?.allowPageSizeChange])

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <PaginationInfo
            startItem={paginationInfo.startItem}
            endItem={paginationInfo.endItem}
            totalItems={totalItems}
          />
          {showPageSizeSelector && config?.pageSizeOptions ? (
            <PaginationPageSizeButtons
              options={config.pageSizeOptions}
              limit={limit}
              onLimitChange={setLimit}
            />
          ) : null}
        </div>
        <PaginationButtons
          currentPage={page}
          totalPages={paginationInfo.totalPages}
          onPageChange={setPage}
          textDisplay={textDisplay}
        />
      </div>
    </div>
  )
}
