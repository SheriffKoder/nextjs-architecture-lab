/**
 * Search Bar Component (Dropdown Filter Style)
 * 
 * Purpose: Search input component with dropdown filter button styling
 * Used in: Dropdown filter contexts that need search functionality
 * Why: Provides search bar that matches the visual style of filter-box-button
 * 
 * Features:
 * - Same color styling as FilterBoxButton
 * - URL state management with debouncing
 * - Search icon integration
 * - Responsive hover states
 */

'use client'

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { useUrlFilters } from "../../../hooks/useUrlFilters"
import { useEffectiveSearchParams } from '@/platform/url-kit/url-params'
import { Search } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import type { SearchConfig } from "../../search-types"

//////////////////////////////////
// Component Props
//////////////////////////////////

interface DropdownSearchBarProps<T extends Record<string, any>> {
  /**
   * Search configuration containing searchable fields and placeholder
   * WHY: Provides all information needed to render the search bar
   * HOW: Used to get placeholder text and searchable fields
   */
  config: SearchConfig<T>
  
  /**
   * Debounce delay in milliseconds
   * WHY: Prevents excessive URL updates while user is typing
   * HOW: Delays URL update until user stops typing for specified time
   */
  debounceMs?: number
  
  /**
   * Additional CSS classes
   * WHY: Allows custom styling
   * HOW: Merged with default classes
   */
  className?: string
  
  /**
   * Whether the search bar is active (has a value)
   * WHY: Visual feedback for active search state
   * HOW: Changes background color to tertiary (matching FilterBoxButton active state)
   */
  isActive?: boolean
}

/**
 * DropdownSearchBar component - search input with FilterBoxButton styling
 * WHY: Provides search functionality with dropdown filter visual consistency
 * HOW: Uses useUrlFilters hook to read/write search query, debounces updates, applies FilterBoxButton color scheme
 * @param {DropdownSearchBarProps<T>} props - Component props containing search config
 * @returns {React.ReactElement} Search input with FilterBoxButton styling
 */
export function DropdownSearchBar<T extends Record<string, any>>({ 
  config, 
  debounceMs = 300,
  className,
  isActive: externalIsActive,
}: DropdownSearchBarProps<T>) {
  // Get search functions from useUrlFilters hook
  // WHY: Provides setSearch function for URL state management
  // HOW: Hook updates URL via url-params transport
  const { setSearch } = useUrlFilters()
  
  // Get searchParams directly to read current value
  // WHY: Need stable reference to check URL value changes
  // HOW: useEffectiveSearchParams provides transport-aware URL params
  const searchParams = useEffectiveSearchParams()
  
  // Get current search value from URL
  // WHY: Initialize and sync with URL state
  // HOW: Read 'q' parameter from searchParams
  const urlSearchValue = searchParams.get('q') || ''
  
  // Determine if search is active (has value)
  // WHY: Apply active styling when search has a value
  // HOW: Use external prop if provided, otherwise check if urlSearchValue has content
  const isActive = externalIsActive !== undefined ? externalIsActive : urlSearchValue.length > 0
  
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
  // HOW: Delay setSearch call until user stops typing for debounceMs
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only update URL if local value differs from current URL
      // WHY: Avoid unnecessary URL updates
      // HOW: Compare local state with current URL value
      if (localValue !== urlSearchValue) {
        setSearch(localValue)
      }
    }, debounceMs)
    
    return () => clearTimeout(timer)
  }, [localValue, debounceMs, setSearch, urlSearchValue])
  
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
    <div className={cn("relative min-w-[300px] flex-1 group", className)}>
      {/* Search icon */}
      {/* WHY: Visual indicator that this is a search input */}
      {/* HOW: Absolute positioned icon on left side with FilterBoxButton color scheme */}
      <Search 
        className={cn(
          "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none transition-colors duration-200",
          isActive 
            ? "text-background" 
            : "text-foreground/80 group-hover:text-tertiary"
        )} 
      />
      
      {/* Search input */}
      {/* WHY: Allows user to type search query */}
      {/* HOW: Controlled input with debounced URL updates and FilterBoxButton styling */}
      <input
        type="text"
        placeholder={config.placeholder || "Search..."}
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        className={cn(
          "w-full px-3 py-[10px] pl-9 text-xs border rounded-lg transition-colors duration-200 outline-none focus:ring-1 focus:ring-tertiary",
          isActive
            ? "bg-tertiary text-background hover:bg-tertiary/90 border-tertiary placeholder:text-background/60"
            : "bg-tertiary/10 text-foreground hover:bg-tertiary/20 border-tertiary/40 dark:border-tertiary/20 hover:border-tertiary/50 placeholder:text-foreground/50"
        )}
      />
    </div>
  )
}
