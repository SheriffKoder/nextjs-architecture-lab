/**
 * LoadingRows Component
 * 
 * Purpose: Displays shimmer loading effects on dummy rows while data is loading
 * Used in: VirtualizedTable component when loadingStateShimmer is true
 * Why: Provides better UX by showing table structure during loading instead of just a spinner
 * 
 * Steps:
 * 1. Import required types and utilities
 * 2. Define component props interface
 * 3. Calculate number of rows needed to fill table height
 * 4. Render shimmer rows with proper styling
 */

import React from "react";
// Import types from types folder structure
import { TableColumn } from "../../types/table-column";
// Import width calculation utility
import { calculateColumnWidth } from "../../utils/column-width-calculator";
// import "../../styles/loading-shimmer.css";

////////////////////////////////////
// Type Definitions: Component props and interfaces
////////////////////////////////////

/**
 * Props for the LoadingRows component
 * Provides all necessary data for rendering loading shimmer rows
 */
interface LoadingRowsProps<T = any> {
  // Column definitions for table structure
  columns: TableColumn<T>[];
  // Row height in pixels (must match VirtualizedTable rowHeight)
  rowHeight: number;
  // Container height to calculate number of rows needed
  containerHeight: number;
  // Whether to show action column shimmer
  showActions?: boolean;
  // Action mode to determine shimmer layout
  actionMode?: 'inline' | 'dropdown';
}

////////////////////////////////////
// Component Implementation: Shimmer loading rows
////////////////////////////////////

/**
 * Loading rows component with shimmer effects
 * Renders dummy rows with shimmer animations to fill the table during loading
 * 
 * @template T - The type of data items in the table
 * @param {LoadingRowsProps<T>} props - Component props
 * @returns {JSX.Element} Loading shimmer rows
 * 
 * @example
 * ```tsx
 * <LoadingRows
 *   columns={tableColumns}
 *   rowHeight={40}
 *   containerHeight={600}
 *   showActions={true}
 * />
 * ```
 */
export function LoadingRows<T = any>({
  columns,
  rowHeight,
  containerHeight,
  showActions = false,
  actionMode = 'inline'
}: LoadingRowsProps<T>) {
  ////////////////////////////////////
  // Width Calculation: Handle mixed fixed and percentage widths
  ////////////////////////////////////
  
  /**
   * Calculate column width considering fixed widths and remaining space distribution
   * 
   * @param column - The column to calculate width for
   * @param columnIndex - Index of the column in the columns array
   * @param allColumns - All columns array for calculations
   * @returns CSS width value
   */
  const getColumnWidth = (column: TableColumn<T>, columnIndex: number) => 
    calculateColumnWidth(column, columnIndex, columns);

  ////////////////////////////////////
  // Row Calculation: Determine number of rows needed
  ////////////////////////////////////
  
  /**
   * Calculate how many rows we need to fill the container height
   * Accounts for header height and ensures we fill the visible area
   */
  const numberOfRows = Math.ceil(containerHeight / rowHeight);

  ////////////////////////////////////
  // Shimmer Row Renderer: Individual loading row
  ////////////////////////////////////
  
  /**
   * Render a single loading row with shimmer effects
   * Matches the structure and styling of VirtualizedTableRow
   */
  const renderLoadingRow = (index: number) => (
    <div
      key={index}
      className="flex items-center border-b border-border"
      style={{ height: rowHeight }}
    >
      {/* Map through each column to render shimmer cells */}
      {columns.map((column, colIndex) => {
        // Handle action column specially
        if (column.key === "actions" && showActions) {
          return (
                                        <div
                key={colIndex}
                className="px-4 py-2 flex items-center justify-center"
                style={{ width: getColumnWidth(column, colIndex) }}
              >
                {actionMode === 'inline' ? (
                  // Show multiple shimmer boxes for inline buttons (view, edit, delete)
                  // Match ActionButton inline mode styling: flex items-center space-x-1
                  <div className="flex items-center space-x-1">
                    <div className="w-6 h-6 rounded-md shimmer" />
                    <div className="w-6 h-6 rounded-md shimmer" />
                    <div className="w-6 h-6 rounded-md shimmer" />
                  </div>
                ) : (
                  // Show single shimmer box for dropdown menu
                  <div className="w-16 h-6 rounded-sm shimmer" />
                )}
              </div>
          );
        }
        
        // Render shimmer cell for data columns
        return (
          <div
            key={colIndex}
            className="px-4 py-2 min-w-[150px]"
            style={{ width: getColumnWidth(column, colIndex) }}
          >
            {/* Shimmer effect with varying widths for realistic appearance */}
            <div 
              className={`h-4 bg-foreground/15 rounded-[3px] shimmer ${
                index % 3 === 0 ? 'w-3/4' : 
                index % 3 === 1 ? 'w-1/2' : 'w-5/6'
              }`} 
            />
          </div>
        );
      })}
    </div>
  );

  ////////////////////////////////////
  // Main Render: Complete loading rows structure
  ////////////////////////////////////
  
  return (
    <div className="h-full">
      {/* Generate the calculated number of shimmer rows */}
      {Array.from({ length: numberOfRows }, (_, index) => renderLoadingRow(index))}
    </div>
  );
}

// Export component with React.memo for performance optimization
export default React.memo(LoadingRows); 