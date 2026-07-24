/**
 * SortButton Component
 * 
 * Purpose: Single reusable sort button that toggles sort state
 * Used in: Anywhere sorting is needed for a specific field
 * Why: Provides simple toggle functionality for individual sort fields
 * 
 * Features:
 * - Toggles through: none → asc → desc → none
 * - Shows active state with highlighted arrows
 * - Accessible with aria-label
 * - Matches styling from filtering-table-header
 */

'use client'

import React from 'react'
import { MoveUp, MoveDown } from 'lucide-react'
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
      className={`ml-1 -mt-0.5 p-1 rounded transition-colors hover:bg-foreground/10 ${className}`}
      onClick={handleClick}
      aria-label={`Sort by ${label || sortKey}`}
      title={`Sort by ${label || sortKey}`}
    >
      <div className="flex flex-row items-center gap-0 relative">
        {/* Up arrow */}
        <MoveUp 
          size={12} 
          strokeWidth={2.5}
          className={`transition-colors -mr-0.25 ${
            isAscending ? "text-primary" : "text-tertiary"
          }`}
        />
        {/* Down arrow */}
        <MoveDown 
          size={12} 
          strokeWidth={2.5}
          className={`transition-colors -ml-1 ${
            isDescending ? "text-primary" : "text-tertiary"
          }`}
        />
        {/* Priority badge (shows sort level: 1, 2, 3, etc.) */}
        {showPriority && priority !== null && (
          <span className="absolute -top-2 -right-0.5 bg-tertiary text-background text-[8px] font-medium rounded-full h-3 w-3 flex items-center justify-center">
            {priority + 1}
          </span>
        )}
      </div>
    </button>
  )
}
