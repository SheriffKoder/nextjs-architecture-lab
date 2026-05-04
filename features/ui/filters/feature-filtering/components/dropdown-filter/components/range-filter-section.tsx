/**
 * Range Filter Section Component
 * 
 * Purpose: Expandable wrapper for range filter components
 * Used in: DropdownFilter component for date/number range filters
 * Why: Provides expandable section matching old component styling
 */

'use client'

import * as React from "react"

//////////////////////////////////
// Type Definitions
//////////////////////////////////

interface RangeFilterSectionProps {
  /**
   * Range filter content to display
   * WHY: The actual range filter component
   * HOW: Rendered inside expandable section
   */
  rangeFilterContent: React.ReactNode
  
  /**
   * Whether section is expanded
   * WHY: Control visibility of range filter
   * HOW: If true, shows content; if false, hides it
   */
  isExpanded: boolean
  
  /**
   * Callback when expansion state changes
   * WHY: Allow user to expand/collapse section
   * HOW: Called with new expanded state
   */
  onExpandedChange: (expanded: boolean) => void
}

//////////////////////////////////
// Component Implementation
//////////////////////////////////

/**
 * RangeFilterSection component - expandable range filter wrapper
 * WHY: Provides expandable section with exact styling from StandardFilterDropdown
 * HOW: Renders expandable header and conditionally shows content
 * @param {RangeFilterSectionProps} props - Component props
 * @returns {React.ReactElement} Expandable range filter section
 */
export function RangeFilterSection({
  rangeFilterContent,
  isExpanded,
  onExpandedChange
}: RangeFilterSectionProps) {
  return (
    <div className="border-t border-b border-border">
      <div 
        className="p-2 bg-muted/50 flex justify-between items-center cursor-pointer hover:bg-muted/70 transition-colors"
        onClick={() => onExpandedChange(!isExpanded)}
      >
        <span className="text-sm font-medium text-foreground">Filter by range</span>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          {isExpanded ? '−' : '+'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="">
          {rangeFilterContent}
        </div>
      )}
    </div>
  )
}
