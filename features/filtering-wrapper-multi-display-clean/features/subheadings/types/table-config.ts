/**
 * Table Configuration Types
 * 
 * Purpose: Type definitions for table configuration object
 * Used in: VirtualizedTable component
 * Why: Provides type safety for table configuration props
 */


import type { ReactNode } from 'react'
import { RowExpansionConfig } from '../components/row-expand/types';

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
}
