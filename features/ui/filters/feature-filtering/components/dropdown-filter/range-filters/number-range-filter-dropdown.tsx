/**
 * Number Range Filter Dropdown Component
 * 
 * Purpose: Number range filter with Min/Max inputs for dropdown
 * Used in: DropdownFilter component for number-range filters
 * Why: Provides number range filtering matching old component exactly
 */

'use client'

import * as React from "react"
import { useState, useEffect } from "react"
import { useUrlFilters } from "../../../hooks/useUrlFilters"
import type { FilterConfig } from "../../filter-types"

//////////////////////////////////
// Type Definitions
//////////////////////////////////

interface NumberRangeFilterDropdownProps {
  /**
   * Filter configuration
   * WHY: Provides filter key for URL params
   * HOW: Used to get/set number range in URL
   */
  filter: FilterConfig
  
  /**
   * Number of decimal places
   * WHY: Control precision of number inputs
   * HOW: Used for step attribute and formatting
   */
  decimalPlaces?: number
  
  /**
   * Callback when number range changes
   * WHY: Notify parent of range changes
   * HOW: Called with min and max numbers
   */
  onNumberRangeChange?: (min: number, max: number) => void
}

//////////////////////////////////
// Component Implementation
//////////////////////////////////

/**
 * NumberRangeFilterDropdown component - number range inputs
 * WHY: Provides number range filtering with exact styling from old component
 * HOW: Renders Min and Max number inputs
 * @param {NumberRangeFilterDropdownProps} props - Component props
 * @returns {React.ReactElement} Number range filter
 */
export function NumberRangeFilterDropdown({
  filter,
  decimalPlaces = 2,
  onNumberRangeChange
}: NumberRangeFilterDropdownProps) {
  const { getNumberRange, setNumberRange, remove } = useUrlFilters()
  
  // Get current range from URL
  const range = getNumberRange(filter.key)
  
  const [minValue, setMinValue] = useState<string>(range?.min?.toString() || '')
  const [maxValue, setMaxValue] = useState<string>(range?.max?.toString() || '')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Sync with URL changes
  useEffect(() => {
    setMinValue(range?.min?.toString() || '')
    setMaxValue(range?.max?.toString() || '')
  }, [range?.min, range?.max])
  
  // Apply filter
  const applyFilter = () => {
    setErrorMessage(null)
    
    const minNum = minValue ? parseFloat(minValue) : undefined
    const maxNum = maxValue ? parseFloat(maxValue) : undefined
    
    if (minNum !== undefined && maxNum !== undefined && minNum > maxNum) {
      setErrorMessage("Min value cannot be greater than max value")
      return
    }
    
    if (minNum !== undefined && isNaN(minNum)) {
      setErrorMessage("Invalid min value")
      return
    }
    
    if (maxNum !== undefined && isNaN(maxNum)) {
      setErrorMessage("Invalid max value")
      return
    }
    
    setNumberRange(filter.key, minNum, maxNum)
    
    if (onNumberRangeChange && (minNum !== undefined || maxNum !== undefined)) {
      onNumberRangeChange(minNum || 0, maxNum || 0)
    }
  }
  
  // Clear filter
  const handleClear = () => {
    setMinValue('')
    setMaxValue('')
    setErrorMessage(null)
    remove(filter.key)
  }
  
  // Calculate step value
  const step = decimalPlaces > 0 ? `0.${'0'.repeat(decimalPlaces - 1)}1` : '1'
  
  return (
    <div className="p-2 pt-0">
      <div className="flex space-x-2 mt-2">
        <div className="flex-1">
          <input
            type="number"
            placeholder="Min"
            className="w-full p-1.5 border border-border rounded text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-tertiary focus:border-tertiary"
            value={minValue}
            onChange={(e) => setMinValue(e.target.value)}
            step={step}
          />
        </div>
        <div className="flex-1">
          <input
            type="number"
            placeholder="Max"
            className="w-full p-1.5 border border-border rounded text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-tertiary focus:border-tertiary"
            value={maxValue}
            onChange={(e) => setMaxValue(e.target.value)}
            step={step}
          />
        </div>
        <button
          className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={applyFilter}
          disabled={!minValue && !maxValue}
        >
          Apply
        </button>
      </div>
      
      {errorMessage && (
        <div className="text-destructive text-xs mt-1">{errorMessage}</div>
      )}
    </div>
  )
}
