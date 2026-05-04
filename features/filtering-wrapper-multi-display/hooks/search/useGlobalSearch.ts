/**
 * useGlobalSearch Hook
 * 
 * Purpose: Manages global search state and execution for table data
 * Used in: GlobalSearch components to handle search logic
 * Why: Provides centralized search state management with performance optimizations
 * 
 * Features:
 * - Debounced search input
 * - Search state management
 * - Performance optimizations with useMemo
 * - Error handling
 * - Search statistics
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { 
  SearchState, 
  SearchResults, 
  SearchConfig, 
  SearchCallbacks,
  SearchableColumn 
} from '../../types/search/search-types';
import { 
  performGlobalSearch, 
  debounce, 
  DEFAULT_SEARCH_CONFIG 
} from '../../utils/search/search-utils';

/**
 * Hook configuration options
 */
export interface UseGlobalSearchOptions<T = any> {
  // Initial search configuration
  initialConfig?: Partial<SearchConfig>;
  // Initial search term
  initialSearchTerm?: string;
  // Whether to perform initial search
  performInitialSearch?: boolean;
  // Custom search callbacks
  callbacks?: Partial<SearchCallbacks<T>>;
}

/**
 * Return type for the useGlobalSearch hook
 */
export interface UseGlobalSearchReturn<T = any> {
  // Search state
  searchState: SearchState;
  // Current search results
  searchResults: SearchResults<T> | null;
  // Search actions
  actions: {
    // Set search term and trigger search
    setSearchTerm: (term: string) => void;
    // Clear search and results
    clearSearch: () => void;
    // Update search configuration
    updateConfig: (config: Partial<SearchConfig>) => void;
    // Perform manual search
    performSearch: (term?: string) => void;
  };
  // Search statistics
  stats: {
    // Whether search is currently active
    isSearching: boolean;
    // Total items in dataset
    totalItems: number;
    // Matching items count
    matchingItems: number;
    // Search execution time
    executionTime: number;
    // Whether search has results
    hasResults: boolean;
  };
}

/**
 * Custom hook for global search functionality
 * 
 * @param data - Complete dataset to search
 * @param columns - Table columns configuration
 * @param options - Hook configuration options
 * @returns Search state, results, and actions
 */
export function useGlobalSearch<T = any>(
  data: T[],
  columns: SearchableColumn<T>[],
  options: UseGlobalSearchOptions<T> = {}
): UseGlobalSearchReturn<T> {
  const {
    initialConfig = {},
    initialSearchTerm = '',
    performInitialSearch = false,
    callbacks = {}
  } = options;

  // Merge default config with initial config
  const initialSearchConfig: SearchConfig = {
    ...DEFAULT_SEARCH_CONFIG,
    ...initialConfig
  };

  // Initialize search state
  const [searchState, setSearchState] = useState<SearchState>({
    searchTerm: initialSearchTerm,
    isSearching: false,
    lastResults: null,
    config: initialSearchConfig,
    error: null
  });

  // Store search results
  const [searchResults, setSearchResults] = useState<SearchResults<T> | null>(null);

  // Store the latest callbacks to prevent stale closures
  const callbacksRef = useRef(callbacks);
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  // Memoized searchable columns to prevent unnecessary recalculations
  const searchableColumns = useMemo(() => {
    return columns.filter(col => col.isSearchable !== false);
  }, [columns]);

  // Debounced search function
  const debouncedSearch = useMemo(
    () => debounce((term: string) => {
      if (!term.trim()) {
        // Clear search results
        setSearchResults(null);
        setSearchState(prev => ({
          ...prev,
          isSearching: false,
          error: null
        }));
        
        // Call clear callback
        if (callbacksRef.current.onSearchClear) {
          callbacksRef.current.onSearchClear();
        }
        return;
      }

      try {
        setSearchState(prev => ({ ...prev, isSearching: true, error: null }));
        
        // Call search start callback
        if (callbacksRef.current.onSearchStart) {
          callbacksRef.current.onSearchStart(term);
        }

        // Perform search
        const results = performGlobalSearch(data, term, searchableColumns, searchState.config);
        
        setSearchResults(results);
        setSearchState(prev => ({
          ...prev,
          isSearching: false,
          lastResults: results,
          error: null
        }));

        // Call search complete callback
        if (callbacksRef.current.onSearchComplete) {
          callbacksRef.current.onSearchComplete(results);
        }

        // Call results callback
        if (callbacksRef.current.onSearchResults) {
          callbacksRef.current.onSearchResults(results);
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Search failed';
        
        setSearchState(prev => ({
          ...prev,
          isSearching: false,
          error: errorMessage
        }));

        // Call error callback
        if (callbacksRef.current.onSearchError) {
          callbacksRef.current.onSearchError(errorMessage);
        }
      }
    }, searchState.config.debounceDelay),
    [data, searchableColumns, searchState.config.debounceDelay]
  );

  // Set search term and trigger search
  const setSearchTerm = useCallback((term: string) => {
    setSearchState(prev => ({ ...prev, searchTerm: term }));
    
    if (term.trim()) {
      debouncedSearch(term);
    } else {
      // Clear immediately if term is empty
      debouncedSearch('');
    }
  }, [debouncedSearch]);

  // Clear search and results
  const clearSearch = useCallback(() => {
    setSearchState(prev => ({
      ...prev,
      searchTerm: '',
      isSearching: false,
      error: null
    }));
    setSearchResults(null);
    
    // Call clear callback
    if (callbacksRef.current.onSearchClear) {
      callbacksRef.current.onSearchClear();
    }
  }, []);

  // Update search configuration
  const updateConfig = useCallback((newConfig: Partial<SearchConfig>) => {
    setSearchState(prev => ({
      ...prev,
      config: { ...prev.config, ...newConfig }
    }));
  }, []);

  // Perform manual search
  const performSearch = useCallback((term?: string) => {
    const searchTerm = term ?? searchState.searchTerm;
    if (searchTerm.trim()) {
      debouncedSearch(searchTerm);
    }
  }, [searchState.searchTerm, debouncedSearch]);

  // Perform initial search if requested
  useEffect(() => {
    if (performInitialSearch && initialSearchTerm.trim()) {
      performSearch(initialSearchTerm);
    }
  }, [performInitialSearch, initialSearchTerm, performSearch]);

  // Memoized statistics
  const stats = useMemo(() => ({
    isSearching: searchState.isSearching,
    totalItems: data.length,
    matchingItems: searchResults?.stats.matchingItems ?? data.length,
    executionTime: searchResults?.stats.executionTime ?? 0,
    hasResults: searchResults !== null && searchResults.stats.matchingItems > 0
  }), [data.length, searchResults, searchState.isSearching]);

  return {
    searchState,
    searchResults,
    actions: {
      setSearchTerm,
      clearSearch,
      updateConfig,
      performSearch
    },
    stats
  };
} 