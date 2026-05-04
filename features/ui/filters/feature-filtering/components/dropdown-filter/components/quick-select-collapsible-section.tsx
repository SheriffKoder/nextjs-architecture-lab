/**
 * Quick Select Collapsible Section
 *
 * Purpose: Expand/collapse wrapper for range quick-select when config starts collapsed
 * Used in: DropdownFilter when filter.quickSelectOptionsExpanded === false
 */

'use client'

import * as React from 'react'

interface QuickSelectCollapsibleSectionProps {
  isExpanded: boolean
  onExpandedChange: (expanded: boolean) => void
  children: React.ReactNode
}

export function QuickSelectCollapsibleSection({
  isExpanded,
  onExpandedChange,
  children,
}: QuickSelectCollapsibleSectionProps) {
  return (
    <div className="border-t border-border">
      <div
        className="flex cursor-pointer items-center justify-between bg-muted/50 p-2 transition-colors hover:bg-muted/70"
        onClick={() => onExpandedChange(!isExpanded)}
      >
        <span className="text-sm font-medium text-foreground">Quick select options</span>
        <button
          type="button"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>
      {isExpanded ? <div>{children}</div> : null}
    </div>
  )
}
