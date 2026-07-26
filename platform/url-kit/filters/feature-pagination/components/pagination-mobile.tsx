/**
 * Mobile pagination bar:
 * `1-10 of 25` —— justify-between —— `[10 ▾]`  `[<] 1/3 [>]`
 */

'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/shared/lib/utils'
import { useUrlPagination } from '../hooks'
import { shouldHidePaginationForUseAllView } from '../utils'
import type { PaginationConfig } from '../types'

export interface PaginationMobileProps {
  totalItems: number
  config?: PaginationConfig
  className?: string
  hideWhenShowAllForViews?: readonly string[]
  defaultView?: string
}

export function PaginationMobile({
  totalItems,
  config,
  className,
  hideWhenShowAllForViews,
  defaultView = 'table',
}: PaginationMobileProps) {
  const searchParams = useSearchParams()
  const hidden = useMemo(
    () =>
      shouldHidePaginationForUseAllView(searchParams, {
        useAllItems: hideWhenShowAllForViews,
        defaultView,
      }),
    [searchParams, hideWhenShowAllForViews, defaultView]
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
  const { startItem, endItem, totalPages } = paginationInfo

  const showPageSizeSelector = useMemo(() => {
    const opts = config?.pageSizeOptions
    const hasPresets = opts && opts.length > 0
    const hasShowAll = config?.allowShowAll === true
    if (!hasPresets && !hasShowAll) return false
    if (config?.allowPageSizeChange === false && !hasShowAll) return false
    return Boolean(hasPresets || hasShowAll)
  }, [
    config?.pageSizeOptions,
    config?.allowPageSizeChange,
    config?.allowShowAll,
  ])

  if (hidden) return null

  const rangeLabel =
    totalItems === 0
      ? '0 of 0'
      : isShowAll
        ? `all ${totalItems}`
        : `${startItem}-${endItem} of ${totalItems}`

  const pageSizeLabel = isShowAll
    ? (config?.showAllLabel ?? 'All')
    : String(limit)

  const isFirst = page <= 1
  const isLast = page >= totalPages || totalPages === 0

  return (
    <div
      className={cn(
        'flex w-full items-center justify-between gap-3 px-2 py-2',
        className
      )}
    >
      <span className="min-w-0 truncate text-xs text-muted-foreground px-2">
        {rangeLabel}
      </span>

      <div className="flex shrink-0 items-center gap-2">
        {showPageSizeSelector ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  'inline-flex h-8 items-center gap-1 rounded-md border border-input px-2 text-xs font-medium',
                  'bg-background text-foreground hover:bg-foreground/5',
                  'focus:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                )}
                aria-label={`Rows per page: ${pageSizeLabel}`}
              >
                {pageSizeLabel}
                <ChevronDown className="size-3.5 opacity-60" aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[4.5rem]">
              {(config?.pageSizeOptions ?? []).map((n) => (
                <DropdownMenuItem
                  key={n}
                  onClick={() => setLimit(n)}
                  className={cn(
                    !isShowAll && limit === n && 'bg-accent'
                  )}
                >
                  {n}
                </DropdownMenuItem>
              ))}
              {config?.allowShowAll ? (
                <DropdownMenuItem
                  onClick={() => setShowAll()}
                  className={cn(isShowAll && 'bg-accent')}
                >
                  {config.showAllLabel ?? 'All'}
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}

        {!isShowAll && totalPages > 1 ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={isFirst}
              className={cn(
                'inline-flex size-8 items-center justify-center rounded-md border border-input',
                'bg-background text-foreground hover:bg-foreground/5',
                'disabled:cursor-not-allowed disabled:opacity-40'
              )}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>

            <span
              className="min-w-[2.75rem] text-center text-xs font-medium tabular-nums text-foreground"
              aria-label={`Page ${page} of ${totalPages}`}
            >
              {page}/{totalPages}
            </span>

            <button
              type="button"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={isLast}
              className={cn(
                'inline-flex size-8 items-center justify-center rounded-md border border-input',
                'bg-background text-foreground hover:bg-foreground/5',
                'disabled:cursor-not-allowed disabled:opacity-40'
              )}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
