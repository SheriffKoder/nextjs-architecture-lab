/**
 * Filter Configuration Types
 * 
 * Purpose: Type definitions for filter configuration object
 * Used in: VirtualizedTable component
 * Why: Provides type safety for filter configuration props
 */

import { TableColumn } from '../features/virtualized-table/types/table-column';

/**
 * Configuration object for VirtualizedTable filtering and search
 * Contains all filter-related configuration options
 */
export interface FilterConfig<T = any> {
  // Sorting configuration
  initialSortKey?: string;
  initialSortDirection?: "ascending" | "descending";
  
  // Filter dropdown configuration
  autoApplyDropdown?: boolean;
  showBadgesDropdown?: boolean;
  rangeOpen?: boolean;
  
  // Search configuration
  searchPlaceholder?: string;
  searchHighlightStyle?: string;
  hideTopLevelFilterSorting?: boolean;
  hideTopLevelFiltering?: boolean;
  hideTopLevelSearch?: boolean;
  
  // Header configuration
  headerColumns?: TableColumn<T>[];
  
  // Filter controls configuration
  showPill?: boolean;
  showIndependentDateFilter?: boolean;
  showDateFilterHeader?: boolean;
  
  // Side filter button (optional)
  sideFilterButton?: {
    field: string;
    label?: string;
  };
  
  // Pagination configuration
  initialPaginationMode?: boolean;
  itemsPerPage?: number;
  hidePaginationSwitch?: boolean;
}
