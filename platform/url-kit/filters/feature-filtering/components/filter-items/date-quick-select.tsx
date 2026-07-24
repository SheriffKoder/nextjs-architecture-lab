/**
 * Date Quick Select Component
 * 
 * Purpose: Multi-select dropdown for date-range filters showing unique dates
 * Used in: DateRangeFilter when showQuickSelect is true
 * Why: Allows users to quickly select common dates instead of using date picker
 * 
 * Function Index:
 * - DateQuickSelect: Component that renders multi-select with unique dates
 *   Example input: <DateQuickSelect filter={filterConfig} />
 *   Example output: Multi-select dropdown that updates date range params
 * 
 * Steps:
 * 1. Read current range from URL
 * 2. Show multi-select with unique date options
 * 3. When user selects dates, calculate min/max
 * 4. Update range params using same key
 */

'use client'

import * as React from "react"
import { useEffect, useState } from "react"
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
import { ChevronDown } from "lucide-react"
import { cn } from "@/shared/lib/utils"

//////////////////////////////////
// Component Props
//////////////////////////////////

interface DateQuickSelectProps {
  /**
   * Filter configuration containing key, label, and options
   * WHY: Provides all information needed to render the quick select
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
 * DateQuickSelect component - multi-select for date values
 * WHY: Provides quick selection of dates that updates range params
 * HOW: Uses multi-select UI, calculates min/max from selections, updates range
 * @param {DateQuickSelectProps} props - Component props containing filter config
 * @returns {React.ReactElement} Multi-select dropdown for dates
 */
export function DateQuickSelect({ filter, showInitialCount = false }: DateQuickSelectProps) {
  // Get filter functions from useUrlFilters hook
  // WHY: Provides getRange and setRange functions for URL state management
  // HOW: Hook reads from URL searchParams and updates via router.replace
  const { getRange, setRange, remove } = useUrlFilters()
  
  // Get current range from URL
  // WHY: Need to know which dates are in the current range
  // HOW: getRange returns object with start and end dates or null
  const currentRange = getRange(filter.key)
  
  // Determine which options are selected based on current range
  // WHY: Need to show checkmarks for dates within the current range
  // HOW: Check if option value is between start and end dates
  const getSelectedOptions = (): string[] => {
    if (!currentRange?.start || !currentRange?.end) {
      return []
    }
    
    if (!filter.options) return []
    
    // Find all options that fall within the current range
    return filter.options
      .filter(option => {
        const optionDate = option.value
        return optionDate >= currentRange.start && optionDate <= currentRange.end
      })
      .map(option => option.value)
  }
  
  const [selectedValues, setSelectedValues] = useState<string[]>(getSelectedOptions())
  
  // Sync selected values when range changes
  // WHY: Keep quick select in sync with manual range changes
  // HOW: Update selected values when currentRange changes
  useEffect(() => {
    setSelectedValues(getSelectedOptions())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRange?.start, currentRange?.end, filter.options])
  
  // Handle toggle of date option
  // WHY: Update selected values and recalculate range
  // HOW: Add/remove value from selection, then find min/max
  const handleToggle = (value: string) => {
    let newSelected: string[]
    
    if (selectedValues.includes(value)) {
      // Remove value from selection
      newSelected = selectedValues.filter(v => v !== value)
    } else {
      // Add value to selection
      newSelected = [...selectedValues, value].sort()
    }
    
    setSelectedValues(newSelected)
    
    // Calculate min and max from selected values
    if (newSelected.length === 0) {
      // Clear range if nothing selected
      remove(filter.key)
    } else {
      // Find min (earliest) and max (latest) dates
      const sortedDates = newSelected.sort()
      const minDate = sortedDates[0]
      const maxDate = sortedDates[sortedDates.length - 1]
      
      // Update URL with range
      setRange(filter.key, minDate, maxDate)
    }
  }
  
  // Calculate selected count for button display
  const selectedCount = selectedValues.length
  
  // Determine button text
  const buttonText = selectedCount > 0
    ? `${filter.label} (${selectedCount} selected)`
    : `Quick Select ${filter.label}`
  
  if (!filter.options || filter.options.length === 0) {
    return null
  }
  
  return (
    <div className="mb-4 pb-4 border-b">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "w-full justify-between",
              selectedCount > 0 && "bg-accent"
            )}
          >
            <span>{buttonText}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="start" className="w-[200px] max-h-[300px] overflow-y-auto">
          <DropdownMenuLabel>Quick Select Dates</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {filter.options.map(option => {
            const isSelected = selectedValues.includes(option.value)
            
            return (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={isSelected}
                onCheckedChange={() => handleToggle(option.value)}
              >
                <span className="flex items-center justify-between w-full">
                  <span>{option.label}</span>
                  {option.count !== undefined && (
                    <span className="ml-2 text-xs text-muted-foreground">
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
    </div>
  )
}
