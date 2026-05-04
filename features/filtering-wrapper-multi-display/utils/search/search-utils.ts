/**
 * Global Search Utilities
 * 
 * Purpose: Pure functions for performing global searches across table data
 * Used in: useGlobalSearch hook and search components
 * Why: Provides efficient, reusable search algorithms and data processing
 * 
 * Features:
 * - Text normalization and matching
 * - Column filtering and validation
 * - Search result scoring and ranking
 * - Performance optimizations
 */

import { SearchableColumn, SearchResult, SearchStats, SearchResults, SearchConfig } from "../../types/search/search-types";

/**
 * Default search configuration
 */
export const DEFAULT_SEARCH_CONFIG: SearchConfig = {
  caseSensitive: false,
  partialMatch: true,
  debounceDelay: 300,
  maxResults: undefined,
  excludeColumns: [''] // Exclude non-searchable columns by default
};

/**
 * Normalize search term for consistent matching
 * 
 * @param term - Raw search term
 * @param config - Search configuration
 * @returns Normalized search term
 */
export function normalizeSearchTerm(term: string, config: SearchConfig): string {
  let normalized = term.trim();
  
  if (!config.caseSensitive) {
    normalized = normalized.toLowerCase();
  }
  
  return normalized;
}

/**
 * Check if a column should be included in search
 * 
 * @param column - Table column to check
 * @param config - Search configuration
 * @returns Whether column is searchable
 */
export function isSearchableColumn<T>(
  column: SearchableColumn<T>, 
  config: SearchConfig
): boolean {
  // Skip explicitly excluded columns
  if (config.excludeColumns?.includes(column.key)) {
    return false;
  }
  
  // Skip action columns
  if (column.key === 'actions') {
    return false;
  }
  
  // Skip columns marked as non-searchable
  if (column.isSearchable === false) {
    return false;
  }
  
  // Include columns that are explicitly searchable or have searchable data types
  return column.isSearchable === true || 
         column.isSearchable === undefined; // Default to searchable
}

/**
 * Convert any value to a searchable string
 * 
 * @param value - Value to convert
 * @returns Searchable string representation
 */
export function formatSearchValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'string') {
    return value;
  }
  
  if (typeof value === 'number') {
    return value.toString();
  }
  
  if (value instanceof Date) {
    return value.toISOString();
  }
  
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  
  return String(value);
}

/**
 * Check if a value matches the search term
 * 
 * @param value - Value to check
 * @param searchTerm - Normalized search term
 * @param config - Search configuration
 * @returns Whether value matches search term
 */
export function valueMatchesSearch(
  value: any, 
  searchTerm: string, 
  config: SearchConfig
): boolean {
  if (!searchTerm) return true;
  
  const formattedValue = formatSearchValue(value);
  const normalizedValue = config.caseSensitive ? formattedValue : formattedValue.toLowerCase();
  
  if (config.partialMatch) {
    return normalizedValue.includes(searchTerm);
  } else {
    return normalizedValue === searchTerm;
  }
}

/**
 * Calculate search relevance score for an item
 * 
 * @param item - Data item
 * @param searchTerm - Search term
 * @param columns - Searchable columns
 * @param config - Search configuration
 * @returns Relevance score (higher = more relevant)
 */
export function calculateSearchScore<T>(
  item: T,
  searchTerm: string,
  columns: SearchableColumn<T>[],
  config: SearchConfig
): number {
  if (!searchTerm) return 0;
  
  let score = 0;
  const normalizedTerm = normalizeSearchTerm(searchTerm, config);
  
  for (const column of columns) {
    if (!isSearchableColumn(column, config)) continue;
    
    const value = (item as any)[column.key];
    if (value === null || value === undefined) continue;
    
    const formattedValue = formatSearchValue(value);
    const normalizedValue = config.caseSensitive ? formattedValue : formattedValue.toLowerCase();
    
    // Exact match gets highest score
    if (normalizedValue === normalizedTerm) {
      score += 100;
      continue;
    }
    
    // Starts with search term gets high score
    if (normalizedValue.startsWith(normalizedTerm)) {
      score += 50;
      continue;
    }
    
    // Contains search term gets medium score
    if (normalizedValue.includes(normalizedTerm)) {
      score += 25;
      continue;
    }
    
    // Partial word match gets lower score
    const words = normalizedValue.split(/\s+/);
    for (const word of words) {
      if (word.startsWith(normalizedTerm)) {
        score += 15;
        break;
      }
      if (word.includes(normalizedTerm)) {
        score += 10;
        break;
      }
    }
    
    // Apply column priority if specified
    if (column.searchPriority) {
      score *= column.searchPriority;
    }
  }
  
  return score;
}

/**
 * Perform global search across table data
 * 
 * @param data - Complete dataset
 * @param searchTerm - Search query
 * @param columns - Table columns
 * @param config - Search configuration
 * @returns Search results with statistics
 */
export function performGlobalSearch<T>(
  data: T[],
  searchTerm: string,
  columns: SearchableColumn<T>[],
  config: SearchConfig = DEFAULT_SEARCH_CONFIG
): SearchResults<T> {
  const startTime = performance.now();
  
  if (!searchTerm.trim()) {
    const stats: SearchStats = {
      totalItems: data.length,
      matchingItems: data.length,
      executionTime: performance.now() - startTime,
      isActive: false
    };
    
    return {
      results: data.map(item => ({
        item,
        matchedColumns: [],
        score: 0
      })),
      stats,
      query: '',
      timestamp: Date.now()
    };
  }
  
  const normalizedTerm = normalizeSearchTerm(searchTerm, config);
  const searchableColumns = columns.filter(col => isSearchableColumn(col, config));
  
  const results: SearchResult<T>[] = [];
  
  for (const item of data) {
    const matchedColumns: string[] = [];
    let hasMatch = false;
    
    for (const column of searchableColumns) {
      const value = (item as any)[column.key];
      
      if (valueMatchesSearch(value, normalizedTerm, config)) {
        matchedColumns.push(column.key);
        hasMatch = true;
      }
    }
    
    if (hasMatch) {
      const score = calculateSearchScore(item, normalizedTerm, searchableColumns, config);
      results.push({
        item,
        matchedColumns,
        score
      });
    }
  }
  
  // Sort by relevance score (highest first)
  results.sort((a, b) => (b.score || 0) - (a.score || 0));
  
  // Apply max results limit if specified
  const limitedResults = config.maxResults ? results.slice(0, config.maxResults) : results;
  
  const executionTime = performance.now() - startTime;
  
  const stats: SearchStats = {
    totalItems: data.length,
    matchingItems: limitedResults.length,
    executionTime,
    isActive: true
  };
  
  return {
    results: limitedResults,
    stats,
    query: searchTerm,
    timestamp: Date.now()
  };
}

/**
 * Debounce function for search input
 * 
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
} 