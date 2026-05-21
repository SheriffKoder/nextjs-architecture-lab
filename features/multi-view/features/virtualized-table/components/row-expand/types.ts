/**
 * Row Expansion Types
 * 
 * Purpose: Type definitions for expandable row functionality
 * Used in: Row expansion hooks and components
 */

import React from 'react';

/**
 * Configuration for row expansion behavior
 */
export interface RowExpansionConfig {
  // Function to fetch children data for a row
  getChildren?: (rowId: string | number) => Promise<any[]> | any[];
  // Function to render expanded content
  // Receives the parent item, its children, and optional row handlers (click / pointer enter for prefetch)
  renderExpandedContent?: (
    item: any,
    children: any[],
    onRowClick?: (row: any) => void,
    onRowPointerEnter?: (row: any) => void
  ) => React.ReactElement | null;
  // Height of expanded content (in pixels)
  expandedContentHeight?: number;
  // Whether expansion is enabled
  enabled?: boolean;
}

/**
 * Expanded row state
 */
export interface ExpandedRowState {
  // Set of row IDs that are currently expanded
  expandedRows: Set<string | number>;
  // Map of row IDs to their children data
  childrenData: Map<string | number, any[]>;
  // Map of row IDs to loading state
  loadingChildren: Map<string | number, boolean>;
}
