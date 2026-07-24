/**
 * Number Range Filter List Component
 * 
 * Purpose: Displays number range filter as a list with range inputs and quick select
 * Used in: PillFilter filter options panel
 * Why: Provides cleaner interface without dropdowns
 * 
 * Features:
 * - Range inputs (min/max) at the top
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
import { cn } from "@/shared/lib/utils"

//////////////////////////////////
// Component Props
//////////////////////////////////

interface NumberRangeFilterListProps {
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
 * NumberRangeFilterList component - list-based number range filter
 * WHY: Provides list-based number range filtering without dropdowns
 * HOW: Renders range inputs and quick select list, uses useUrlFilters for URL state
 * @param {NumberRangeFilterListProps} props - Component props
 * @returns {React.ReactElement} List with range inputs and number options
 */
export function NumberRangeFilterList({ filter, showInitialCount = false }: NumberRangeFilterListProps) {
  // Get filter functions from useUrlFilters hook
  // WHY: Provides getNumberRange and setNumberRange functions for URL state management
  // HOW: Hook reads from URL searchParams and updates via router.replace
  const { getNumberRange, setNumberRange, remove } = useUrlFilters()
  
  // Get currently selected number range from URL
  // WHY: Need to know which numbers are selected to show in inputs and list
  // HOW: getNumberRange returns object with min and max numbers or null
  const range = getNumberRange(filter.key)
  
  // Local state for input values
  // WHY: Need controlled inputs for min/max values
  // HOW: Initialize with URL values or empty strings
  const [minValue, setMinValue] = useState<string>(
    range?.min !== undefined ? String(range.min) : ""
  )
  const [maxValue, setMaxValue] = useState<string>(
    range?.max !== undefined ? String(range.max) : ""
  )
  
  // Sync local state with URL values when they change
  // WHY: Keep inputs in sync with URL state (e.g., when cleared externally)
  // HOW: Update local state when range changes
  useEffect(() => {
    setMinValue(range?.min !== undefined ? String(range.min) : "")
    setMaxValue(range?.max !== undefined ? String(range.max) : "")
  }, [range])
  
  // Determine which options are selected based on current range
  // WHY: Need to show checkmarks for numbers within the current range
  // HOW: Check if option value is between min and max
  const getSelectedOptions = (): string[] => {
    if (range?.min === undefined && range?.max === undefined) {
      return []
    }
    
    if (!filter.options) return []
    
    // Find all options that fall within the current range
    return filter.options
      .filter(option => {
        const optionNumber = Number(option.value)
        if (isNaN(optionNumber)) return false
        
        const inMinRange = range.min === undefined || optionNumber >= range.min
        const inMaxRange = range.max === undefined || optionNumber <= range.max
        
        return inMinRange && inMaxRange
      })
      .map(option => option.value)
  }
  
  const [selectedValues, setSelectedValues] = useState<string[]>(getSelectedOptions())
  
  // Sync selected values when range changes
  // WHY: Keep quick select in sync with manual range changes
  // HOW: Update selected values when range changes
  useEffect(() => {
    setSelectedValues(getSelectedOptions())
  }, [range?.min, range?.max, filter.options])
  
  // Check if filter has active values
  // WHY: Need to show clear button when filter is active
  // HOW: Check if range has min or max values
  const hasActiveFilter = range?.min !== undefined || range?.max !== undefined
  
  // Handle applying the number range from inputs
  // WHY: Updates URL when user sets min/max values
  // HOW: Converts string inputs to numbers and calls setNumberRange
  const handleApply = () => {
    const min = minValue ? Number(minValue) : undefined
    const max = maxValue ? Number(maxValue) : undefined

    // Update URL with number range
    // WHY: Persists filter state in URL
    // HOW: setNumberRange updates URL param with underscore-separated numbers
    setNumberRange(filter.key, min, max)
  }
  
  // Handle clearing the number range
  // WHY: Allow user to remove number range filter
  // HOW: Clears inputs and removes URL param
  const handleClear = () => {
    setMinValue("")
    setMaxValue("")
    setSelectedValues([])
    // Remove filter from URL
    // WHY: Allows user to clear the filter
    // HOW: remove deletes the URL param
    remove(filter.key)
  }
  
  // Handle toggle of number option from quick select list
  // WHY: Update selected values and recalculate range
  // HOW: Add/remove value from selection, then find min/max
  const handleToggle = (value: string) => {
    let newSelected: string[]
    
    if (selectedValues.includes(value)) {
      // Remove value from selection
      newSelected = selectedValues.filter(v => v !== value)
    } else {
      // Add value to selection
      newSelected = [...selectedValues, value]
    }
    
    setSelectedValues(newSelected)
    
    // Calculate min and max from selected values
    if (newSelected.length === 0) {
      // Clear range if nothing selected
      remove(filter.key)
      setMinValue("")
      setMaxValue("")
    } else {
      // Convert to numbers and find min/max
      const numbers = newSelected
        .map(v => Number(v))
        .filter(n => !isNaN(n))
      
      if (numbers.length > 0) {
        const min = Math.min(...numbers)
        const max = Math.max(...numbers)
        
        // Update URL with range
        setNumberRange(filter.key, min, max)
        // Also update input values
        setMinValue(String(min))
        setMaxValue(String(max))
      }
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
      
      {/* Range Inputs - One row with 3 columns */}
      <div className="flex gap-2 mb-4">
        {/* Column 1: Min label + input */}
        <div className="flex flex-col space-y-2 w-[150px]">
          <Label htmlFor={`${filter.key}-min`} className="text-xs">Min</Label>
          <Input
            id={`${filter.key}-min`}
            type="number"
            placeholder="Min"
            value={minValue}
            onChange={(e) => setMinValue(e.target.value)}
            className="w-full text-xs"
          />
        </div>
        
        {/* Column 2: Max label + input */}
        <div className="flex flex-col space-y-2 w-[150px]">
          <Label htmlFor={`${filter.key}-max`} className="text-xs">Max</Label>
          <Input
            id={`${filter.key}-max`}
            type="number"
            placeholder="Max"
            value={maxValue}
            onChange={(e) => setMaxValue(e.target.value)}
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
