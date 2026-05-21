'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface PaginationPageSizeButtonsProps {
  options: number[]
  limit: number
  onLimitChange: (limit: number) => void
  className?: string
  /** When true, all preset buttons are non-interactive */
  disabled?: boolean
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
}: PaginationPageSizeButtonsProps) {
  if (options.length === 0) return null

  return (
    <div
      className={cn('flex flex-wrap items-center gap-1', className)}
      role="group"
      aria-label="Rows per page"
    >
      {/* <span className="mr-1 text-xs text-gray-500 dark:text-muted-foreground">Per page</span> */}
      {options.map((n) => {
        const isActive = limit === n
        return (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onLimitChange(n)}
            className={cn(
              'rounded-md border px-2 py-1 text-xs font-medium transition-colors',
              isActive
                ? 'border-primary bg-primary text-white'
                : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50 dark:border-border dark:bg-background dark:text-foreground',
              disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            )}
            aria-pressed={isActive}
            aria-label={`${n} items per page`}
          >
            {n}
          </button>
        )
      })}
    </div>
  )
}
