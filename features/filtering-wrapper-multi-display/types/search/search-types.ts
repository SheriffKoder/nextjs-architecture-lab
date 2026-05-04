/**
 * Global Search Types
 * 
 * Purpose: TypeScript interfaces for the global search system
 * Used in: GlobalSearch components and hooks
 * Why: Provides type safety and clear contracts for search functionality
 */

import { TableColumn } from "../../features/virtualized-table/types/table-column";

/**
 * Configuration for global search behavior
 */
export interface SearchConfig {
  // Whether search is case-sensitive
  caseSensitive: boolean;
  // Whether to search partial matches
  partialMatch: boolean;
  // Debounce delay in milliseconds
  debounceDelay: number;
  // Maximum search results to return
  maxResults?: number;
  // Columns to exclude from search
  excludeColumns?: string[];
}

/**
 * Search results statistics
 */
export interface SearchStats {
  // Total number of items in dataset
  totalItems: number;
  // Number of items matching search
  matchingItems: number;
  // Search execution time in milliseconds
  executionTime: number;
  // Whether search is currently active
  isActive: boolean;
}

/**
 * Individual search result item
 */
export interface SearchResult<T = any> {
  // The original data item
  item: T;
  // Relevance score (optional)
  score?: number;
  // Which columns matched the search
  matchedColumns: string[];
  // Highlighted text snippets (optional)
  snippets?: Record<string, string>;
}

/**
 * Complete search results
 */
export interface SearchResults<T = any> {
  // Array of matching items
  results: SearchResult<T>[];
  // Search statistics
  stats: SearchStats;
  // Search query that produced these results
  query: string;
  // Timestamp of when search was performed
  timestamp: number;
}

/**
 * Search state for components
 */
export interface SearchState {
  // Current search term
  searchTerm: string;
  // Whether search is currently executing
  isSearching: boolean;
  // Last search results
  lastResults: SearchResults | null;
  // Search configuration
  config: SearchConfig;
  // Error message if search failed
  error: string | null;
}

/**
 * Searchable column information
 */
export interface SearchableColumn<T = any> extends TableColumn<T> {
  // Whether this column should be included in search
  isSearchable: boolean;
  // Custom search function for this column (optional)
  customSearchFn?: (value: any, searchTerm: string) => boolean;
  // Search priority (higher = more important)
  searchPriority?: number;
}

/**
 * Search callback functions
 */
export interface SearchCallbacks<T = any> {
  // Called when search results change
  onSearchResults: (results: SearchResults<T>) => void;
  // Called when search starts
  onSearchStart?: (query: string) => void;
  // Called when search completes
  onSearchComplete?: (results: SearchResults<T>) => void;
  // Called when search is cleared
  onSearchClear?: () => void;
  // Called when search encounters an error
  onSearchError?: (error: string) => void;
} 