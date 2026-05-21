/**
 * Filter Options List Component
 * 
 * Purpose: Virtualized list of filter options with checkboxes and count badges
 * Used in: DropdownFilter component
 * Why: Displays filter options with performance optimization for large lists
 */

'use client'

import * as React from "react"
import { FixedSizeList as List } from "react-window"
import { Check } from "lucide-react"
import type { DropdownFilterOption } from "../types"

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
  // Show loading state
  if (!isOptionsLoaded) {
    return (
      <div className="p-4 text-center text-muted-foreground text-xs">Loading options...</div>
    )
  }
  
  // Show empty state
  if (options.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground text-xs">No results found</div>
    )
  }
  
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
    <div className="flex-1 min-h-0 p-2">
      <div className="h-[28vh] max-h-[224px]">
        <List
          height={224}
          itemCount={options.length}
          itemSize={35}
          width="100%"
          className="overflow-y-auto"
        >
          {renderItem}
        </List>
      </div>
    </div>
  )
}
