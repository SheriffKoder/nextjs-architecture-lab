/**
 * Multi Select Filter Component
 * 
 * Purpose: Filter component that allows selecting multiple values from a list
 * Used in: FilterRenderer when filter type is "multi-select"
 * Why: Provides multi-select filtering with URL state management via useUrlFilters hook
 * 
 * Function Index:
 * - MultiSelectFilter: Component that renders multi-select dropdown with checkboxes
 *   Example input: <MultiSelectFilter filter={filterConfig} />
 *   Example output: Dropdown button with checkbox items for each option
 * 
 * Steps:
 * 1. Get selected values from URL using useUrlFilters hook
 * 2. Render dropdown trigger button showing selected count or label
 * 3. Render dropdown content with checkbox items for each option
 * 4. Handle toggle to add/remove values from URL
 */

'use client'

import * as React from "react"
import { useUrlFilters } from "../../hooks/useUrlFilters"
import { FilterConfig } from "../filter-types"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { ChevronDown } from "lucide-react"
import { cn } from "@/shared/lib/utils"

//////////////////////////////////
// Component Props
//////////////////////////////////

interface MultiSelectFilterProps {
  /**
   * Filter configuration containing key, label, and options
   * WHY: Provides all information needed to render the filter
   * HOW: Used to get filter key for URL params and options for dropdown
   */
  filter: FilterConfig
  
  /**
   * Whether to display initial count alongside count
   * WHY: Show both count and initialCount in format "count / initialCount"
   * HOW: If true, displays "count / initialCount"; if false, displays only "count"
   * Default: false
   */
  showInitialCount?: boolean
}

/**
 * MultiSelectFilter component - allows selecting multiple values
 * WHY: Provides multi-select filtering with URL state management
 * HOW: Uses useUrlFilters hook to read/write URL params and DropdownMenu for UI
 * @param {MultiSelectFilterProps} props - Component props containing filter config
 * @returns {React.ReactElement} Dropdown with checkbox items for multi-select
 */
export function MultiSelectFilter({ filter, showInitialCount = false }: MultiSelectFilterProps) {
  // Get filter functions from useUrlFilters hook
  // WHY: Provides getList and toggleListValue functions for URL state management
  // HOW: Hook reads from URL searchParams and updates via router.replace
  const { getList, toggleListValue } = useUrlFilters()

  // Get currently selected values from URL
  // WHY: Need to know which options are selected to show checkmarks
  // HOW: getList splits comma-separated URL param into array
  const selected = getList(filter.key)

  // Calculate selected count for button display
  // WHY: Shows user how many options are selected
  // HOW: Counts length of selected array
  const selectedCount = selected.length

  // Determine button text based on selection state
  // WHY: Provides clear visual feedback about filter state
  // HOW: Shows count if items selected, otherwise shows label
  const buttonText = selectedCount > 0 
    ? `${filter.label} (${selectedCount})` 
    : filter.label

  return (
    <DropdownMenu>
      {/* Dropdown trigger button */}
      {/* WHY: Provides clickable button to open dropdown */}
      {/* HOW: Uses DropdownMenuTrigger with Button component */}
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

      {/* Dropdown content with options */}
      {/* WHY: Provides list of selectable options with checkboxes */}
      {/* HOW: Uses DropdownMenuContent with map over filter.options */}
      <DropdownMenuContent align="start" className="w-[200px]">
        <DropdownMenuLabel>{filter.label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Map over options and render checkbox items */}
        {/* WHY: Allows user to select multiple options */}
        {/* HOW: Each option renders as DropdownMenuCheckboxItem with toggle handler */}
        {filter.options?.map(option => {
          // Check if this option is currently selected
          // WHY: Need to show checked state in checkbox
          // HOW: Check if option.value exists in selected array
          const isSelected = selected.includes(option.value)
          const isDisabled = (option.count ?? 0) === 0

          return (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={isSelected}
              disabled={isDisabled}
              onCheckedChange={() => {
                // Toggle option in URL when checkbox changes
                // WHY: Updates URL param to reflect user selection
                // HOW: toggleListValue adds if not selected, removes if selected
                if (!isDisabled) {
                  toggleListValue(filter.key, option.value)
                }
              }}
              className={cn(
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <span className="flex items-center justify-between w-full">
                <span className={cn(isDisabled && "text-muted-foreground")}>
                  {option.label}
                </span>
                {option.count !== undefined && (
                  <span className={cn(
                    "ml-2 text-xs",
                    isDisabled ? "text-muted-foreground" : "text-muted-foreground"
                  )}>
                    ({showInitialCount && option.initialCount !== undefined
                      ? `${option.count} / ${option.initialCount}`
                      : option.count})
                  </span>
                )}
              </span>
            </DropdownMenuCheckboxItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
