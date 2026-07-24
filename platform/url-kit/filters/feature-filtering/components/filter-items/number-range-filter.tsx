/**
 * Number Range Filter Component
 * 
 * Purpose: Filter component that allows selecting a number range (min/max)
 * Used in: FilterRenderer when filter type is "number-range"
 * Why: Provides number range filtering with URL state management via useUrlFilters hook
 * 
 * Function Index:
 * - NumberRangeFilter: Component that renders number range inputs
 *   Example input: <NumberRangeFilter filter={filterConfig} />
 *   Example output: Dropdown button with min/max number inputs
 * 
 * Steps:
 * 1. Get number range from URL using useUrlFilters hook
 * 2. Render dropdown trigger button showing selected range or label
 * 3. Render dropdown content with min/max number inputs
 * 4. Handle input changes to update range in URL
 */

'use client'

import * as React from "react"
import { useState, useEffect } from "react"
import { useUrlFilters } from "../../hooks/useUrlFilters"
import { FilterConfig } from "../filter-types"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { ChevronDown } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { NumberQuickSelect } from "./number-quick-select"

//////////////////////////////////
// Component Props
//////////////////////////////////

interface NumberRangeFilterProps {
  /**
   * Filter configuration containing key and label
   * WHY: Provides all information needed to render the filter
   * HOW: Used to get filter key for URL params
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
 * NumberRangeFilter component - allows selecting a number range
 * WHY: Provides number range filtering with URL state management
 * HOW: Uses useUrlFilters hook to read/write URL params and Input components for UI
 * @param {NumberRangeFilterProps} props - Component props containing filter config
 * @returns {React.ReactElement} Dropdown with min/max number inputs
 */
export function NumberRangeFilter({ filter, showInitialCount = false }: NumberRangeFilterProps) {
  // Get filter functions from useUrlFilters hook
  // WHY: Provides getNumberRange and setNumberRange functions for URL state management
  // HOW: Hook reads from URL searchParams and updates via router.replace
  const { getNumberRange, setNumberRange, remove } = useUrlFilters()

  // Get currently selected number range from URL
  // WHY: Need to know which numbers are selected to show in inputs
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

  // Format number range for button display
  // WHY: Shows user which number range is currently selected
  // HOW: Formats min and max values or shows label if not set
  const getButtonText = () => {
    if (range?.min !== undefined || range?.max !== undefined) {
      const parts: string[] = []
      if (range.min !== undefined) parts.push(`Min: ${range.min}`)
      if (range.max !== undefined) parts.push(`Max: ${range.max}`)
      return parts.join(", ")
    }
    return filter.label
  }

  // Handle applying the number range
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
  // WHY: Allows user to remove number range filter
  // HOW: Clears inputs and removes URL param
  const handleClear = () => {
    setMinValue("")
    setMaxValue("")
    // Remove filter from URL
    // WHY: Allows user to clear the filter
    // HOW: remove deletes the URL param
    remove(filter.key)
  }

  return (
    <DropdownMenu>
      {/* Dropdown trigger button */}
      {/* WHY: Provides clickable button to open number inputs */}
      {/* HOW: Uses DropdownMenuTrigger with Button component */}
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "min-w-[150px] justify-between",
            (range?.min !== undefined || range?.max !== undefined) && "bg-accent"
          )}
        >
          <span>{getButtonText()}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      {/* Dropdown content with number inputs */}
      {/* WHY: Provides input fields for min/max number selection */}
      {/* HOW: Uses Input components with labels and apply/clear buttons */}
      <DropdownMenuContent align="start" className="w-[250px] p-4">
        <DropdownMenuLabel>{filter.label}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="space-y-4 mt-4">
          {/* Quick Select for Numbers */}
          {/* WHY: Allow users to quickly select common numbers */}
          {/* HOW: Show NumberQuickSelect if showQuickSelect is true and options exist */}
          {filter.showQuickSelect && filter.options && filter.options.length > 0 && (
            <NumberQuickSelect filter={filter} showInitialCount={showInitialCount} />
          )}
          
          {/* Min value input */}
          {/* WHY: Allows user to set minimum number */}
          {/* HOW: Controlled input that updates minValue state */}
          <div className="space-y-2">
            <Label htmlFor={`${filter.key}-min`}>Min</Label>
            <Input
              id={`${filter.key}-min`}
              type="number"
              placeholder="Min value"
              value={minValue}
              onChange={(e) => {
                // Update min value state
                // WHY: Keep input controlled
                // HOW: Update state with input value
                setMinValue(e.target.value)
              }}
            />
          </div>

          {/* Max value input */}
          {/* WHY: Allows user to set maximum number */}
          {/* HOW: Controlled input that updates maxValue state */}
          <div className="space-y-2">
            <Label htmlFor={`${filter.key}-max`}>Max</Label>
            <Input
              id={`${filter.key}-max`}
              type="number"
              placeholder="Max value"
              value={maxValue}
              onChange={(e) => {
                // Update max value state
                // WHY: Keep input controlled
                // HOW: Update state with input value
                setMaxValue(e.target.value)
              }}
            />
          </div>

          {/* Action buttons */}
          {/* WHY: Provides apply and clear actions */}
          {/* HOW: Buttons that call handleApply and handleClear */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={handleApply}
            >
              Apply
            </Button>
            {(range?.min !== undefined || range?.max !== undefined) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
