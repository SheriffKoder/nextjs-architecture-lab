/**
 * Filter Options Buttons Component
 * 
 * Purpose: Displays filter options as either a row of buttons or a dropdown menu
 * Used in: Pages that need quick filter selection UI
 * Why: Provides flexible presentation of filter options for better UX
 * 
 * Features:
 * - Button row mode: Horizontal row of clickable buttons
 * - Dropdown mode: Single button with dropdown menu
 * - Supports both multi-select and single-select filters
 * - Shows active state for selected options
 * - Displays count badges when available
 * - Responsive wrapping for button row
 */

'use client'

import * as React from "react"
import { useUrlFilters } from "../../hooks/useUrlFilters"
import type { FilterConfig } from "../filter-types"
import { cn } from "@/shared/lib/utils"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu"
import { Button } from "../ui/button"
import { ChevronDown } from "lucide-react"

//////////////////////////////////
// Component Props
//////////////////////////////////

export interface FilterOptionsButtonsProps {
  /**
   * Filter key (e.g., "department", "status", "role")
   * WHY: Identifies which filter to use and which URL parameter to read/write
   * HOW: Used to find filter in filterOptions array and with useUrlFilters to get/set filter values
   */
  filterKey: string
  
  /**
   * Array of filter configurations with options populated from getFilterOptions
   * WHY: Provides all available filters, component will find the one matching the key
   * HOW: Component searches this array for filter with matching key
   */
  filterOptions: FilterConfig[]
  
  /**
   * Selection type override (multi-select or single-select)
   * WHY: Allow overriding the filter's default type for different use cases
   * HOW: If provided, overrides the filter's type property; if not provided, uses filter's original type
   */
  selectType?: "multi-select" | "single-select"
  
  /**
   * Whether to display as dropdown instead of button row
   * WHY: Allow flexible UI presentation based on use case
   * HOW: If true, shows dropdown menu; if false, shows button row
   * Default: false (shows as buttons)
   */
  isDropdown?: boolean
  
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
 * FilterOptionsButtons component - displays filter options as buttons or dropdown
 * WHY: Provides flexible presentation of filter options for quick selection
 * HOW: Uses useUrlFilters to manage state, renders buttons or dropdown based on isDropdown prop
 * @param {FilterOptionsButtonsProps} props - Component props
 * @returns {React.ReactElement} Button row or dropdown with filter options
 */
export function FilterOptionsButtons({
  filterKey,
  filterOptions,
  selectType,
  isDropdown = false,
  showInitialCount = false
}: FilterOptionsButtonsProps) {
  // Find the filter in filterOptions array
  const foundFilter = filterOptions.find(f => f.key === filterKey)
  
  // If filter not found, don't render
  if (!foundFilter) {
    return null
  }
  
  // Override filter type if selectType prop is provided
  const filter: FilterConfig = selectType 
    ? { ...foundFilter, type: selectType }
    : foundFilter
  
  // Get filter functions from useUrlFilters hook
  const { getList, get, toggleListValue, set, remove } = useUrlFilters()
  
  // Get current selections based on filter type
  const isMultiSelect = filter.type === "multi-select"
  const selectedValues = isMultiSelect ? getList(filterKey) : (get(filterKey) ? [get(filterKey)!] : [])
  const selectedCount = selectedValues.length
  
  // Check if an option is selected
  const isSelected = (value: string) => selectedValues.includes(value)
  
  // Handle option click/toggle
  const handleOptionClick = (value: string) => {
    if (isMultiSelect) {
      // Multi-select: toggle value
      toggleListValue(filterKey, value)
    } else {
      // Single-select: set if not selected, remove if already selected
      if (isSelected(value)) {
        remove(filterKey)
      } else {
        set(filterKey, value)
      }
    }
  }
  
  // If no options available, don't render
  if (!filter.options || filter.options.length === 0) {
    return null
  }
  
  // Button Row Mode
  if (!isDropdown) {
    return (
      <div className="flex gap-2 flex-wrap items-center">
        {/* Filter Label */}
        <span className="text-sm font-medium text-foreground">
          {filter.label}:
        </span>
        
        {/* Option Buttons */}
        {filter.options.map((option) => {
          const optionSelected = isSelected(option.value)
          const isDisabled = (option.count ?? 0) === 0
          
          return (
            <button
              key={option.value}
              onClick={() => !isDisabled && handleOptionClick(option.value)}
              disabled={isDisabled}
              className={cn(
                "px-3 py-1.5 text-xs rounded-md transition-colors font-medium",
                isDisabled
                  ? "opacity-50 cursor-not-allowed bg-muted text-muted-foreground"
                  : optionSelected
                  ? "bg-tertiary text-background hover:bg-tertiary/90"
                  : "bg-muted text-foreground hover:bg-muted/80"
              )}
            >
              <span>{option.label}</span>
              {option.count !== undefined && (
                <span className={cn(
                  "ml-2 text-xs",
                  isDisabled
                    ? "text-muted-foreground"
                    : optionSelected
                    ? "text-background/80"
                    : "text-muted-foreground"
                )}>
                  ({showInitialCount && option.initialCount !== undefined
                    ? `${option.count} / ${option.initialCount}`
                    : option.count})
                </span>
              )}
            </button>
          )
        })}
      </div>
    )
  }
  
  // Dropdown Mode
  const buttonText = selectedCount > 0 
    ? `${filter.label} (${selectedCount})` 
    : filter.label
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "min-w-[150px] justify-between",
            selectedCount > 0 && "bg-accent"
          )}
        >
          <span>{buttonText}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>{filter.label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {filter.options.map((option) => {
          const optionSelected = isSelected(option.value)
          const isDisabled = (option.count ?? 0) === 0
          
          return (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={optionSelected}
              disabled={isDisabled}
              onCheckedChange={() => {
                if (!isDisabled) {
                  handleOptionClick(option.value)
                }
              }}
              className={cn(
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <span className={cn(isDisabled && "text-muted-foreground")}>
                  {option.label}
                </span>
                {option.count !== undefined && (
                  <span className={cn(
                    "text-xs ml-2",
                    isDisabled ? "text-muted-foreground" : "text-muted-foreground"
                  )}>
                    ({showInitialCount && option.initialCount !== undefined
                      ? `${option.count} / ${option.initialCount}`
                      : option.count})
                  </span>
                )}
              </div>
            </DropdownMenuCheckboxItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
