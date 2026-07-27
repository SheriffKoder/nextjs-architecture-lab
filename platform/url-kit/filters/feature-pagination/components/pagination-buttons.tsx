'use client'

import React from 'react'
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/lib/utils'
import type { PaginationButtonsProps } from '../types'

/**
 * Page number navigation — **control** arrows + **selection** page buttons.
 */
export function PaginationButtons({
  currentPage,
  totalPages,
  onPageChange,
  className,
  maxPagesToShow = 5,
  textDisplay = false,
}: PaginationButtonsProps) {
  const getPageNumbers = React.useMemo(() => {
    const pages: (number | string)[] = []

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)

      if (currentPage <= 3) {
        endPage = Math.min(totalPages - 1, 4)
      }

      if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 3)
      }

      if (startPage > 2) {
        pages.push('...')
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      if (endPage < totalPages - 1) {
        pages.push('...')
      }

      pages.push(totalPages)
    }

    return pages
  }, [currentPage, totalPages, maxPagesToShow])

  const goToFirst = () => onPageChange(1)
  const goToPrevious = () => onPageChange(Math.max(1, currentPage - 1))
  const goToNext = () => onPageChange(Math.min(totalPages, currentPage + 1))
  const goToLast = () => onPageChange(totalPages)

  const isFirst = currentPage === 1
  const isLast = currentPage >= totalPages || totalPages === 0

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className={cn('flex items-center justify-center gap-1', className)}>
      <Button
        type="button"
        variant="control"
        size={textDisplay ? 'sm' : 'icon-sm'}
        onClick={goToFirst}
        disabled={isFirst}
        className={textDisplay ? 'min-w-[3rem] px-3' : undefined}
        aria-label="Go to first page"
      >
        {textDisplay ? (
          <span className="text-xs font-medium">First</span>
        ) : (
          <ChevronsLeft aria-hidden />
        )}
      </Button>

      <Button
        type="button"
        variant="control"
        size={textDisplay ? 'sm' : 'icon-sm'}
        onClick={goToPrevious}
        disabled={isFirst}
        className={textDisplay ? 'min-w-[3rem] px-3' : undefined}
        aria-label="Go to previous page"
      >
        {textDisplay ? (
          <span className="text-xs font-medium">Prev</span>
        ) : (
          <ChevronLeft aria-hidden />
        )}
      </Button>

      <div className="flex items-center gap-1">
        {getPageNumbers.map((page, index) => {
          if (typeof page === 'number') {
            const isActive = currentPage === page
            return (
              <Button
                key={page}
                type="button"
                variant="selection"
                size="sm"
                selected={isActive}
                onClick={() => onPageChange(page)}
                className="min-w-8 px-2 tabular-nums"
                aria-label={`Go to page ${page}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {page}
              </Button>
            )
          }

          return (
            <span
              key={`ellipsis-${index}`}
              className="flex h-8 items-center px-1.5 text-xs text-muted-foreground"
            >
              {page}
            </span>
          )
        })}
      </div>

      <Button
        type="button"
        variant="control"
        size={textDisplay ? 'sm' : 'icon-sm'}
        onClick={goToNext}
        disabled={isLast}
        className={textDisplay ? 'min-w-[3rem] px-3' : undefined}
        aria-label="Go to next page"
      >
        {textDisplay ? (
          <span className="text-xs font-medium">Next</span>
        ) : (
          <ChevronRight aria-hidden />
        )}
      </Button>

      <Button
        type="button"
        variant="control"
        size={textDisplay ? 'sm' : 'icon-sm'}
        onClick={goToLast}
        disabled={isLast}
        className={textDisplay ? 'min-w-[3rem] px-3' : undefined}
        aria-label="Go to last page"
      >
        {textDisplay ? (
          <span className="text-xs font-medium">Last</span>
        ) : (
          <ChevronsRight aria-hidden />
        )}
      </Button>
    </div>
  )
}
