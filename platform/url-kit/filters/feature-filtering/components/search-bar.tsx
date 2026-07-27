/**
 * Search Bar Component
 * 
 * Purpose: Reusable search input component that updates URL query parameter
 * Used in: Pages that need search functionality (RSC and client pages)
 * Why: Provides consistent search UI with URL state management
 * 
 * Function Index:
 * - SearchBar: Component that renders search input with debouncing
 *   Example input: <SearchBar config={searchConfig} />
 *   Example output: Search input that updates URL 'q' parameter
 * 
 * Steps:
 * 1. Get current search query from URL using useUrlFilters
 * 2. Render input with search icon
 * 3. Debounce URL updates to avoid excessive navigation
 * 4. Sync local state with URL changes
 */

'use client'

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { useUrlFilters } from "../hooks/useUrlFilters"
import { useSearchParams } from "next/navigation"
import { Input } from "./ui/input"
import { Search } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import type { SearchConfig } from "./search-types"
import {
  ScrollingPlaceholderOverlay,
  resolvePlaceholderMarqueeConfig,
  type PlaceholderMarqueeConfig,
} from "../features/placeholder-marquee"

//////////////////////////////////
// Component Props
//////////////////////////////////

interface SearchBarProps<T extends Record<string, any>> {
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
   * Scroll overflowing placeholder text horizontally (see features/placeholder-marquee).
   * Useful on narrow inputs where the hint would otherwise be clipped.
   */
  placeholderMarquee?: boolean | PlaceholderMarqueeConfig

  /** Typography for faux placeholder overlay (should match input placeholder classes). */
  placeholderClassName?: string
}

/**
 * SearchBar component - search input with URL state management
 * WHY: Provides search functionality with URL persistence
 * HOW: Uses useUrlFilters hook to read/write search query, debounces updates
 * @param {SearchBarProps<T>} props - Component props containing search config
 * @returns {React.ReactElement} Search input with icon
 */
export function SearchBar<T extends Record<string, any>>({ 
  config, 
  debounceMs = 300,
  className,
  placeholderMarquee,
  placeholderClassName,
}: SearchBarProps<T>) {
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

  const placeholderText = config.placeholder || 'Search...'
  const marquee = resolvePlaceholderMarqueeConfig(placeholderMarquee)
  const useMarqueePlaceholder = marquee.enabled
  const [isFocused, setIsFocused] = useState(false)
  const hasValue = localValue.length > 0

  return (
    <div className={cn("relative min-w-[300px] flex-1", className)}>
      {/* Search icon */}
      {/* WHY: Visual indicator that this is a search input */}
      {/* HOW: Absolute positioned icon on left side */}
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      
      {/* Search input */}
      {/* WHY: Allows user to type search query */}
      {/* HOW: Controlled input with debounced URL updates */}
      <Input
        type="text"
        placeholder={useMarqueePlaceholder ? '' : placeholderText}
        aria-label={useMarqueePlaceholder ? placeholderText : undefined}
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="pl-9 w-full"
      />

      {useMarqueePlaceholder ? (
        <ScrollingPlaceholderOverlay
          text={placeholderText}
          marquee={marquee}
          hasValue={hasValue}
          isFocused={isFocused}
          textClassName={cn('text-muted-foreground', placeholderClassName)}
        />
      ) : null}
    </div>
  )
}
