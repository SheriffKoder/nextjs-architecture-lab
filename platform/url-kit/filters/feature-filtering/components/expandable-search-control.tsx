/**
 * Expandable Search Control Component
 * 
 * Purpose: Provides expandable search bar that shows icon only, expands on hover/focus
 * Used in: FilteringWrapper minimal controls, or anywhere a compact search is needed
 * Why: Clean, minimal search bar that expands when needed, integrates with URL-based search
 * 
 * Function Index:
 * - ExpandableSearchControl: Component that renders expandable search input with URL state
 *   Example input: <ExpandableSearchControl config={searchConfig} />
 *   Example output: Icon-only search that expands to reveal input, updates URL 'q' parameter
 * 
 * Steps:
 * 1. Get current search query from URL using useUrlFilters
 * 2. Render icon-only when collapsed, full input when expanded
 * 3. Expand on hover/focus, collapse when empty and blurred
 * 4. Debounce URL updates to avoid excessive navigation
 * 5. Sync local state with URL changes
 */

'use client'

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"
import { useUrlFilters } from "../hooks/useUrlFilters"
import { useSearchParams } from "next/navigation"
import { cn } from "@/shared/lib/utils"
import type { SearchConfig } from "./search-types"

//////////////////////////////////
// Component Props
//////////////////////////////////

export interface ExpandableSearchControlProps<T extends Record<string, any>> {
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
   * Full width when expanded (default: 300px)
   * WHY: Allows customization of expanded width
   * HOW: CSS width value applied when expanded
   */
  expandedWidth?: string
  
  /**
   * Additional CSS classes
   * WHY: Allows custom styling
   * HOW: Merged with default classes
   */
  className?: string
}

/**
 * Expandable Search Control Component
 * Shows icon only, expands to reveal input on hover/focus
 * WHY: Provides compact search UI that doesn't take space until needed
 * HOW: Uses URL-based search via useUrlFilters, debounces updates, manages expand/collapse state
 */
export function ExpandableSearchControl<T extends Record<string, any>>({ 
  config, 
  debounceMs = 300,
  expandedWidth = '300px',
  className,
}: ExpandableSearchControlProps<T>) {
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
  
  // Expand/collapse state
  // WHY: Control when search bar is expanded or collapsed
  // HOW: Expanded on hover/focus, collapsed when empty and blurred
  const [isExpanded, setIsExpanded] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  
  // Refs for input and container
  // WHY: Need to focus input and measure container
  // HOW: React refs provide DOM access
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
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
  
  // Keep expanded if there's search text
  // WHY: Don't collapse when user has entered text
  // HOW: Check URL value and expand if non-empty
  useEffect(() => {
    if (urlSearchValue) {
      setIsExpanded(true)
    }
  }, [urlSearchValue])
  
  // Handle expand on hover
  // WHY: Show input when user hovers over icon
  // HOW: Set expanded state to true
  const handleMouseEnter = () => {
    setIsExpanded(true)
  }
  
  // Handle collapse on mouse leave
  // WHY: Hide input when user moves mouse away (if not focused and no text)
  // HOW: Only collapse if not focused and no search text
  const handleMouseLeave = () => {
    if (!isFocused && !urlSearchValue) {
      setIsExpanded(false)
    }
  }
  
  // Handle focus
  // WHY: Keep expanded when user focuses input
  // HOW: Set focused and expanded states
  const handleFocus = () => {
    setIsFocused(true)
    setIsExpanded(true)
  }
  
  // Handle blur
  // WHY: Collapse when user leaves input (if no text)
  // HOW: Remove focus state, collapse if no search text
  const handleBlur = () => {
    setIsFocused(false)
    // Only collapse if no search text
    if (!urlSearchValue) {
      setIsExpanded(false)
    }
  }
  
  // Handle clear button click
  // WHY: Allow user to quickly clear search
  // HOW: Clear search via setSearch, then focus input
  const handleClearClick = () => {
    setSearch('')
    // Focus the input after clearing
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }
  
  // Handle input keydown events
  // WHY: Provide keyboard shortcuts for better UX
  // HOW: Clear search on Escape key
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Clear search on Escape key
    if (event.key === 'Escape' && localValue) {
      setSearch('')
      event.preventDefault()
    }
  }
  
  // Handle input change
  // WHY: Update local state immediately for responsive UI
  // HOW: Update state, URL update is handled by debounced effect
  const handleChange = (value: string) => {
    setLocalValue(value)
  }
  
  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative transition-all duration-300 ease-in-out overflow-hidden",
        className
      )}
      style={{
        width: isExpanded ? expandedWidth : '40px',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative w-full">
        {/* Search Icon - Always visible, clickable when collapsed */}
        <div 
          className={cn(
            "absolute inset-y-0 left-0 pl-3 flex items-center z-10",
            !isExpanded ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'
          )}
          onClick={() => !isExpanded && inputRef.current?.focus()}
        >
          <Search className="h-4 w-4 text-foreground/80" />
        </div>

        {/* Search Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={isExpanded ? (config.placeholder || "Search...") : ''}
          className={cn(
            "block w-full pl-10 pr-10 py-2 border border-border rounded-lg shadow-sm",
            "placeholder:text-muted-foreground text-sm",
            "outline-none transition-all duration-300 ease-in-out",
            "bg-background text-foreground",
            "hover:bg-background hover:text-foreground",
            "focus:bg-background focus:text-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2",
            !isExpanded ? 'opacity-0 cursor-pointer' : 'opacity-100'
          )}
          aria-label="Search"
        />

        {/* Clear Button - Only show when expanded and has text */}
        {isExpanded && localValue && (
          <button
            onClick={handleClearClick}
            className={cn(
              "absolute inset-y-0 right-0 pr-3 flex items-center",
              "transition-colors duration-200",
              "text-muted-foreground hover:text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
            )}
            aria-label="Clear search"
            title="Clear search (Esc)"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
