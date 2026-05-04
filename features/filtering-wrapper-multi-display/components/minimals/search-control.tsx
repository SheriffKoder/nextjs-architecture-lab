/**
 * Search Control Component
 * 
 * Purpose: Provides UI for global search functionality
 * Used in: FilteringWrapper beside minimal controls
 * Why: Clean, minimal search bar component
 */

"use client";

import React from 'react';
import { GlobalSearchBar } from '../GlobalSearch/GlobalSearchBar';
import { useGlobalSearch } from '../../hooks/search/index';
import { TableColumn } from '../../types';
import { SearchableColumn } from '../../types/search';

/**
 * Props for SearchControl component
 */
export interface SearchControlProps<T = any> {
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
}

/**
 * Search Control Component
 * Provides global search functionality with results callback
 */
export function SearchControl<T = any>({
  data,
  columns,
  searchPlaceholder = "Search...",
  onSearchResults,
  onSearchTextChange,
  className = '',
}: SearchControlProps<T>) {
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

  return (
    <div className={className}>
      <GlobalSearchBar
        searchTerm={searchState.searchTerm}
        isSearching={searchStats.isSearching}
        hasSearchResults={searchStats.hasResults}
        onSearchTermChange={searchActions.setSearchTerm}
        onClearSearch={searchActions.clearSearch}
        placeholder={searchPlaceholder}
        resultsCount={searchStats.matchingItems}
        totalItems={searchStats.totalItems}
        className="w-[300px]"
      />
    </div>
  );
}
