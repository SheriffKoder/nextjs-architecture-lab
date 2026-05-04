/**
 * Single Select Filter Component
 * 
 * Purpose: Filter component that allows selecting a single value from a list
 * Used in: FilterRenderer when filter type is "single-select"
 * Why: Provides single-select filtering with URL state management via useUrlFilters hook
 * 
 * Function Index:
 * - SingleSelectFilter: Component that renders single-select dropdown with radio items
 *   Example input: <SingleSelectFilter filter={filterConfig} />
 *   Example output: Dropdown button with radio items for each option
 * 
 * Steps:
 * 1. Get selected value from URL using useUrlFilters hook
 * 2. Render dropdown trigger button showing selected value or label
 * 3. Render dropdown content with radio items for each option
 * 4. Handle selection to update value in URL
 */

'use client'

import * as React from "react"
import { useUrlFilters } from "../../hooks/useUrlFilters"
import { FilterConfig } from "../filter-types"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "../ui/dropdown-menu"
import { Button } from "../ui/button"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

//////////////////////////////////
// Component Props
//////////////////////////////////

interface SingleSelectFilterProps {
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
 * SingleSelectFilter component - allows selecting a single value
 * WHY: Provides single-select filtering with URL state management
 * HOW: Uses useUrlFilters hook to read/write URL params and DropdownMenu for UI
 * @param {SingleSelectFilterProps} props - Component props containing filter config
 * @returns {React.ReactElement} Dropdown with radio items for single-select
 */
export function SingleSelectFilter({ filter, showInitialCount = false }: SingleSelectFilterProps) {
  // Get filter functions from useUrlFilters hook
  // WHY: Provides get and set functions for URL state management
  // HOW: Hook reads from URL searchParams and updates via router.replace
  const { get, set, remove } = useUrlFilters()

  // Get currently selected value from URL
  // WHY: Need to know which option is selected to show in button and radio
  // HOW: get returns string value or null if not set
  const selected = get(filter.key)

  // Find selected option label for button display
  // WHY: Shows user which option is currently selected
  // HOW: Finds option in filter.options array matching selected value
  const selectedOption = filter.options?.find(opt => opt.value === selected)
  const buttonText = selectedOption ? selectedOption.label : filter.label

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
            selected && "bg-accent"
          )}
        >
          <span>{buttonText}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      {/* Dropdown content with options */}
      {/* WHY: Provides list of selectable options with radio buttons */}
      {/* HOW: Uses DropdownMenuContent with DropdownMenuRadioGroup */}
      <DropdownMenuContent align="start" className="w-[200px]">
        <DropdownMenuLabel>{filter.label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Radio group for single selection */}
        {/* WHY: Ensures only one option can be selected at a time */}
        {/* HOW: Uses DropdownMenuRadioGroup with controlled value */}
        <DropdownMenuRadioGroup
          value={selected || undefined}
          onValueChange={(value) => {
            // Update URL when option selected
            // WHY: Updates URL param to reflect user selection
            // HOW: set updates URL param, or remove if value is empty
            if (value) {
              set(filter.key, value)
            } else {
              remove(filter.key)
            }
          }}
        >
          {/* Map over options and render radio items */}
          {/* WHY: Allows user to select one option */}
          {/* HOW: Each option renders as DropdownMenuRadioItem */}
          {filter.options?.map(option => {
            const isDisabled = (option.count ?? 0) === 0
            
            return (
              <DropdownMenuRadioItem 
                key={option.value} 
                value={option.value}
                disabled={isDisabled}
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
              </DropdownMenuRadioItem>
            )
          })}
        </DropdownMenuRadioGroup>

        {/* Clear selection option */}
        {/* WHY: Allows user to remove filter */}
        {/* HOW: MenuItem that calls remove to delete URL param */}
        {selected && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                // Remove filter from URL
                // WHY: Allows user to clear the filter
                // HOW: remove deletes the URL param
                remove(filter.key)
              }}
              className="text-muted-foreground"
            >
              Clear selection
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
