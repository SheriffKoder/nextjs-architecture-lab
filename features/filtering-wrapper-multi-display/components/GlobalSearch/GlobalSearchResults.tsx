/**
 * GlobalSearchResults Component
 * 
 * Purpose: Displays search results count, status messages, and search information
 * Used in: RowFilters component below the search bar
 * Why: Provides clear feedback about search status and results
 * 
 * Features:
 * - Search results count display
 * - Search status messages
 * - Performance metrics
 * - Optional search suggestions
 * - Consistent styling with existing components
 */

import React from 'react';
import { Search, Clock, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Component props interface
 */
interface GlobalSearchResultsProps {
  // Whether search is currently active
  isSearching: boolean;
  // Whether search has results
  hasResults: boolean;
  // Current search query
  searchQuery: string;
  // Number of matching items
  matchingItems: number;
  // Total number of items
  totalItems: number;
  // Search execution time in milliseconds
  executionTime: number;
  // Whether to show detailed results
  showDetails?: boolean;
  // Custom CSS classes
  className?: string;
  // Error message if search failed
  error?: string | null;
}

/**
 * Global search results display component
 * 
 * @param props - Component props
 * @returns Search results display JSX element
 * 
 * @example
 * ```tsx
 * <GlobalSearchResults
 *   isSearching={false}
 *   hasResults={true}
 *   searchQuery="john"
 *   matchingItems={45}
 *   totalItems={100}
 *   executionTime={15}
 *   showDetails={true}
 * />
 * ```
 */
export const GlobalSearchResults: React.FC<GlobalSearchResultsProps> = ({
  isSearching,
  hasResults,
  searchQuery,
  matchingItems,
  totalItems,
  executionTime,
  showDetails = false,
  className = "",
  error
}) => {
  ////////////////////////////////////
  // Computed Values: Calculate display values
  ////////////////////////////////////
  
  const hasActiveSearch = searchQuery.trim().length > 0;
  const searchPercentage = totalItems > 0 ? Math.round((matchingItems / totalItems) * 100) : 0;
  const isNoResults = hasActiveSearch && !isSearching && matchingItems === 0;
  const hasSearchResults = hasActiveSearch && !isSearching && matchingItems > 0;

  ////////////////////////////////////
  // Render: Results display with appropriate content
  ////////////////////////////////////
  
  if (!hasActiveSearch) {
    return null; // Don't render anything when no search is active
  }

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-md p-3 ${className}`}>
      {/* Search Status Header */}
      <div className="flex items-center gap-2 mb-2">
        {isSearching ? (
          <>
            <Search className="h-4 w-4 text-blue-600 animate-pulse" />
            <span className="text-sm font-medium text-blue-600">Searching...</span>
          </>
        ) : error ? (
          <>
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-red-600">Search Error</span>
          </>
        ) : hasSearchResults ? (
          <>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">Search Complete</span>
          </>
        ) : (
          <>
            <Search className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-600">No Results</span>
          </>
        )}
      </div>

      {/* Search Query Display */}
      <div className="mb-2">
        <span className="text-xs text-gray-500">Searching for: </span>
        <span className="text-sm font-medium text-gray-900">&quot;{searchQuery}&quot;</span>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {isSearching ? 'Searching...' : `${matchingItems} of ${totalItems} rows`}
          </span>
          
          {hasSearchResults && (
            <span className="text-xs text-gray-500">
              ({searchPercentage}% match)
            </span>
          )}
        </div>

        {/* Performance Indicator */}
        {executionTime > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>{executionTime}ms</span>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          <div className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            <span>Error: {error}</span>
          </div>
        </div>
      )}

      {/* No Results Message */}
      {isNoResults && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
          <div className="flex items-center gap-1">
            <Search className="h-3 w-3" />
            <span>No rows match your search criteria. Try different keywords or check spelling.</span>
          </div>
        </div>
      )}

      {/* Detailed Results (Optional) */}
      {showDetails && hasSearchResults && (
        <div className="mt-3 pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <div className="flex items-center justify-between">
              <span>Search completed successfully</span>
              <span>Results sorted by relevance</span>
            </div>
          </div>
        </div>
      )}

      {/* Search Suggestions (Optional) */}
      {isNoResults && showDetails && (
        <div className="mt-3 pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <div className="mb-1">Suggestions:</div>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Check for typos in your search term</li>
              <li>Try using fewer or different keywords</li>
              <li>Use partial matches (e.g., &quot;john&quot; instead of &quot;johnson&quot;)</li>
              <li>Search is case-insensitive</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}; 