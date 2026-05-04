/**
 * Pill Search Bar Component
 * 
 * Purpose: Integrated search bar for pill filter container
 * Used in: PillFilter component as part of the pill container
 * Why: Provides search functionality within the pill-shaped filter container
 * 
 * Features:
 * - Search icon on left
 * - Input field
 * - Chevron toggle button on right
 * - Integrated with useUrlFilters for URL state
 */

'use client'

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { useUrlFilters } from "../../hooks/useUrlFilters"
import { useSearchParams } from "next/navigation"
import { Search, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SearchConfig } from "../search-types"

//////////////////////////////////
// Component Props
//////////////////////////////////

interface PillSearchBarProps {
  /**
   * Search configuration
   * WHY: Provides searchable fields and placeholder
   * HOW: Used to get placeholder text
   */
  searchConfig?: SearchConfig<any>
  
  /**
   * Whether dropdown is open
   * WHY: Need to show chevron up/down based on state
   * HOW: Controls chevron icon direction
   */
  isDropdownOpen: boolean
  
  /**
   * Callback when chevron is clicked
   * WHY: Need to toggle dropdown from search bar
   * HOW: Called when chevron button is clicked
   */
  onToggleClick: () => void
  
  /**
   * Additional CSS classes
   * WHY: Allows custom styling
   * HOW: Merged with default classes
   */
  className?: string
}

/**
 * PillSearchBar component - search input integrated into pill container
 * WHY: Provides search functionality within pill filter
 * HOW: Uses useUrlFilters to read/write search query, debounces updates
 * @param {PillSearchBarProps} props - Component props
 * @returns {React.ReactElement} Search input with icon and toggle button
 */
export function PillSearchBar({
  searchConfig,
  isDropdownOpen,
  onToggleClick,
  className,
}: PillSearchBarProps) {
  // Get search functions from useUrlFilters hook
  // WHY: Provides setSearch function for URL state management
  // HOW: Hook updates URL via router.replace
  const { setSearch } = useUrlFilters()
  
  // Get searchParams directly to read current value
  // WHY: Need stable reference to check URL value changes
  // HOW: useSearchParams provides current URL params
  const searchParams = useSearchParams()
  
  // Get current search value from URL
  // WHY: Initialize and sync with URL state
  // HOW: Read 'q' parameter from searchParams
  const urlSearchValue = searchParams.get('q') || ''
  
  // Local state for input value
  // WHY: Need controlled input for immediate UI feedback
  // HOW: Initialize with current URL value
  const [localValue, setLocalValue] = useState<string>(urlSearchValue)
  
  // Track previous URL value to detect actual URL changes
  // WHY: Only sync when URL changes externally (not from our own updates)
  // HOW: Compare current URL value with previous to detect real changes
  const prevUrlValueRef = useRef<string>(urlSearchValue)
  
  // Debounce URL updates
  // WHY: Prevent excessive URL updates while user is typing
  // HOW: Delay setSearch call until user stops typing for 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only update URL if local value differs from current URL
      // WHY: Avoid unnecessary URL updates
      // HOW: Compare local state with current URL value
      if (localValue !== urlSearchValue) {
        setSearch(localValue)
      }
    }, 300)
    
    return () => clearTimeout(timer)
  }, [localValue, setSearch, urlSearchValue])
  
  // Sync local state with URL changes (e.g., when cleared externally or page navigation)
  // WHY: Keep input in sync with URL state when URL changes externally
  // HOW: Update local state only when URL value actually changes (not from our updates)
  useEffect(() => {
    // Only sync if URL value changed externally (different from previous URL value)
    // WHY: Prevent resetting user input while typing
    // HOW: Compare URL value with previous URL value to detect external changes
    if (urlSearchValue !== prevUrlValueRef.current) {
      setLocalValue(urlSearchValue)
      prevUrlValueRef.current = urlSearchValue
    }
  }, [urlSearchValue])
  
  // Handle input change
  // WHY: Update local state immediately for responsive UI
  // HOW: Update state, URL update is handled by debounced effect
  const handleChange = (value: string) => {
    setLocalValue(value)
  }
  
  return (
    <div className={cn("relative flex-1 max-w-full", className)}>
      {/* Search Icon */}
      {/* WHY: Visual indicator that this is a search input */}
      {/* HOW: Absolute positioned icon on left side */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-[1]">
        <Search className="h-4 w-4 text-muted-foreground" />
      </div>
      
      {/* Search Input Field */}
      {/* WHY: Allows user to type search query */}
      {/* HOW: Controlled input with debounced URL updates */}
      <input
        type="text"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={searchConfig?.placeholder || "Search..."}
        className="block w-full pl-10 pr-10 py-2 bg-tertiary/10 backdrop-blur-sm text-foreground placeholder:text-muted-foreground text-sm border-0 focus:outline-none rounded-r-md"
        aria-label="Search"
      />
      
      {/* Chevron Toggle Button */}
      {/* WHY: Allows user to toggle dropdown */}
      {/* HOW: Absolute positioned on right, shows up/down based on state */}
      <button
        onClick={onToggleClick}
        className="absolute z-[1] right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors duration-200"
        aria-label={isDropdownOpen ? "Close filters" : "Open filters"}
      >
        {isDropdownOpen ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground transition-transform duration-200" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200" />
        )}
      </button>
    </div>
  )
}
