/**
 * DateFilterButton Component
 * 
 * Purpose: Button that opens ReactDateFilterDropdown for a selected column
 * Used in: Filter pages for date filtering
 * Why: Provides date filtering capability integrated with URL-based filtering system
 * 
 * Features:
 * - Configurable filter key for URL parameter
 * - Opens ReactDateFilterDropdown on click
 * - Integrates with URL-based filtering via useUrlFilters
 * - Consistent styling with other filter components
 * - Shows active state when date filter is applied
 * - Formats display text based on date range mode (day, week, month, range)
 */

'use client'

import React, { useState, useRef, useEffect } from "react"
import { Calendar, ChevronDown } from "lucide-react"
import ReactDateFilterDropDown from "./ReactDateFilterDropDown"
import { useUrlFilters } from "../../hooks/useUrlFilters"
import { formatDateFilterDisplay, DateFilterMode, detectDateFilterMode } from "./date-display-utils"

////////////////////////////////////
// Type Definitions: Component props and interfaces
////////////////////////////////////

/**
 * Props for the DateFilterButton component
 */
export interface DateFilterButtonProps {
  /**
   * Filter key for URL parameter (e.g., "date", "taskDate")
   * WHY: Identifies which URL parameter to read/write
   * HOW: Used with useUrlFilters to get/set date range
   */
  filterKey: string
  
  /**
   * Button text (defaults to "Filter by Date")
   * WHY: Allow customization of button label
   * HOW: Displayed when no filter is active
   */
  buttonText?: string
  
  /**
   * Custom width for the button
   * WHY: Allow customization of button width
   * HOW: Applied to button element
   */
  width?: string
  
  /**
   * Whether the button is currently open (controlled mode)
   * WHY: Allow parent to control dropdown state
   * HOW: If provided, component becomes controlled
   */
  isOpen?: boolean
  
  /**
   * Callback when dropdown opens/closes
   * WHY: Allow parent to track dropdown state
   * HOW: Called with new open state
   */
  onToggle?: (isOpen: boolean) => void
  
  /**
   * Whether to show the date filter header (mode selector)
   * WHY: Control visibility of mode selector in dropdown
   * HOW: Passed to ReactDateFilterDropDown
   */
  showDateFilterHeader?: boolean
}

////////////////////////////////////
// Component Implementation: Date filter button with dropdown
////////////////////////////////////

/**
 * Date filter button component that opens ReactDateFilterDropdown
 * 
 * @param {DateFilterButtonProps} props - Component props
 * @returns {JSX.Element} Date filter button with dropdown
 * 
 * @example
 * ```tsx
 * <DateFilterButton
 *   filterKey="date"
 *   buttonText="Filter by Date"
 *   width="200px"
 * />
 * ```
 */
export function DateFilterButton({
  filterKey,
  buttonText = "Filter by Date",
  width = "200px",
  isOpen: controlledIsOpen,
  onToggle,
  showDateFilterHeader = true
}: DateFilterButtonProps) {
  ////////////////////////////////////
  // State Management: Internal dropdown state
  ////////////////////////////////////
  
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(controlledIsOpen || false)
  const [selectedMode, setSelectedMode] = useState<DateFilterMode>('day')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  
  // URL filters hook
  const { getRange, setRange, remove } = useUrlFilters()
  
  // Get current date range from URL
  const dateRange = getRange(filterKey)
  const hasActiveFilters = dateRange !== null && (dateRange.start || dateRange.end)
  
  // Get current date values from URL
  const currentStartDate = dateRange?.start || ""
  const currentEndDate = dateRange?.end || ""

  // Sync internal state with controlled prop
  useEffect(() => {
    if (controlledIsOpen !== undefined) {
      setIsDropdownOpen(controlledIsOpen)
    }
  }, [controlledIsOpen])

  // Detect mode from existing filters when component mounts or filters change
  useEffect(() => {
    if (hasActiveFilters && currentStartDate && currentEndDate) {
      const detectedMode = detectDateFilterMode(currentStartDate, currentEndDate)
      if (detectedMode) {
        setSelectedMode(detectedMode)
      }
    }
  }, [hasActiveFilters, currentStartDate, currentEndDate])
  
  /**
   * Handle mode change from ReactDateFilterDropDown
   */
  const handleModeChange = (mode: DateFilterMode) => {
    setSelectedMode(mode)
  }
  
  ////////////////////////////////////
  // Helper Functions: Format display text
  ////////////////////////////////////
  
  /**
   * Get the formatted display text for the button based on selected date range and mode
   */
  const getButtonDisplayText = (): string => {
    if (!hasActiveFilters || !currentStartDate || !currentEndDate) {
      return buttonText
    }
    
    // Use the utility function to format the display text
    return formatDateFilterDisplay({
      startDate: currentStartDate,
      endDate: currentEndDate,
      mode: selectedMode,
      defaultText: buttonText
    })
  }
  
  ////////////////////////////////////
  // Event Handlers: Dropdown and filter management
  ////////////////////////////////////
  
  /**
   * Handle button click to toggle dropdown
   */
  const handleClick = () => {
    const newOpenState = !isDropdownOpen
    setIsDropdownOpen(newOpenState)
    onToggle?.(newOpenState)
  }
  
  /**
   * Handle date range changes from ReactDateFilterDropdown
   */
  const handleDateRangeChange = (startDate: string, endDate: string, mode: DateFilterMode) => {
    // Store the selected mode for display formatting
    setSelectedMode(mode)
    
    // Update the URL with the date range
    if (startDate && endDate) {
      setRange(filterKey, startDate, endDate)
    } else {
      // Clear the filter if no dates provided
      remove(filterKey)
    }
  }

  /**
   * Handle reset/clear date filter
   */
  const handleReset = () => {
    // Reset to default mode (day) when filters are cleared
    setSelectedMode('day')
    
    // Clear the date filter from URL
    remove(filterKey)
  }
  
  /**
   * Handle click outside to close dropdown
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
        onToggle?.(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen, onToggle])
  
  ////////////////////////////////////
  // Main Render: Date filter button with dropdown
  ////////////////////////////////////
  
  return (
    <div className="relative w-full lg:w-fit" ref={dropdownRef}>
      {/* Filter Button */}
      <button
        ref={buttonRef}
        onClick={handleClick}
        className={`w-[200px] cursor-pointer flex items-center justify-between px-3 py-[10px] text-xs border rounded-lg transition-colors duration-200 group
          ${
            hasActiveFilters
              ? 'bg-tertiary text-background hover:bg-tertiary/90 border-tertiary'
              : 'bg-tertiary/10 text-foreground hover:bg-tertiary/80 border-tertiary/40 dark:border-tertiary/20 hover:border-tertiary/50'
          }
          ${isDropdownOpen ? 'border-tertiary' : ''}
        `}
        style={{ width }}
      >
        <div className="flex items-center gap-2">
          <Calendar size={16} className={`transition-colors duration-200 ${hasActiveFilters ? 'text-background' : 'text-foreground/80 group-hover:text-background'}`} />
          <span className={`text-xs font-medium transition-colors duration-200 ${hasActiveFilters ? 'text-background' : 'text-foreground/80 group-hover:text-background'}`}>
            {getButtonDisplayText()}
          </span>
        </div>
        <ChevronDown 
          className={`w-4 h-4 transition-all duration-200 ${isDropdownOpen ? 'rotate-180' : ''} ${
            hasActiveFilters ? 'text-background' : 'text-foreground/80 group-hover:text-background'
          }`} 
        />
      </button>

      {/* Date Filter Dropdown - Always rendered, hidden with CSS to preserve state */}
      <div className={`absolute top-full right-1/2 lg:right-0 translate-x-[-0%] lg:translate-x-[-25%] z-50 mt-1 transition-opacity duration-200 ${
        isDropdownOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none invisible'
      }`}>
        <ReactDateFilterDropDown
          onDateRangeChange={handleDateRangeChange}
          selectedStartDate={currentStartDate}
          selectedEndDate={currentEndDate}
          buttonText={buttonText}
          width={width}
          selectedDateMode={selectedMode}
          setSelectedDateMode={handleModeChange}
          initialStartDate={currentStartDate}
          initialEndDate={currentEndDate}
          onReset={handleReset}
          setIsDropdownOpen={setIsDropdownOpen}
          showDateFilterHeader={showDateFilterHeader}
        />
      </div>
    </div>
  )
}

// Export component with React.memo for performance optimization
export default React.memo(DateFilterButton)
