/**
 * Date Range Filter Dropdown Component
 * 
 * Purpose: Date range filter with MM/DD/YYYY inputs for dropdown
 * Used in: DropdownFilter component for date-range filters
 * Why: Provides date range filtering matching old component exactly
 */

'use client'

import * as React from "react"
import { useState, useEffect } from "react"
import { useUrlFilters } from "../../../hooks/useUrlFilters"
import type { FilterConfig } from "../../filter-types"

//////////////////////////////////
// Type Definitions
//////////////////////////////////

interface DateRangeFilterDropdownProps {
  /**
   * Filter configuration
   * WHY: Provides filter key for URL params
   * HOW: Used to get/set date range in URL
   */
  filter: FilterConfig
  
  /**
   * Callback when date range changes
   * WHY: Notify parent of date range changes
   * HOW: Called with start and end date strings
   */
  onDateRangeChange?: (start: string, end: string) => void
}

interface DateParts {
  month: string
  day: string
  year: string
}

//////////////////////////////////
// Component Implementation
//////////////////////////////////

/**
 * DateRangeFilterDropdown component - date range inputs
 * WHY: Provides date range filtering with exact styling from old component
 * HOW: Renders MM/DD/YYYY inputs for start and end dates
 * @param {DateRangeFilterDropdownProps} props - Component props
 * @returns {React.ReactElement} Date range filter
 */
export function DateRangeFilterDropdown({
  filter,
  onDateRangeChange
}: DateRangeFilterDropdownProps) {
  const { getRange, setRange, remove } = useUrlFilters()
  
  // Get current range from URL
  const range = getRange(filter.key)
  
  // Parse date strings into parts (MM/DD/YYYY format)
  const parseDateParts = (dateStr: string | undefined): DateParts => {
    if (!dateStr) return { month: '', day: '', year: '' }
    
    // Convert YYYY-MM-DD to MM/DD/YYYY
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      return {
        month: parts[1] || '',
        day: parts[2] || '',
        year: parts[0] || ''
      }
    }
    
    // If already in MM/DD/YYYY format
    const slashParts = dateStr.split('/')
    if (slashParts.length === 3) {
      return {
        month: slashParts[0] || '',
        day: slashParts[1] || '',
        year: slashParts[2] || ''
      }
    }
    
    return { month: '', day: '', year: '' }
  }
  
  const [startDateParts, setStartDateParts] = useState<DateParts>(() => 
    parseDateParts(range?.start)
  )
  const [endDateParts, setEndDateParts] = useState<DateParts>(() => 
    parseDateParts(range?.end)
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Sync with URL changes
  useEffect(() => {
    setStartDateParts(parseDateParts(range?.start))
    setEndDateParts(parseDateParts(range?.end))
  }, [range?.start, range?.end])
  
  // Combine date parts into MM/DD/YYYY format
  const formatDateString = (parts: DateParts): string => {
    if (!parts.month && !parts.day && !parts.year) return ''
    return `${parts.month.padStart(2, '0')}/${parts.day.padStart(2, '0')}/${parts.year}`
  }
  
  // Convert MM/DD/YYYY to YYYY-MM-DD for URL
  const convertToISO = (dateString: string): string => {
    if (!dateString) return ''
    const parts = dateString.split('/')
    if (parts.length === 3) {
      return `${parts[2]}-${parts[0]}-${parts[1]}`
    }
    return dateString
  }
  
  // Validate dates
  const validateDates = (): boolean => {
    setErrorMessage(null)
    
    const hasStartDate = startDateParts.month || startDateParts.day || startDateParts.year
    const hasEndDate = endDateParts.month || endDateParts.day || endDateParts.year
    
    if (!hasStartDate && !hasEndDate) {
      setErrorMessage("Please enter at least one date")
      return false
    }
    
    if (hasStartDate && (!startDateParts.month || !startDateParts.day || !startDateParts.year)) {
      setErrorMessage("Start date is incomplete")
      return false
    }
    
    if (hasEndDate && (!endDateParts.month || !endDateParts.day || !endDateParts.year)) {
      setErrorMessage("End date is incomplete")
      return false
    }
    
    if (hasStartDate && hasEndDate) {
      const startDateStr = formatDateString(startDateParts)
      const endDateStr = formatDateString(endDateParts)
      const start = new Date(convertToISO(startDateStr))
      const end = new Date(convertToISO(endDateStr))
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        setErrorMessage("Invalid date")
        return false
      }
      
      if (start > end) {
        setErrorMessage("Start date must be before end date")
        return false
      }
    }
    
    return true
  }
  
  // Apply filter
  const applyFilter = () => {
    if (!validateDates()) return
    
    const startDateStr = formatDateString(startDateParts)
    const endDateStr = formatDateString(endDateParts)
    
    if (startDateStr && endDateStr) {
      const startISO = convertToISO(startDateStr)
      const endISO = convertToISO(endDateStr)
      setRange(filter.key, startISO, endISO)
      
      if (onDateRangeChange) {
        onDateRangeChange(startISO, endISO)
      }
    } else if (startDateStr || endDateStr) {
      const date = startDateStr || endDateStr
      const dateISO = convertToISO(date)
      setRange(filter.key, dateISO, dateISO)
      
      if (onDateRangeChange) {
        onDateRangeChange(dateISO, dateISO)
      }
    }
  }
  
  // Clear filter
  const handleClear = () => {
    setStartDateParts({ month: '', day: '', year: '' })
    setEndDateParts({ month: '', day: '', year: '' })
    setErrorMessage(null)
    remove(filter.key)
  }
  
  // Handle input changes
  const handleInputChange = (
    part: 'month' | 'day' | 'year',
    value: string,
    dateType: 'start' | 'end'
  ) => {
    if (value !== '' && !/^\d+$/.test(value)) return
    
    if (part === 'month') {
      const monthNum = parseInt(value)
      if (value !== '' && (monthNum < 1 || monthNum > 12)) return
      if (value.length > 2) return
    } else if (part === 'day') {
      const dayNum = parseInt(value)
      if (value !== '' && (dayNum < 1 || dayNum > 31)) return
      if (value.length > 2) return
    } else if (part === 'year') {
      if (value.length > 4) return
    }
    
    if (dateType === 'start') {
      setStartDateParts(prev => ({ ...prev, [part]: value }))
    } else {
      setEndDateParts(prev => ({ ...prev, [part]: value }))
    }
  }
  
  return (
    <div className="p-3">
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Start Date</label>
          <div className="flex space-x-2">
            <div className="w-1/3">
              <input
                type="text"
                placeholder="MM"
                className="w-full p-1.5 text-xs border border-border rounded text-center bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-tertiary focus:border-tertiary"
                value={startDateParts.month}
                onChange={(e) => handleInputChange('month', e.target.value, 'start')}
                maxLength={2}
              />
              <div className="text-xs text-muted-foreground text-center mt-0.5">Month</div>
            </div>
            <div className="w-1/3">
              <input
                type="text"
                placeholder="DD"
                className="w-full p-1.5 text-xs border border-border rounded text-center bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-tertiary focus:border-tertiary"
                value={startDateParts.day}
                onChange={(e) => handleInputChange('day', e.target.value, 'start')}
                maxLength={2}
              />
              <div className="text-xs text-muted-foreground text-center mt-0.5">Day</div>
            </div>
            <div className="w-1/3">
              <input
                type="text"
                placeholder="YYYY"
                className="w-full p-1.5 text-xs border border-border rounded text-center bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-tertiary focus:border-tertiary"
                value={startDateParts.year}
                onChange={(e) => handleInputChange('year', e.target.value, 'start')}
                maxLength={4}
              />
              <div className="text-xs text-muted-foreground text-center mt-0.5">Year</div>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-xs text-muted-foreground mb-1">End Date</label>
          <div className="flex space-x-2">
            <div className="w-1/3">
              <input
                type="text"
                placeholder="MM"
                className="w-full p-1.5 text-xs border border-border rounded text-center bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-tertiary focus:border-tertiary"
                value={endDateParts.month}
                onChange={(e) => handleInputChange('month', e.target.value, 'end')}
                maxLength={2}
              />
              <div className="text-xs text-muted-foreground text-center mt-0.5">Month</div>
            </div>
            <div className="w-1/3">
              <input
                type="text"
                placeholder="DD"
                className="w-full p-1.5 text-xs border border-border rounded text-center bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-tertiary focus:border-tertiary"
                value={endDateParts.day}
                onChange={(e) => handleInputChange('day', e.target.value, 'end')}
                maxLength={2}
              />
              <div className="text-xs text-muted-foreground text-center mt-0.5">Day</div>
            </div>
            <div className="w-1/3">
              <input
                type="text"
                placeholder="YYYY"
                className="w-full p-1.5 text-xs border border-border rounded text-center bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-tertiary focus:border-tertiary"
                value={endDateParts.year}
                onChange={(e) => handleInputChange('year', e.target.value, 'end')}
                maxLength={4}
              />
              <div className="text-xs text-muted-foreground text-center mt-0.5">Year</div>
            </div>
          </div>
        </div>
        
        {errorMessage && (
          <div className="text-xs text-destructive">{errorMessage}</div>
        )}
        
        <div className="flex justify-between pt-1">
          <button
            onClick={handleClear}
            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer underline"
          >
            Clear
          </button>
          
          <button
            onClick={applyFilter}
            className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!startDateParts.month && !startDateParts.day && !startDateParts.year && 
              !endDateParts.month && !endDateParts.day && !endDateParts.year}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
