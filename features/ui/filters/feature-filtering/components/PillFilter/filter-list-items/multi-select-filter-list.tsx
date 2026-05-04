/**
 * Multi Select Filter List Component
 * 
 * Purpose: Displays multi-select filter options as an always-visible list
 * Used in: PillFilter filter options panel
 * Why: Provides cleaner interface without dropdowns
 * 
 * Features:
 * - Always-visible list with checkboxes
 * - Count badges for each option
 * - Click to toggle selection
 * - Clear button
 */

'use client'

import * as React from "react"
import { Check, X } from "lucide-react"
import { useUrlFilters } from "../../../hooks/useUrlFilters"
import { FilterConfig } from "../../filter-types"
import { cn } from "@/lib/utils"

//////////////////////////////////
// Component Props
//////////////////////////////////

interface MultiSelectFilterListProps {
  /**
   * Filter configuration
   * WHY: Provides filter key, label, and options
   * HOW: Used to get filter key for URL params and options for list
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
 * MultiSelectFilterList component - always-visible list for multi-select
 * WHY: Provides list-based multi-select filtering without dropdowns
 * HOW: Renders checkboxes in a scrollable list, uses useUrlFilters for URL state
 * @param {MultiSelectFilterListProps} props - Component props
 * @returns {React.ReactElement} List with checkbox items
 */
export function MultiSelectFilterList({ filter, showInitialCount = false }: MultiSelectFilterListProps) {
  // Get filter functions from useUrlFilters hook
  // WHY: Provides getList and toggleListValue functions for URL state management
  // HOW: Hook reads from URL searchParams and updates via router.replace
  const { getList, toggleListValue, remove } = useUrlFilters()
  
  // Get currently selected values from URL
  // WHY: Need to know which options are selected to show checkmarks
  // HOW: getList splits comma-separated URL param into array
  const selected = getList(filter.key)
  
  // Check if filter has active values
  // WHY: Need to show clear button when filters are active
  // HOW: Check if selected array has items
  const hasActiveFilters = selected.length > 0
  
  // Handle clear filters
  // WHY: Allow user to clear all selections
  // HOW: Remove filter key from URL
  const handleClear = () => {
    remove(filter.key)
  }
  
  return (
    <div className="w-full">
      {/* Header with clear button */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-muted text-muted-foreground"
              title="Clear filters"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      
      {/* Options list */}
      <div className="max-h-64 overflow-y-auto">
        {filter.options && filter.options.length > 0 ? (
          <div className="space-y-1">
            {filter.options.map((option) => {
              const isSelected = selected.includes(option.value)
              const isDisabled = (option.count ?? 0) === 0
              
              return (
                <div
                  key={option.value}
                  className={cn(
                    "flex items-center py-1 px-2 rounded-l-md",
                    isDisabled
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer",
                    isSelected
                      ? "bg-gradient-to-r from-tertiary/20 to-transparent"
                      : !isDisabled && "hover:bg-gradient-to-r from-tertiary/10 to-transparent"
                  )}
                  onClick={() => !isDisabled && toggleListValue(filter.key, option.value)}
                >
                  {/* Checkbox */}
                  <div
                    className={cn(
                      "w-4 h-4 border rounded mr-3 flex items-center justify-center",
                      isSelected
                        ? "bg-tertiary/80 dark:bg-tertiary/20 border-tertiary/30 dark:border-tertiary"
                        : isDisabled
                        ? "border-muted-foreground/30 bg-muted"
                        : "border-border"
                    )}
                  >
                    {isSelected && (
                      <Check size={12} className="text-tertiary-foreground" />
                    )}
                  </div>
                  
                  {/* Option label */}
                  <span
                    className={cn(
                      "truncate flex-grow text-left text-xs",
                      isSelected
                        ? "font-medium text-tertiary"
                        : isDisabled
                        ? "text-muted-foreground"
                        : "text-foreground"
                    )}
                  >
                    {option.label}
                  </span>
                  
                  {/* Count badge */}
                  {option.count !== undefined && (
                    <div className="ml-2">
                      <span
                        className={cn(
                          "text-xs px-3 py-1 rounded-full",
                          isDisabled
                            ? "bg-muted text-muted-foreground"
                            : isSelected
                            ? "bg-tertiary text-tertiary-foreground"
                            : "bg-green-500/10 text-green-500 border border-green-500/20"
                        )}
                      >
                        {showInitialCount && option.initialCount !== undefined
                          ? `${option.count} / ${option.initialCount}`
                          : option.count}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground text-xs">
            No options available
          </div>
        )}
      </div>
    </div>
  )
}
