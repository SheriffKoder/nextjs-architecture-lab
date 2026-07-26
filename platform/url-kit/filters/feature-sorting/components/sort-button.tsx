'use client'

import React from 'react'
import { MoveUp, MoveDown } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useUrlSorting } from '../hooks/useUrlSorting'
import type { SortButtonProps } from '../types'

/**
 * SortButton component - single sort toggle button
 * WHY: Provides simple toggle functionality for individual sort fields
 * HOW: Uses useUrlSorting hook to manage sort state, cycles through states on click
 * @param {SortButtonProps} props - Component props
 * @returns {React.ReactElement} Sort button with up/down arrows
 */
export function SortButton({
  sortKey,
  label,
  className = '',
  showPriority = true
}: SortButtonProps) {
  const { getSort, toggleSort, getSortLevel } = useUrlSorting()
  
  const currentDirection = getSort(sortKey)
  const isAscending = currentDirection === 'asc'
  const isDescending = currentDirection === 'desc'
  const priority = showPriority ? getSortLevel(sortKey) : null
  
  const handleClick = () => {
    toggleSort(sortKey)
  }
  
  return (
    <button
      className={cn(
        'ml-1 -mt-0.5 rounded p-1 transition-colors hover:bg-foreground/10',
        className,
      )}
      onClick={handleClick}
      aria-label={`Sort by ${label || sortKey}`}
      title={`Sort by ${label || sortKey}`}
    >
      <div className="relative flex flex-row items-center gap-0">
        <MoveUp 
          size={12} 
          strokeWidth={2.5}
          className={`-mr-0.25 transition-colors ${
            isAscending ? "text-primary" : "text-tertiary"
          }`}
        />
        <MoveDown 
          size={12} 
          strokeWidth={2.5}
          className={`-ml-1 transition-colors ${
            isDescending ? "text-primary" : "text-tertiary"
          }`}
        />
        {showPriority && priority !== null && (
          <span className="absolute -right-0.5 -top-2 flex h-3 w-3 items-center justify-center rounded-full bg-tertiary text-[8px] font-medium text-background">
            {priority + 1}
          </span>
        )}
      </div>
    </button>
  )
}
