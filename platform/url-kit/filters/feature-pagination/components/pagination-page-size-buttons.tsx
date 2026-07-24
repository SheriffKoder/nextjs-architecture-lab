'use client'

import React from 'react'
import { cn } from '@/shared/lib/utils'

export interface PaginationPageSizeButtonsProps {
  options: number[]
  limit: number
  onLimitChange: (limit: number) => void
  className?: string
  /** When true, all preset buttons are non-interactive */
  disabled?: boolean
  allowShowAll?: boolean
  isShowAll?: boolean
  onShowAll?: () => void
  showAllLabel?: string
}

/**
 * URL-driven page size presets (e.g. 10 / 20 / 50). Pairs with useUrlPagination `setLimit`.
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

  const presetButtonClass = (active: boolean) =>
    cn(
      'rounded-md border px-2 py-1 text-xs font-medium transition-colors',
      active
        ? 'border-primary bg-primary text-white'
        : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50 dark:border-border dark:bg-background dark:text-foreground',
      disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
    )

  return (
    <div
      className={cn('flex flex-wrap items-center gap-1', className)}
      role="group"
      aria-label="Rows per page"
    >
      {options.map((n) => {
        const isActive = !isShowAll && limit === n
        return (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onLimitChange(n)}
            className={presetButtonClass(isActive)}
            aria-pressed={isActive}
            aria-label={`${n} items per page`}
          >
            {n}
          </button>
        )
      })}
      {allowShowAll && onShowAll ? (
        <button
          type="button"
          disabled={disabled}
          onClick={onShowAll}
          className={presetButtonClass(isShowAll)}
          aria-pressed={isShowAll}
          aria-label="Show all items"
        >
          {showAllLabel}
        </button>
      ) : null}
    </div>
  )
}
