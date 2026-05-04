/**
 * Sticky Column Utilities
 * 
 * Purpose: Provides utility functions for calculating sticky column positioning
 * Used in: VirtualizedTableRow and VirtualizedTableHeader components
 * Why: Centralizes sticky column logic to avoid code duplication
 * 
 * Steps:
 * 1. Calculate left offset for sticky columns based on their position
 * 2. Generate CSS styles for sticky positioning
 * 3. Export utilities for use in table components
 */

import React from "react";
import { TableColumn } from "../types/table-column";

/**
 * Calculate the left offset for sticky columns based on their position
 * 
 * @param column - The column to calculate sticky position for
 * @param columnIndex - Index of the column in the columns array
 * @param allColumns - All columns array for calculations
 * @returns CSS left value for sticky positioning
 */
export const getStickyLeft = <T = any>(
  column: TableColumn<T>, 
  columnIndex: number, 
  allColumns: TableColumn<T>[]
): string => {
  if (!column.sticky) return '0px';
  
  // Calculate left offset by summing widths of all sticky columns before this one
  let leftOffset = 0;
  for (let i = 0; i < columnIndex; i++) {
    const prevColumn = allColumns[i];
    if (prevColumn.sticky && prevColumn.fixedWidth) {
      leftOffset += prevColumn.fixedWidth;
    }
  }
  
  return `${leftOffset}px`;
};

/**
 * Get sticky styling for a column
 * 
 * @param column - The column to get sticky styling for
 * @param columnIndex - Index of the column in the columns array
 * @param allColumns - All columns array for calculations
 * @param backgroundColor - Background color for sticky columns (optional)
 * @returns CSS styles for sticky positioning
 */
export const getStickyStyle = <T = any>(
  column: TableColumn<T>, 
  columnIndex: number, 
  allColumns: TableColumn<T>[],
  backgroundColor: string = 'hsl(var(--background))'
): React.CSSProperties => {
  if (!column.sticky) return {};
  
  // Check if this is the first sticky column (stickyPosition 0)
  const isFirstSticky = (column.stickyPosition || 0) === 0;
  

  // if below md viewport, no sticky
  if (window.innerWidth < 768) return {};

  return {
    position: window.innerWidth < 768 ? 'static' : 'sticky',
    left: getStickyLeft(column, columnIndex, allColumns),
    zIndex: 5 - (column.stickyPosition || 0),
    backgroundColor,
    // borderRight: ' 1px solid #e5e7eb', // Add border to separate sticky columns
    // borderLeft: ' 1px solid #e5e7eb',
    // inset border
    border: 'inset 1px solid #e5e7eb',
    ...(columnIndex === 0 && {
      // borderTopLeftRadius: '0.25rem', // rounded-l
      // borderBottomLeftRadius: '0.5rem'
    })
  };
};
