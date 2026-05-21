/**
 * Range Quick Select List Component
 *
 * Purpose: Quick-select list for date-range and number-range filters inside the dropdown
 * Used in: features/filters/feature-filtering/components/dropdown-filter/dropdown-filter.tsx
 * Used for: Choosing preset/unique values with counts beside range inputs
 *
 * Function Index:
 * - RangeQuickSelectList: Renders scrollable checkbox list; date labels use formatDateMMDDYYYY
 */

'use client'

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDateMMDDYYYY } from "@/features/url-kit/filters/utils/formatting/date-formatter"
import type { FilterConfig } from "../../filter-types"

/////////////////////////////////////////////////////////////
// Types
/////////////////////////////////////////////////////////////

interface RangeQuickSelectListProps {
  /**
   * Filter configuration
   * WHY: Provides options and showQuickSelect flag
   * HOW: Used to determine if list should be shown and what options to display
   */
  filter: FilterConfig
  
  /**
   * Currently selected values
   * WHY: Tracks which options are selected
   * HOW: Used to highlight selected options
   */
  selectedValues: string[]
  
  /**
   * Callback when option is toggled
   * WHY: Updates selection state
   * HOW: Called with the option value when clicked
   */
  onToggle: (value: string) => void
  
  /**
   * Sort direction
   * WHY: Controls how options are sorted
   * HOW: 'asc' for ascending, 'desc' for descending
   */
  sortDirection?: 'asc' | 'desc'
  
  /**
   * Whether to display initial count alongside count
   * WHY: Show both count and initialCount in format "count / initialCount"
   * HOW: If true, displays "count / initialCount"; if false, displays only "count"
   * Default: false
   */
  showInitialCount?: boolean
  /** When false, hides the “Quick Select” title row (e.g. parent collapsible supplies the label). Default true. */
  showSectionHeading?: boolean
}

/////////////////////////////////////////////////////////////
// Component
/////////////////////////////////////////////////////////////

//////////////////////////////////
// Renders quick-select rows (checkbox + label + count) for range filters with showQuickSelect.
// Used in: dropdown-filter.tsx when filter.showQuickSelect and filter.options are set
// Used for: Toggling URL-backed range selections from discrete option values
//
// Steps:
// 1. Return null if quick select is off or there are no options.
// 2. Derive sortedOptions: selected first, then numeric or ISO date order, then optional desc unselected reverse.
// 3. Render list: for date-range, label text uses formatDateMMDDYYYY(option.value); numbers use option.label.
export function RangeQuickSelectList({
  filter,
  selectedValues,
  onToggle,
  sortDirection = 'asc',
  showInitialCount = false,
  showSectionHeading = true,
}: RangeQuickSelectListProps) {
  // 1. Guard: nothing to show
  if (!filter.showQuickSelect || !filter.options || filter.options.length === 0) {
    return null
  }

  //////////////////////////////////
  // Derived: sort options for display (selected first, then by type, then direction)
  //////////////////////////////////
  const sortedOptions = React.useMemo(() => {
    const isNumberField = filter.type === "number-range"
    const isDateField = filter.type === "date-range"
    
    let sorted = [...filter.options!].sort((a, b) => {
      // 2a. Selected options stay above unselected
      const aSelected = selectedValues.includes(a.value)
      const bSelected = selectedValues.includes(b.value)
      
      if (aSelected && !bSelected) return -1
      if (!aSelected && bSelected) return 1
      
      // 2b. Compare by domain type when applicable
      if (isNumberField) {
        const aValue = parseFloat(a.value)
        const bValue = parseFloat(b.value)
        if (!isNaN(aValue) && !isNaN(bValue)) {
          return aValue - bValue
        }
      } else if (isDateField) {
        return a.value.localeCompare(b.value)
      }
      
      // 2c. Fallback: case-insensitive string order
      return a.value.toLowerCase().localeCompare(b.value.toLowerCase())
    })
    
    // 2d. Desc: keep selected block, reverse only the unselected tail
    if (sortDirection === 'desc') {
      const selectedItems = sorted.filter(opt => selectedValues.includes(opt.value))
      const unselectedItems = sorted.filter(opt => !selectedValues.includes(opt.value))
      return [...selectedItems, ...unselectedItems.reverse()]
    }
    
    return sorted
  }, [filter.options, filter.type, selectedValues, sortDirection])

  //////////////////////////////////
  // Render: section header + scrollable option rows
  //////////////////////////////////
  return (
    <div
      className={
        showSectionHeading !== false ? 'border-t border-border pt-3' : 'pt-1'
      }
    >
      {showSectionHeading !== false ? (
        <div className="mb-3 px-3 text-xs font-medium text-muted-foreground">
          Quick Select
        </div>
      ) : null}
      <div className="max-h-48 overflow-y-auto px-3 pb-3">
        <div className="space-y-1">
          {sortedOptions.map((option) => {
            const isSelected = selectedValues.includes(option.value)
            
            const isDisabled = (option.count ?? 0) === 0

            const displayLabel =
              filter.type === "date-range"
                ? formatDateMMDDYYYY(option.value)
                : option.label
            
            return (
              <div
                key={option.value}
                className={cn(
                  "flex items-center py-1 px-2 rounded-l-md",
                  isDisabled
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer",
                  isSelected
                    ? "bg-gradient-to-r from-tertiary/20 to-transparent"
                    : !isDisabled && "hover:bg-gradient-to-r from-tertiary/10 to-transparent"
                )}
                onClick={() => !isDisabled && onToggle(option.value)}
              >
                {/* Checkbox */}
                <div
                  className={cn(
                    "w-4 h-4 border rounded mr-3 flex items-center justify-center",
                    isSelected
                      ? "bg-tertiary/80 dark:bg-tertiary/20 border-tertiary/30 dark:border-tertiary"
                      : isDisabled
                      ? "border-muted-foreground/30 bg-muted"
                      : "border-border"
                  )}
                >
                  {isSelected && (
                    <Check size={12} className="text-tertiary-foreground" />
                  )}
                </div>
                
                {/* Option label */}
                <span
                  className={cn(
                    "truncate flex-grow text-left text-xs",
                    isSelected
                      ? "font-medium text-tertiary"
                      : isDisabled
                      ? "text-muted-foreground"
                      : "text-foreground"
                  )}
                >
                  {displayLabel}
                </span>
                
                {/* Count badge */}
                {option.count !== undefined && (
                  <div className="ml-2">
                    <span
                      className={cn(
                        "text-xs px-3 py-1 rounded-full",
                        isDisabled
                          ? "bg-muted text-muted-foreground"
                          : isSelected
                          ? "bg-tertiary text-tertiary-foreground"
                          : "bg-green-500/10 text-green-500 border border-green-500/20"
                      )}
                    >
                      {showInitialCount && option.initialCount !== undefined
                        ? `${option.count} / ${option.initialCount}`
                        : option.count}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
//////////////////////////////////

