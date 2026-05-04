/**
 * GlobalSearchBar Component
 * 
 * Purpose: Main search input component for global table search
 * Used in: RowFilters component above the date picker
 * Why: Provides intuitive search interface with real-time feedback and consistent styling
 * 
 * Features:
 * - Search input with search icon
 * - Clear button when search is active
 * - Loading state indicator
 * - Debounced input handling
 * - Consistent styling with existing filters
 * - Accessibility features
 */

import React, { forwardRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

/**
 * Component props interface
 */
interface GlobalSearchBarProps {
  // Current search term
  searchTerm: string;
  // Whether search is currently executing
  isSearching: boolean;
  // Whether search has results or is active
  hasSearchResults: boolean;
  // Callback when search term changes
  onSearchTermChange: (term: string) => void;
  // Callback when search is cleared
  onClearSearch: () => void;
  // Placeholder text for search input
  placeholder?: string;
  // Custom CSS classes
  className?: string;
  // Whether search input is disabled
  disabled?: boolean;
  // Search results count for display
  resultsCount?: number;
  // Total items count for display
  totalItems?: number;
}

/**
 * Global search bar component with search icon, input field, and clear button
 * 
 * @param props - Component props
 * @param ref - Forwarded ref for input focus
 * @returns Search bar JSX element
 * 
 * @example
 * ```tsx
 * <GlobalSearchBar
 *   searchTerm={searchTerm}
 *   isSearching={isSearching}
 *   hasSearchResults={hasResults}
 *   onSearchTermChange={setSearchTerm}
 *   onClearSearch={clearSearch}
 *   placeholder="Search across all columns..."
 *   resultsCount={45}
 *   totalItems={100}
 * />
 * ```
 */
export const GlobalSearchBar = forwardRef<HTMLInputElement, GlobalSearchBarProps>(({
  searchTerm,
  isSearching,
  hasSearchResults,
  onSearchTermChange,
  onClearSearch,
  placeholder = "Search across all columns...",
  className = "",
  disabled = false,
  resultsCount,
  totalItems
}, ref) => {
  ////////////////////////////////////
  // Event Handlers: Handle user interactions
  ////////////////////////////////////
  
  /**
   * Handle search input change
   */
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchTermChange(event.target.value);
  };

  /**
   * Handle clear button click
   */
  const handleClearClick = () => {
    onClearSearch();
    // Focus the input after clearing
    if (ref && typeof ref === 'object' && ref.current) {
      ref.current.focus();
    }
  };

  /**
   * Handle input keydown events
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Clear search on Escape key
    if (event.key === 'Escape' && searchTerm) {
      onClearSearch();
      event.preventDefault();
    }
  };

  ////////////////////////////////////
  // Render: Search bar with all features
  ////////////////////////////////////
  
  return (
    <div className={`relative ${className}`}>
      {/* Search Input Container */}
      <div className="relative z-[1]">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-[1]">
          {isSearching ? (
            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
          ) : 
          !searchTerm && (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        {/* Search Input Field */}
        <input
          ref={ref}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            block w-full pl-10 pr-10 py-2
            bg-tertiary/10 backdrop-blur-sm text-foreground
            placeholder:text-muted-foreground text-sm
            border-0 focus:outline-none rounded-r-md
            disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed
          `}
          aria-label="Search table data"
          aria-describedby={resultsCount !== undefined ? "search-results-count" : undefined}
        />

        {/* Clear Button */}
        {searchTerm && (
          <button
            onClick={handleClearClick}
            className={`cursor-pointer
              absolute inset-y-0 left-3 pr-3 flex items-center
              text-muted-foreground hover:text-foreground focus:outline-none focus:text-foreground
              transition-colors duration-200
            `}
            aria-label="Clear search"
            title="Clear search (Esc)"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Count */}
      {/* {resultsCount !== undefined && totalItems !== undefined && (
        <div 
          id="search-results-count"
          className="mt-1 text-xs text-gray-500 flex items-center justify-between"
        >
          <span>
            {hasSearchResults 
              ? `Showing ${resultsCount} of ${totalItems} rows`
              : `${totalItems} total rows`
            }
          </span>
          
          {isSearching && (
            <span className="flex items-center gap-1 text-blue-600">
              <Loader2 className="h-3 w-3 animate-spin" />
              Searching...
            </span>
          )}
        </div>
      )} */}

      {/* Search Status Indicator */}
      {/* {hasSearchResults && !isSearching && (
        <div className="mt-1 text-xs text-blue-600">
          ✓ Search active
        </div>
      )} */}
    </div>
  );
});

// Set display name for debugging
GlobalSearchBar.displayName = 'GlobalSearchBar'; 