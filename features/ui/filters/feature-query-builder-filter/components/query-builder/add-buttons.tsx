/**
 * Add Buttons Component
 * 
 * Purpose: Buttons for adding conditions and groups
 * Used in: GroupNode component
 * Why: Provides UI for adding new filter nodes
 */

'use client'

import React from 'react'

interface AddButtonsProps {
  onAddCondition: () => void
  onAddGroup: () => void
  className?: string
}

/**
 * AddButtons component - add condition and group buttons
 * WHY: Provides UI for adding new filter nodes
 * HOW: Renders two buttons with callbacks
 */
export function AddButtons({
  onAddCondition,
  onAddGroup,
  className,
}: AddButtonsProps) {
  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <button
        onClick={onAddCondition}
        className="px-3 py-1.5 text-xs text-foreground hover:bg-foreground/5 rounded-md transition-colors border border-border"
      >
        + Add Condition
      </button>
      <button
        onClick={onAddGroup}
        className="px-3 py-1.5 text-xs text-foreground hover:bg-foreground/5 rounded-md transition-colors border border-border"
      >
        + Add Group
      </button>
    </div>
  )
}
