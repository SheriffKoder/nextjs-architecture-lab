/**
 * Expandable Search Control Component
 * 
 * Purpose: Provides expandable search bar that shows icon only, expands on hover/focus
 * Used in: FilteringWrapper beside minimal controls
 * Why: Clean, minimal search bar that expands when needed
 */

"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useGlobalSearch } from '../../hooks/search/index';
import { TableColumn } from '../../types';
import { SearchableColumn } from '../../types/search';

/**
 * Props for ExpandableSearchControl component
 */
export interface ExpandableSearchControlProps<T = any> {
  // Original data for search
  data: T[];
  // Column definitions for searchable columns
  columns: TableColumn<T>[];
  // Placeholder text for search input
  searchPlaceholder?: string;
  // Callback when search results change
  onSearchResults?: (results: T[]) => void;
  // Callback when search text changes
  onSearchTextChange?: (searchText: string) => void;
  // Optional className
  className?: string;
  // Full width when expanded (default: 300px)
  expandedWidth?: string;
}

/**
 * Expandable Search Control Component
 * Shows icon only, expands to reveal input on hover/focus
 */
export function ExpandableSearchControl<T = any>({
  data,
  columns,
  searchPlaceholder = "Search...",
  onSearchResults,
  onSearchTextChange,
  className = '',
  expandedWidth = '300px',
}: ExpandableSearchControlProps<T>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Global search functionality
  const {
    searchState,
    actions: searchActions,
    stats: searchStats
  } = useGlobalSearch(data, columns as SearchableColumn<any>[], {
    callbacks: {
      onSearchResults: (results: any) => {
        // Pass search results to parent component
        if (onSearchResults && results.stats.isActive) {
          const searchResultItems = results.results.map((r: any) => r.item);
          onSearchResults(searchResultItems);
        }
      },
      onSearchStart: (query: string) => {
        // Notify parent about search text change
        if (onSearchTextChange) {
          onSearchTextChange(query);
        }
      },
      onSearchClear: () => {
        // Clear global search by passing original data back
        if (onSearchResults) {
          onSearchResults(data);
        }
        // Also notify parent about text change
        if (onSearchTextChange) {
          onSearchTextChange('');
        }
      }
    }
  });

  // Handle expand on hover
  const handleMouseEnter = () => {
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    // Only collapse if not focused and no search text
    if (!isFocused && !searchState.searchTerm) {
      setIsExpanded(false);
    }
  };

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
    setIsExpanded(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Only collapse if no search text
    if (!searchState.searchTerm) {
      setIsExpanded(false);
    }
  };

  // Keep expanded if there's search text
  useEffect(() => {
    if (searchState.searchTerm) {
      setIsExpanded(true);
    }
  }, [searchState.searchTerm]);

  // Handle clear button click
  const handleClearClick = () => {
    searchActions.clearSearch();
    // Focus the input after clearing
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle input keydown events
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Clear search on Escape key
    if (event.key === 'Escape' && searchState.searchTerm) {
      searchActions.clearSearch();
      event.preventDefault();
    }
  };

  const hasSearchResults = searchStats.hasResults;
  const isSearching = searchStats.isSearching;

  return (
    <div 
      ref={containerRef}
      className={`relative transition-all duration-300 ease-in-out overflow-hidden ${className}`}
      style={{
        width: isExpanded ? expandedWidth : '40px',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative w-full">
        {/* Search Icon - Always visible, clickable when collapsed */}
        <div 
          className={`absolute inset-y-0 left-0 pl-3 flex items-center z-10 ${
            !isExpanded ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'
          }`}
          onClick={() => !isExpanded && inputRef.current?.focus()}
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin text-foreground/80" />
          ) : (
            <Search className="h-4 w-4 text-foreground/80" />
          )}
        </div>

        {/* Search Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={searchState.searchTerm}
          onChange={(e) => searchActions.setSearchTerm(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={isExpanded ? searchPlaceholder : ''}
          className={`
            block w-full pl-10 pr-10 py-2 border border-border rounded-lg shadow-sm
            placeholder:text-foreground text-sm
            outline-none 
            transition-all duration-300 ease-in-out
            bg-background text-foreground
            hover:bg-background hover:text-foreground
            focus:bg-background focus:text-foreground
            ${!isExpanded ? 'opacity-0 cursor-pointer' : 'opacity-100'}
          `}
          aria-label="Search table data"
        />

        {/* Clear Button - Only show when expanded and has text */}
        {isExpanded && searchState.searchTerm && (
          <button
            onClick={handleClearClick}
            className="
              absolute inset-y-0 right-0 pr-3 flex items-center
              transition-colors duration-200
              text-muted-foreground hover:text-foreground
              focus:outline-none
            "
            aria-label="Clear search"
            title="Clear search (Esc)"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
