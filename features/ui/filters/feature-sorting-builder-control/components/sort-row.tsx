/**
 * Sort Row Component
 * 
 * Purpose: Individual sort row with key dropdown, direction dropdown, remove, and reorder buttons
 * Used in: SortingControl component
 * Why: Provides UI for managing a single sort with all controls
 */

'use client'

import React from 'react'
import { X, MoveUp, MoveDown } from 'lucide-react'
import { SortKeyDropdown } from './sort-key-dropdown'
import { SortDirectionDropdown } from './sort-direction-dropdown'
import type { SortRowProps } from '../types'

/**
 * SortRow component - individual sort row with controls
 * WHY: Provides UI for managing a single sort
 * HOW: Renders priority badge, key dropdown, direction dropdown, remove button, and reorder buttons
 */
export function SortRow({
  sort,
  level,
  availableConfigs,
  allSorts,
  isFirst,
  isLast,
  onSortChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: SortRowProps) {
  // Get excluded keys (all other sort keys)
  const excludedKeys = allSorts.filter(s => s.key !== sort.key).map(s => s.key)

  // Handle key change
  const handleKeyChange = (newKey: string) => {
    onSortChange(newKey, sort.direction)
  }

  // Handle direction change
  const handleDirectionChange = (newDirection: 'asc' | 'desc') => {
    onSortChange(sort.key, newDirection)
  }

  return (
    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
      {/* Priority Badge */}
      <span className="text-xs font-medium text-muted-foreground w-[1.5rem]">
        {level + 1}
      </span>

      {/* Key Dropdown */}
      <SortKeyDropdown
        selectedKey={sort.key}
        availableConfigs={availableConfigs}
        excludedKeys={excludedKeys}
        onKeyChange={handleKeyChange}
      />

      {/* Direction Dropdown */}
      <SortDirectionDropdown
        selectedDirection={sort.direction}
        onDirectionChange={handleDirectionChange}
      />

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors"
        title="Remove sort"
      >
        <X className="w-3 h-3" />
      </button>

      {/* Move Up Button */}
      <button
        onClick={onMoveUp}
        disabled={isFirst}
        className={`p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors ${
          isFirst ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title="Move up"
      >
        <MoveUp className="w-3 h-3" />
      </button>

      {/* Move Down Button */}
      <button
        onClick={onMoveDown}
        disabled={isLast}
        className={`p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors ${
          isLast ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title="Move down"
      >
        <MoveDown className="w-3 h-3" />
      </button>
    </div>
  )
}
