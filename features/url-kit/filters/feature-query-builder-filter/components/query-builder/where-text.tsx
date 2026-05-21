/**
 * Where Text Component
 * 
 * Purpose: Display "Where" text for first condition
 * Used in: ConditionRow component (for first row)
 * Why: Clearly indicates the first condition in a group
 */

'use client'

import React from 'react'

interface WhereTextProps {
  className?: string
}

/**
 * WhereText component - "Where" label for first condition
 * WHY: Clearly indicates the first condition in a group
 * HOW: Renders "Where" text matching LogicSelector width
 */
export function WhereText({
  className,
}: WhereTextProps) {
  return (
    <div className={`flex items-center justify-center px-2 py-1.5 text-xs text-muted-foreground ${className || ''}`}>
      <span>Where</span>
    </div>
  )
}
