/**
 * Date Range Filter List Component
 * 
 * Purpose: Displays date range filter as a list with date inputs and quick select
 * Used in: PillFilter filter options panel
 * Why: Provides cleaner interface without dropdowns
 * 
 * Features:
 * - Date inputs (start/end) at the top with Apply button
 * - Quick select list below with checkboxes
 * - Count badges for each option
 * - Clear button
 */

'use client'

import * as React from "react"
import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { useUrlFilters } from "../../../hooks/useUrlFilters"
import { FilterConfig } from "../../filter-types"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Button } from "../../ui/button"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

//////////////////////////////////
// Component Props
//////////////////////////////////

interface DateRangeFilterListProps {
  /**
   * Filter configuration
   * WHY: Provides filter key, label, and options
   * HOW: Used to get filter key for URL params and options for list
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
 * DateRangeFilterList component - list-based date range filter
 * WHY: Provides list-based date range filtering without dropdowns
 * HOW: Renders date inputs and quick select list, uses useUrlFilters for URL state
 * @param {DateRangeFilterListProps} props - Component props
 * @returns {React.ReactElement} List with date inputs and date options
 */
export function DateRangeFilterList({ filter, showInitialCount = false }: DateRangeFilterListProps) {
  // Get filter functions from useUrlFilters hook
  // WHY: Provides getRange and setRange functions for URL state management
  // HOW: Hook reads from URL searchParams and updates via router.replace
  const { getRange, setRange, remove } = useUrlFilters()
  
  // Get currently selected date range from URL
  // WHY: Need to know which dates are selected to show in inputs and list
  // HOW: getRange returns object with start and end dates or null
  const range = getRange(filter.key)
  
  // Local state for input values
  // WHY: Need controlled inputs for start/end dates
  // HOW: Initialize with URL values or empty strings
  const [startValue, setStartValue] = useState<string>(
    range?.start || ""
  )
  const [endValue, setEndValue] = useState<string>(
    range?.end || ""
  )
  
  // Sync local state with URL values when they change
  // WHY: Keep inputs in sync with URL state (e.g., when cleared externally)
  // HOW: Update local state when range changes
  useEffect(() => {
    setStartValue(range?.start || "")
    setEndValue(range?.end || "")
  }, [range])
  
  // Determine which options are selected based on current range
  // WHY: Need to show checkmarks for dates within the current range
  // HOW: Check if option value is between start and end dates
  const getSelectedOptions = (): string[] => {
    if (!range?.start || !range?.end) {
      return []
    }
    
    if (!filter.options) return []
    
    // Find all options that fall within the current range
    return filter.options
      .filter(option => {
        const optionDate = option.value
        return optionDate >= range.start && optionDate <= range.end
      })
      .map(option => option.value)
  }
  
  const [selectedValues, setSelectedValues] = useState<string[]>(getSelectedOptions())
  
  // Sync selected values when range changes
  // WHY: Keep quick select in sync with manual range changes
  // HOW: Update selected values when range changes
  useEffect(() => {
    setSelectedValues(getSelectedOptions())
  }, [range?.start, range?.end, filter.options])
  
  // Check if filter has active values
  // WHY: Need to show clear button when filter is active
  // HOW: Check if range has start or end values
  const hasActiveFilter = Boolean(range?.start || range?.end)
  
  // Handle applying the date range from inputs
  // WHY: Updates URL when user sets start/end dates
  // HOW: Calls setRange with date strings
  const handleApply = () => {
    const start = startValue.trim() || undefined
    const end = endValue.trim() || undefined

    // Update URL with date range
    // WHY: Persists filter state in URL
    // HOW: setRange updates URL param with underscore-separated dates
    if (start && end) {
      setRange(filter.key, start, end)
    } else if (start || end) {
      // If only one date is provided, use it for both
      const date = start || end
      setRange(filter.key, date, date)
    }
  }
  
  // Handle clearing the date range
  // WHY: Allow user to remove date range filter
  // HOW: Clears inputs and removes URL param
  const handleClear = () => {
    setStartValue("")
    setEndValue("")
    setSelectedValues([])
    // Remove filter from URL
    // WHY: Allows user to clear the filter
    // HOW: remove deletes the URL param
    remove(filter.key)
  }
  
  // Handle toggle of date option from quick select list
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
      setStartValue("")
      setEndValue("")
    } else {
      // Find min (earliest) and max (latest) dates
      const sortedDates = newSelected.sort()
      const minDate = sortedDates[0]
      const maxDate = sortedDates[sortedDates.length - 1]
      
      // Update URL with range
      setRange(filter.key, minDate, maxDate)
      // Also update input values
      setStartValue(minDate)
      setEndValue(maxDate)
    }
  }
  
  return (
    <div className="w-full">
      {/* Header with clear button */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          {hasActiveFilter && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-muted text-muted-foreground"
              title="Clear filters"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      
      {/* Date Inputs - One row with 3 columns */}
      <div className="flex gap-2 mb-4">
        {/* Column 1: Start date label + input */}
        <div className="flex flex-col space-y-2 w-[150px]">
          <Label htmlFor={`${filter.key}-start`} className="text-xs">Start</Label>
          <Input
            id={`${filter.key}-start`}
            type="date"
            placeholder="Start date"
            value={startValue}
            onChange={(e) => setStartValue(e.target.value)}
            className="w-full text-xs"
          />
        </div>
        
        {/* Column 2: End date label + input */}
        <div className="flex flex-col space-y-2 w-[150px]">
          <Label htmlFor={`${filter.key}-end`} className="text-xs">End</Label>
          <Input
            id={`${filter.key}-end`}
            type="date"
            placeholder="End date"
            value={endValue}
            onChange={(e) => setEndValue(e.target.value)}
            className="w-full text-xs"
          />
        </div>
        
        {/* Column 3: Apply button with mt-auto */}
        <div className="flex flex-col">
          <div className="h-5"></div> {/* Spacer for label height */}
          <Button
            variant="default"
            size="sm"
            className="mt-auto text-xs"
            onClick={handleApply}
          >
            Apply
          </Button>
        </div>
      </div>
      
      {/* Quick Select List */}
      {filter.options && filter.options.length > 0 && (
        <>
          <div className="mb-3 text-xs font-medium text-muted-foreground">
            Quick Select
          </div>
          <div className="max-h-64 overflow-y-auto">
            <div className="space-y-1">
              {filter.options.map((option) => {
                const isSelected = selectedValues.includes(option.value)
                const isDisabled = (option.count ?? 0) === 0
                
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
                    onClick={() => !isDisabled && handleToggle(option.value)}
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
                      {option.label}
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
        </>
      )}
    </div>
  )
}
