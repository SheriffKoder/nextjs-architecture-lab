/**
 * Table Configuration Types
 * 
 * Purpose: Type definitions for table configuration object
 * Used in: VirtualizedTable component
 * Why: Provides type safety for table configuration props
 */


import type { ReactNode } from 'react'
import { RowExpansionConfig } from '../components/row-expand/types';
import type { HeaderFilterConfig } from '../../../types';
import type { SortConfig } from '@/features/url-kit/filters/feature-sorting/types';

/**
 * Configuration object for VirtualizedTable component
 * Contains all table-related configuration options
 */
export interface TableConfig<T = any> {
  // Row height configuration
  rowHeight?: number;
  minRowHeight?: number;
  
  // Display configuration
  dynamicRowHeight?: boolean;
  tableHeight?: number;
  emptyMessage?: string;
  
  // Loading configuration
  loading?: boolean;
  loadingStateShimmer?: boolean;
  
  // Row expansion configuration
  rowExpansion?: RowExpansionConfig;
  
  // Action configuration
  actionMode?: 'inline' | 'dropdown';
  
  // Selection and editing
  editableColumns?: string[];
  
  // Styling configuration
  groupStylerConfig?: { [groupId: string]: (rowData: T, isFirstColumn: boolean, isLastColumn: boolean) => string };
  rowStyler?: (rowData: T) => string;
  /** Full-row layer behind cell content (`absolute inset-0` in row component). */
  rowHighlighting?: (rowData: T) => ReactNode;
  
  // Header configuration
  transparentHeader?: boolean; // When true, header is transparent until scrolled
  
  // Grouping configuration
  groupBy?: string; // Primary group key (e.g., "category")
  subGroupBy?: string; // Secondary group key for nested grouping (e.g., "status")
  groupKeyFormatter?: (value: any) => string; // Custom formatter for group keys
  subGroupKeyFormatter?: (value: any) => string; // Custom formatter for sub-group keys
  groupSpacing?: number; // Spacing between groups in pixels (default: 0)
  
  // Header filter configuration
  headerFilters?: HeaderFilterConfig; // Configuration for filter dropdowns in table headers
  
  // Sort configuration
  sortConfig?: SortConfig[]; // Configuration for sort buttons in table headers

  /**
   * Subheadings view only: when true, data rows render without the drag handle / DraggableRow wrapper.
   * Set from subheadings display config (e.g. demo-rsc-page subheadings-config).
   */
  subheadingsDisableRowDrag?: boolean;
}
