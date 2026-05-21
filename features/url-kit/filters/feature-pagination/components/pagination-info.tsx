/**
 * Pagination Info Component
 * 
 * Purpose: Displays pagination range information (e.g., "Showing 1-10 of 100")
 * Used in: Pages that need to show pagination status
 * Why: Provides clear feedback about current page range and total items
 */

'use client'

import React from 'react'
import type { PaginationInfoProps } from '../types'
import { cn } from '@/lib/utils'

/**
 * Pagination info component that displays range text
 * Shows "Showing X-Y of Z" format
 * 
 * @param {PaginationInfoProps} props - Component props
 * @returns {JSX.Element} Pagination info text
 * 
 * @example
 * ```tsx
 * <PaginationInfo
 *   startItem={1}
 *   endItem={10}
 *   totalItems={100}
 * />
 * ```
 */
export function PaginationInfo({
  startItem,
  endItem,
  totalItems,
  className
}: PaginationInfoProps) {
  // Handle empty state
  if (totalItems === 0) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        Showing 0 of 0
      </div>
    )
  }

  return (
    <div className={cn("text-sm text-muted-foreground", className)}>
      Showing {startItem}-{endItem} of {totalItems}
    </div>
  )
}
