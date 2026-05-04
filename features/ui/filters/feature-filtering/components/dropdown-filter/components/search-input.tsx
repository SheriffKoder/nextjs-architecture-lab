/**
 * Search Input Component
 * 
 * Purpose: Search input for filtering options list
 * Used in: DropdownFilter component
 * Why: Allows users to search/filter the options list
 */

'use client'

import * as React from "react"
import { useEffect, useRef } from "react"

//////////////////////////////////
// Type Definitions
//////////////////////////////////

interface SearchInputProps {
  /**
   * Current search term
   * WHY: Controlled input value
   * HOW: Bound to input value
   */
  searchTerm: string
  
  /**
   * Callback when search term changes
   * WHY: Update search term in parent
   * HOW: Called with new search value
   */
  onSearchChange: (value: string) => void
  
  /**
   * Optional ref for input element
   * WHY: Allow parent to focus input
   * HOW: Passed to input ref
   */
  inputRef?: React.RefObject<HTMLInputElement> | React.RefObject<HTMLInputElement | null>
  
  /**
   * Placeholder text
   * WHY: Guide user on what to search
   * HOW: Displayed when input is empty
   */
  placeholder?: string
}

//////////////////////////////////
// Component Implementation
//////////////////////////////////

/**
 * SearchInput component - search input with focus effect
 * WHY: Provides search functionality with exact styling from StandardFilterDropdown
 * HOW: Renders input with border-bottom focus effect
 * @param {SearchInputProps} props - Component props
 * @returns {React.ReactElement} Search input
 */
export function SearchInput({
  searchTerm,
  onSearchChange,
  inputRef,
  placeholder = "Search..."
}: SearchInputProps) {
  // Create internal ref if not provided
  const internalRef = useRef<HTMLInputElement>(null)
  const ref = inputRef || internalRef
  
  
  return (
    <div className="p-3 border-b border-border dark:border-border/50">
      <input
        ref={ref}
        type="text"
        placeholder={placeholder}
        className="w-full p-2 bg-transparent text-foreground border-b border-border dark:border-border/50 text-sm focus:outline-none focus:border-b-tertiary dark:focus:border-b-tertiary/50 transition-colors duration-200 placeholder:text-muted-foreground"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  )
}
