/**
 * Pagination Wrapper Component
 * 
 * Purpose: Client component wrapper for pagination that uses useUrlPagination hook
 * Used in: RSC pages that need pagination functionality
 * Why: RSC pages can't use hooks directly, so this wrapper provides the client-side logic
 */

'use client'

import React, { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { useUrlPagination } from '../hooks'
import { shouldHidePaginationForUseAllView } from '../utils'
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

  /**
   * When `all=1` and current `view` is in this list, hide the entire pagination UI.
   */
  hideWhenShowAllForViews?: readonly string[]

  /** View used when `view` param is absent (default: `table`) */
  defaultView?: string
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
  textDisplay = false,
  hideWhenShowAllForViews,
  defaultView = 'table',
}: PaginationWrapperProps) {
  const searchParams = useSearchParams()
  const hidden = useMemo(
    () =>
      shouldHidePaginationForUseAllView(searchParams, {
        useAllItems: hideWhenShowAllForViews,
        defaultView,
      }),
    [searchParams, hideWhenShowAllForViews, defaultView],
  )

  const {
    page,
    limit,
    isShowAll,
    setPage,
    setLimit,
    setShowAll,
    calculatePagination,
  } = useUrlPagination(config)
  const paginationInfo = calculatePagination(totalItems)

  const showPageSizeSelector = useMemo(() => {
    const opts = config?.pageSizeOptions
    // If there are preset page size options, show the page size selector
    const hasPresets = opts && opts.length > 0
    // If show all is allowed, show the page size selector
    const hasShowAll = config?.allowShowAll === true
    // If there are no preset page size options and show all is not allowed, don't show the page size selector
    if (!hasPresets && !hasShowAll) return false
    // If page size change is not allowed and show all is not allowed, don't show the page size selector
    if (config.allowPageSizeChange === false && !hasShowAll) return false
    return hasPresets || hasShowAll
  }, [config?.pageSizeOptions, config?.allowPageSizeChange, config?.allowShowAll])

  if (hidden) {
    return null
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 flex-wrap items-center gap-3 my-2">
          <PaginationInfo
            startItem={paginationInfo.startItem}
            endItem={paginationInfo.endItem}
            totalItems={totalItems}
            showAll={isShowAll}
          />
          {showPageSizeSelector ? (
            <PaginationPageSizeButtons
              options={config?.pageSizeOptions ?? []}
              limit={limit}
              onLimitChange={setLimit}
              allowShowAll={config?.allowShowAll}
              isShowAll={isShowAll}
              onShowAll={config?.allowShowAll ? setShowAll : undefined}
              showAllLabel={config?.showAllLabel}
            />
          ) : null}
        </div>
        {!isShowAll ? (
          <PaginationButtons
            currentPage={page}
            totalPages={paginationInfo.totalPages}
            onPageChange={setPage}
            textDisplay={textDisplay}
          />
        ) : null}
      </div>
    </div>
  )
}
