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
import type { SortConfig } from '@/platform/url-kit/filters/feature-sorting/types';
import type { GroupConfig } from '../utils/grouping-utils';

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
  rowHighlighting?: (rowData: T) => ReactNode;
  
  // Header configuration
  transparentHeader?: boolean; // When true, header is transparent until scrolled
  
  // Header filter and sort configuration
  headerFilters?: HeaderFilterConfig;
  sortConfig?: SortConfig[];
  
  // Grouping configuration (for list view)
  groupBy?: string;
  subGroupBy?: string;
  groupKeyFormatter?: (value: any) => string;
  subGroupKeyFormatter?: (value: any) => string;
  groupSpacing?: number;

  /** Subheadings view only; see virtualized-table TableConfig. */
  subheadingsDisableRowDrag?: boolean;
}
