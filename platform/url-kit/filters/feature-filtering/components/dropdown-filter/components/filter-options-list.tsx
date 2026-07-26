/**
 * Filter Options List Component
 * 
 * Purpose: Virtualized list of filter options with checkboxes and count badges
 * Used in: DropdownFilter component
 * Why: Displays filter options with performance optimization for large lists
 */

'use client'

import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { FixedSizeList as List } from "react-window"
import { Check } from "lucide-react"
import type { DropdownFilterOption } from "../types"

/** Fallback when the flex parent has not measured yet (matches prior fixed list height). */
const FALLBACK_LIST_HEIGHT = 224
const ITEM_SIZE = 35

//////////////////////////////////
// Type Definitions
//////////////////////////////////

interface FilterOptionsListProps {
  /**
   * Filter options to display
   * WHY: Options to show in the list
   * HOW: Array of options with counts
   */
  options: DropdownFilterOption[]
  
  /**
   * Currently pending selections (before Apply)
   * WHY: Show which options are selected
   * HOW: Array of selected option values
   */
  pendingSelections: string[]
  
  /**
   * Callback when option is toggled
   * WHY: Handle option selection/deselection
   * HOW: Called with option value
   */
  onToggleOption: (value: string) => void
  
  /**
   * Optional formatter for display values
   * WHY: Customize how option values are displayed
   * HOW: Function that converts raw value to display string
   */
  formatDisplayValue?: (value: any) => string
  
  /**
   * Whether other columns have active filters
   * WHY: Determines count badge styling and selectability
   * HOW: If true, shows filtered/total counts
   */
  hasOtherColumnFilters: boolean
  
  /**
   * Whether options are loaded
   * WHY: Show loading state
   * HOW: If false, shows loading message
   */
  isOptionsLoaded: boolean
  
  /**
   * Whether to display initial count alongside count
   * WHY: Show both count and initialCount in format "count / initialCount"
   * HOW: If true, displays "count / initialCount"; if false, displays only "count"
   * Default: false
   */
  showInitialCount?: boolean
}

//////////////////////////////////
// Component Implementation
//////////////////////////////////

/**
 * FilterOptionsList component - virtualized options list
 * WHY: Provides performant list rendering with exact styling from StandardFilterDropdown
 * HOW: Uses react-window for virtualization, matches old component exactly
 * @param {FilterOptionsListProps} props - Component props
 * @returns {React.ReactElement} Virtualized options list
 */
export function FilterOptionsList({
  options,
  pendingSelections,
  onToggleOption,
  formatDisplayValue,
  hasOtherColumnFilters,
  isOptionsLoaded,
  showInitialCount = false
}: FilterOptionsListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [listHeight, setListHeight] = useState(FALLBACK_LIST_HEIGHT)

  // Size the virtual list to the flex slot so the footer stays below (never overlays).
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const update = () => {
      const next = Math.floor(el.getBoundingClientRect().height)
      if (next > 0) setListHeight(next)
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [isOptionsLoaded, options.length])

  // Show loading state
  if (!isOptionsLoaded) {
    return (
      <div className="p-4 text-center text-xs text-muted-foreground">Loading options...</div>
    )
  }

  // Show empty state
  if (options.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-muted-foreground">No results found</div>
    )
  }

  const preferredHeight = Math.min(
    options.length * ITEM_SIZE,
    FALLBACK_LIST_HEIGHT,
  )

  // Render list item
  const renderItem = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const option = options[index]
    const isSelected = pendingSelections.includes(option.value)
    const isDisabled = (option.totalCount ?? 0) === 0
    
    // An option is selectable if:
    // 1. It's already selected, OR
    // 2. It has matches in the filtered data (initialCount > 0), OR
    // 3. No other column filters are active
    // 4. AND totalCount > 0 (not disabled)
    const isSelectable = !isDisabled && (
      isSelected || 
      (option.initialCount ?? 0) > 0 || 
      !hasOtherColumnFilters
    )
    
    // Grey out options that aren't selectable
    const shouldGreyOut = !isSelectable
    
    // Use formatDisplayValue for display if provided
    const displayValue = formatDisplayValue ? formatDisplayValue(option.rawValue) : option.value
    
    return (
      <div 
        style={style}
        className={`flex items-center py-1 px-2 rounded-l-md ${
          isSelected ? 'bg-gradient-to-r from-tertiary/20 to-transparent' : ''
        } ${
          isSelectable ? 'hover:bg-gradient-to-r from-tertiary/10 to-transparent cursor-pointer' : 'cursor-not-allowed opacity-50'
        }`}
        onClick={() => isSelectable ? onToggleOption(option.value) : null}
      >
        <div className={`w-4 h-4 border rounded mr-3 flex items-center justify-center ${
          isSelected ? 'bg-tertiary/80 dark:bg-tertiary/20 border-tertiary/30 dark:border-tertiary' : shouldGreyOut ? 'border-muted-foreground/30 bg-muted' : 'border-border dark:border-border/50'
        }`}>
          {isSelected && <Check size={12} className="text-tertiary-foreground" />}
        </div>
        <span className={`truncate flex-grow text-left text-xs ${
          shouldGreyOut ? 'text-muted-foreground' : isSelected ? 'font-medium text-tertiary' : 'text-foreground'
        }`}>
          {displayValue}
        </span>
        
        {/* Badge showing count */}
        <div className="ml-2">
          <span
            className={`text-xs px-3 py-1 rounded-full ${
              isDisabled
                ? 'bg-muted text-muted-foreground'
                : isSelected
                ? 'bg-tertiary text-tertiary-foreground'
                : 'bg-green-500/10 text-green-500 border border-green-500/20'
            }`}
          >
            {showInitialCount && option.initialCount !== undefined
              ? `${option.totalCount ?? 0} / ${option.initialCount}`
              : option.totalCount ?? 0}
          </span>
        </div>
      </div>
    )
  }
  
  return (
    // Preferred height when unconstrained; min-h-0 + flex parent max-h lets this shrink
    // so Clear/Cancel/Apply stay pinned below the scrollport instead of covering it.
    <div
      className="relative min-h-0 w-full flex-1 p-2"
      style={{ height: preferredHeight, maxHeight: '100%' }}
    >
      <div ref={containerRef} className="absolute inset-2">
        <List
          height={listHeight}
          itemCount={options.length}
          itemSize={ITEM_SIZE}
          width="100%"
          className="overflow-y-auto custom-scrollbar"
        >
          {renderItem}
        </List>
      </div>
    </div>
  )
}
