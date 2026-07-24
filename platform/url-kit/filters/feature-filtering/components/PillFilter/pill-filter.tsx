/**
 * Pill Filter Component
 * 
 * Purpose: Pill-shaped filter container with integrated search and dropdown
 * Used in: Pages that need filtering functionality (RSC and client pages)
 * Why: Provides a compact, modern filter UI with search integration
 * 
 * Features:
 * - Pill-shaped container with filter button and search input
 * - Active filter count badge
 * - Dropdown panel with two-column layout (filters left, options right)
 * - Integrated search bar
 * - Smooth transitions and backdrop blur
 */

'use client'

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { Filter } from "lucide-react"
import { FilterConfig } from "../filter-types"
import { SearchConfig } from "../search-types"
import { useUrlFilters } from "../../hooks/useUrlFilters"
import { FilterColumnList } from "./filter-column-list"
import { FilterOptionsPanel } from "./filter-options-panel"
import { PillSearchBar } from "./pill-search-bar"
import { cn } from "@/shared/lib/utils"

//////////////////////////////////
// Component Props
//////////////////////////////////

interface PillFilterProps {
  /**
   * Filter configurations with options
   * WHY: Provides all filters to display
   * HOW: Array of FilterConfig objects with populated options
   */
  filters: FilterConfig[]
  
  /**
   * Search configuration
   * WHY: Provides searchable fields and placeholder
   * HOW: Optional, used for search bar if provided
   */
  searchConfig?: SearchConfig<any>
  
  /**
   * Whether to display initial count alongside count
   * WHY: Show both count and initialCount in format "count / initialCount"
   * HOW: If true, displays "count / initialCount"; if false, displays only "count"
   * Default: false
   */
  showInitialCount?: boolean
  
  /**
   * Additional CSS classes
   * WHY: Allows custom styling
   * HOW: Merged with default classes
   */
  className?: string
}

/**
 * PillFilter component - pill-shaped filter container with search
 * WHY: Provides modern, compact filter UI with integrated search
 * HOW: Combines filter button, search input, and dropdown panel in pill container
 * @param {PillFilterProps} props - Component props
 * @returns {React.ReactElement} Pill-shaped filter container
 */
export function PillFilter({
  filters,
  searchConfig,
  showInitialCount = false,
  className,
}: PillFilterProps) {
  // State for dropdown visibility
  // WHY: Need to control when dropdown is shown
  // HOW: Toggle on filter button or chevron click
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)
  
  // State for active filter key
  // WHY: Need to know which filter's options to show
  // HOW: Set when user clicks a filter column
  const [activeFilterKey, setActiveFilterKey] = useState<string | null>(null)
  
  // State for tracking selected filters in order
  // WHY: Need to style previously selected filters differently
  // HOW: Track order of filter selections
  const [selectedFiltersOrder, setSelectedFiltersOrder] = useState<string[]>([])
  
  // Ref for dropdown container (for click outside detection)
  // WHY: Need to detect clicks outside dropdown to close it
  // HOW: Use ref to check if click target is outside
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Ref for filter button (to exclude from click outside detection)
  // WHY: Prevent click outside handler from closing dropdown when clicking filter button
  // HOW: Use ref to check if click target is the filter button
  const filterButtonRef = useRef<HTMLButtonElement>(null)
  
  // Get filter functions from useUrlFilters hook
  // WHY: Need to count active filters and check filter states
  // HOW: Use getters to check each filter's state
  const { getList, get, getRange, getNumberRange } = useUrlFilters()
  
  // Calculate active filter count
  // WHY: Show badge with number of active filters
  // HOW: Count filters that have active values
  const activeFilterCount = filters.reduce((count, filter) => {
    if (filter.type === "multi-select") {
      return count + getList(filter.key).length
    }
    if (filter.type === "single-select") {
      return count + (get(filter.key) ? 1 : 0)
    }
    if (filter.type === "date-range") {
      const range = getRange(filter.key)
      return count + (range?.start || range?.end ? 1 : 0)
    }
    if (filter.type === "number-range") {
      const range = getNumberRange(filter.key)
      return count + (range?.min !== undefined || range?.max !== undefined ? 1 : 0)
    }
    return count
  }, 0)
  
  // Check if any filters are active
  // WHY: Need to highlight filter button when filters are active
  // HOW: Check if activeFilterCount > 0
  const hasActiveFilters = activeFilterCount > 0
  
  // Handle filter column click
  // WHY: Need to set active filter when user clicks column
  // HOW: Update activeFilterKey and add to selectedFiltersOrder
  const handleFilterClick = (filterKey: string) => {
    setActiveFilterKey(filterKey)
    
    // Add to selected filters order if not already selected
    setSelectedFiltersOrder((prev) => {
      if (!prev.includes(filterKey)) {
        return [...prev, filterKey]
      }
      return prev
    })
  }
  
  // Handle filter toggle (open/close dropdown)
  // WHY: Need to toggle dropdown visibility
  // HOW: Toggle isDropdownOpen state
  const handleFilterToggle = () => {
    setIsDropdownOpen((prev) => {
      const newVisible = !prev
      
      // If opening dropdown and no active filter, set first filter as active
      if (newVisible && !activeFilterKey && selectedFiltersOrder.length === 0) {
        const firstFilter = filters[0]
        if (firstFilter) {
          setActiveFilterKey(firstFilter.key)
        }
      }
      
      return newVisible
    })
  }
  
  // Effect to set default filter when dropdown opens
  // WHY: Need to show a filter when dropdown first opens
  // HOW: Set first filter as active if none selected
  useEffect(() => {
    if (isDropdownOpen && !activeFilterKey && selectedFiltersOrder.length === 0) {
      const firstFilter = filters[0]
      if (firstFilter) {
        setActiveFilterKey(firstFilter.key)
      }
    }
  }, [isDropdownOpen, activeFilterKey, selectedFiltersOrder, filters])
  
  // Handle click outside to close dropdown
  // WHY: Better UX - close dropdown when clicking outside
  // HOW: Check if click target is outside dropdown container and not the filter button
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      
      // Don't close if clicking the filter button (it has its own toggle handler)
      if (filterButtonRef.current && filterButtonRef.current.contains(target)) {
        return
      }
      
      // Close if clicking outside dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false)
      }
    }
    
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isDropdownOpen])
  
  return (
    <div className={cn("relative w-full lg:w-auto", className)}>
      {/* Pill Container */}
      {/* WHY: Main container with pill-shaped border */}
      {/* HOW: Flex container with filter button and search input */}
      <div className="relative lg:w-[500px] border border-border rounded-lg">
        <div className="flex items-stretch h-full">
          {/* Filter Button */}
          {/* WHY: Provides clickable button to open dropdown */}
          {/* HOW: Pill-shaped button on left with filter icon and count badge */}
          <button
            ref={filterButtonRef}
            onClick={handleFilterToggle}
            className={cn(
              "flex items-center rounded-l-lg gap-2 px-4 py-2 cursor-pointer transition-colors border-r border-border duration-200",
              isDropdownOpen || hasActiveFilters
                ? "bg-tertiary text-tertiary-foreground hover:bg-tertiary/90"
                : "bg-tertiary text-tertiary-foreground hover:bg-tertiary/90"
            )}
          >
            <Filter className="w-4 h-4 text-background" />
            <span className="text-xs font-medium text-background">Filter</span>
            {hasActiveFilters && (
              <span className="ml-1 px-3 py-0.5 text-xs bg-foreground/30 rounded-full min-w-[18px] text-center text-background">
                {activeFilterCount}
              </span>
            )}
          </button>
          
          {/* Search Input Container */}
          {/* WHY: Integrated search bar in pill container */}
          {/* HOW: Uses PillSearchBar component */}
          <PillSearchBar
            searchConfig={searchConfig}
            isDropdownOpen={isDropdownOpen}
            onToggleClick={handleFilterToggle}
          />
        </div>
      </div>
      
      {/* Dropdown Panel */}
      {/* WHY: Shows filter columns and options when opened */}
      {/* HOW: Absolute positioned below pill, two-column layout */}
      <div
        ref={dropdownRef}
        className={cn(
          "absolute min-w-[calc(100vw-1.5rem)] lg:min-w-[600px] w-fit top-full left-0 right-0 z-50 mt-2 border border-border rounded-lg shadow-lg transition-all duration-200 bg-background/80 backdrop-blur-sm",
          isDropdownOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        )}
      >
        <div className="flex gap-2 lg:gap-6 p-2">
          {/* Left Side - Filter Column List */}
          {/* WHY: Shows all available filters as clickable columns */}
          {/* HOW: Uses FilterColumnList component */}
          <FilterColumnList
            filters={filters}
            activeFilterKey={activeFilterKey}
            selectedFiltersOrder={selectedFiltersOrder}
            onFilterClick={handleFilterClick}
          />
          
          {/* Right Side - Filter Options Panel */}
          {/* WHY: Shows filter options for active filter */}
          {/* HOW: Uses FilterOptionsPanel component */}
          <FilterOptionsPanel
            filters={filters}
            activeFilterKey={activeFilterKey}
            showInitialCount={showInitialCount}
          />
        </div>
      </div>
    </div>
  )
}
