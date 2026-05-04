/**
 * Logic Text Component
 * 
 * Purpose: Display inherited logic as read-only text
 * Used in: ConditionRow component (for rows after the second)
 * Why: Shows which logic applies without allowing changes
 */

'use client'

import React from 'react'
import type { Logic } from '../../types/filter'

interface LogicTextProps {
  value: Logic
  className?: string
}

/**
 * LogicText component - read-only logic display
 * WHY: Shows inherited logic for rows after the second
 * HOW: Renders text display matching LogicSelector width
 */
export function LogicText({
  value,
  className,
}: LogicTextProps) {
  return (
    <div className={`flex items-center justify-center px-2 py-1.5 text-xs text-foreground ${className || ''}`}>
      <span>{value.toUpperCase()}</span>
    </div>
  )
}
