/**
 * Date Range Filter Component
 * 
 * Purpose: Filter component that allows selecting a date range
 * Used in: FilterRenderer when filter type is "date-range"
 * Why: Provides date range filtering with URL state management via useUrlFilters hook
 * 
 * Function Index:
 * - DateRangeFilter: Component that renders date range picker
 *   Example input: <DateRangeFilter filter={filterConfig} />
 *   Example output: Dropdown button with date range picker
 * 
 * Steps:
 * 1. Get date range from URL using useUrlFilters hook
 * 2. Render dropdown trigger button showing selected range or label
 * 3. Render dropdown content with date range picker
 * 4. Handle date selection to update range in URL
 */

'use client'
import * as React from "react"
import { useState } from "react"
import { useUrlFilters } from "../../hooks/useUrlFilters"
import { FilterConfig } from "../filter-types"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "../ui/dropdown-menu"
import { Button } from "../ui/button"
import { Calendar, ChevronDown } from "lucide-react"
import { DateRange } from "react-date-range"
import { format } from "date-fns"
import "react-date-range/dist/styles.css"
import "react-date-range/dist/theme/default.css"
import { cn } from "@/lib/utils"
import { DateQuickSelect } from "./date-quick-select"

//////////////////////////////////
// Component Props
//////////////////////////////////

interface DateRangeFilterProps {
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
 * DateRangeFilter component - allows selecting a date range
 * WHY: Provides date range filtering with URL state management
 * HOW: Uses useUrlFilters hook to read/write URL params and react-date-range for UI
 * @param {DateRangeFilterProps} props - Component props containing filter config
 * @returns {React.ReactElement} Dropdown with date range picker
 */
export function DateRangeFilter({ filter, showInitialCount = false }: DateRangeFilterProps) {
  // Get filter functions from useUrlFilters hook
  // WHY: Provides getRange and setRange functions for URL state management
  // HOW: Hook reads from URL searchParams and updates via router.replace
  const { getRange, setRange, remove } = useUrlFilters()

  // Get currently selected date range from URL
  // WHY: Need to know which dates are selected to show in button and picker
  // HOW: getRange returns object with start and end dates or null
  const range = getRange(filter.key)

  // Convert string dates to Date objects for react-date-range
  // WHY: react-date-range requires Date objects, not strings
  // HOW: Parse date strings if they exist, otherwise use undefined
  const startDate = range?.start ? new Date(range.start) : undefined
  const endDate = range?.end ? new Date(range.end) : undefined

  // State for date range picker
  // WHY: react-date-range needs controlled state
  // HOW: Initialize with current URL values or empty range
  const [dateRangeState, setDateRangeState] = useState([
    {
      startDate: startDate || new Date(),
      endDate: endDate || new Date(),
      key: "selection",
    },
  ])

  // Format date range for button display
  // WHY: Shows user which date range is currently selected
  // HOW: Formats dates using date-fns format function
  const getButtonText = () => {
    if (range?.start && range?.end) {
      const start = new Date(range.start)
      const end = new Date(range.end)
      return `${format(start, "MMM d, yyyy")} - ${format(end, "MMM d, yyyy")}`
    }
    return filter.label
  }

  // Handle date range selection
  // WHY: Updates URL when user selects dates
  // HOW: Converts Date objects to YYYY-MM-DD strings and calls setRange
  const handleDateSelect = (ranges: any) => {
    const selection = ranges.selection
    setDateRangeState([selection])

    if (selection.startDate && selection.endDate) {
      // Format dates as YYYY-MM-DD strings for URL
      // WHY: URL params should be in consistent format
      // HOW: Use toISOString and extract date part
      const formatDate = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const day = String(date.getDate()).padStart(2, "0")
        return `${year}-${month}-${day}`
      }

      const startDateString = formatDate(selection.startDate)
      const endDateString = formatDate(selection.endDate)

      // Update URL with date range
      // WHY: Persists filter state in URL
      // HOW: setRange updates URL param with underscore-separated dates
      setRange(filter.key, startDateString, endDateString)
    }
  }

  return (
    <DropdownMenu>
      {/* Dropdown trigger button */}
      {/* WHY: Provides clickable button to open date picker */}
      {/* HOW: Uses DropdownMenuTrigger with Button component */}
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "min-w-[200px] justify-between",
            range?.start && range?.end && "bg-accent"
          )}
        >
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {getButtonText()}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      {/* Dropdown content with date range picker */}
      {/* WHY: Provides calendar interface for date selection */}
      {/* HOW: Uses react-date-range DateRange component */}
      <DropdownMenuContent align="start" className="p-0">
        <div className="p-4">
          {/* Quick Select for Dates */}
          {/* WHY: Allow users to quickly select common dates */}
          {/* HOW: Show DateQuickSelect if showQuickSelect is true and options exist */}
          {filter.showQuickSelect && filter.options && filter.options.length > 0 && (
            <DateQuickSelect filter={filter} showInitialCount={showInitialCount} />
          )}
          
          <DateRange
            ranges={dateRangeState}
            onChange={handleDateSelect}
            rangeColors={["hsl(var(--primary))"]}
            showDateDisplay={false}
            showMonthAndYearPickers={true}
            moveRangeOnFirstSelection={false}
            months={2}
            direction="horizontal"
            weekStartsOn={1}
          />
          
          {/* Clear selection button */}
          {/* WHY: Allows user to remove date range filter */}
          {/* HOW: Calls remove to delete URL param */}
          {range?.start && range?.end && (
            <div className="mt-2 pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  // Remove filter from URL
                  // WHY: Allows user to clear the filter
                  // HOW: remove deletes the URL param
                  remove(filter.key)
                }}
              >
                Clear selection
              </Button>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
