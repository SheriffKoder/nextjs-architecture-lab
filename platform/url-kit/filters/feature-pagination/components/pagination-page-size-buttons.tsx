'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/lib/utils'

export interface PaginationPageSizeButtonsProps {
  options: number[]
  limit: number
  onLimitChange: (limit: number) => void
  className?: string
  disabled?: boolean
  allowShowAll?: boolean
  isShowAll?: boolean
  onShowAll?: () => void
  showAllLabel?: string
}

/**
 * URL-driven page size presets — **selection** variant.
 */
export function PaginationPageSizeButtons({
  options,
  limit,
  onLimitChange,
  className,
  disabled = false,
  allowShowAll = false,
  isShowAll = false,
  onShowAll,
  showAllLabel = 'All',
}: PaginationPageSizeButtonsProps) {
  if (options.length === 0 && !allowShowAll) return null

  return (
    <div
      className={cn('flex flex-wrap items-center gap-1', className)}
      role="group"
      aria-label="Rows per page"
    >
      {options.map((n) => {
        const isActive = !isShowAll && limit === n
        return (
          <Button
            key={n}
            type="button"
            variant="selection"
            size="sm"
            selected={isActive}
            disabled={disabled}
            onClick={() => onLimitChange(n)}
            className="min-w-8 px-2"
            aria-pressed={isActive}
            aria-label={`${n} items per page`}
          >
            {n}
          </Button>
        )
      })}
      {allowShowAll && onShowAll ? (
        <Button
          type="button"
          variant="selection"
          size="sm"
          selected={isShowAll}
          disabled={disabled}
          onClick={onShowAll}
          className="px-2"
          aria-pressed={isShowAll}
          aria-label="Show all items"
        >
          {showAllLabel}
        </Button>
      ) : null}
    </div>
  )
}
