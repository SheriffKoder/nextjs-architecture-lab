/**
 * Group Summary Row Component
 * 
 * Purpose: Renders a summary row at the end of each group showing sums of number fields
 * Used in: SubHeadingsContainer grouped view
 * Why: Provides aggregated data visualization for grouped tables
 * 
 * Steps:
 * 1. Import required types and utilities
 * 2. Define component props interface
 * 3. Render summary row with sums for number field columns
 * 4. Format cell values using utility functions
 */

import React, { useState, useEffect } from "react";
// Import types from types folder structure
import { TableColumn } from "../../types/table-column";
// Import cell formatting utility
import { formatCellValue } from "../../utils/format-cell-value";
// Import width calculation utility
import { calculateColumnWidth } from "../../utils/column-width-calculator";
// Import sticky column utilities
import { getStickyStyle } from "../../utils/sticky-column-utils";
// Import group sums type
import { GroupSums } from "../../utils/calculate-group-sums";

////////////////////////////////////
// Type Definitions: Component props and interfaces
////////////////////////////////////

/**
 * Props for the GroupSummaryRow component
 */
interface GroupSummaryRowProps<T = any> {
  // Column definitions for table structure
  columns: TableColumn<T>[];
  // Calculated sums for number field columns
  groupSums: GroupSums;
  // Optional row styling
  className?: string;
}

////////////////////////////////////
// Component Implementation: Summary row rendering
////////////////////////////////////

/**
 * Summary row component that displays sums for number field columns
 * Renders a row with aggregated values for numeric columns in a group
 * 
 * @template T - The type of data items in the table
 * @param {GroupSummaryRowProps<T>} props - Component props
 * @returns {JSX.Element} Summary row with aggregated values
 * 
 * @example
 * ```tsx
 * <GroupSummaryRow
 *   columns={tableColumns}
 *   groupSums={{ amount: 1000, price: 500 }}
 * />
 * ```
 */
export function GroupSummaryRow<T = any>({
  columns,
  groupSums,
  className = ''
}: GroupSummaryRowProps<T>) {
  ////////////////////////////////////
  // Viewport Size: Track viewport size for responsive sticky positioning
  ////////////////////////////////////
  
  const [isMdViewport, setIsMdViewport] = useState(false);
  
  useEffect(() => {
    const checkViewport = () => {
      setIsMdViewport(window.innerWidth >= 768);
    };
    
    // Check on mount
    checkViewport();
    
    // Check on resize
    window.addEventListener('resize', checkViewport);
    
    return () => {
      window.removeEventListener('resize', checkViewport);
    };
  }, []);

  ////////////////////////////////////
  // Width Calculation: Handle mixed fixed and percentage widths
  ////////////////////////////////////
  
  // Get visible columns (non-hidden) for width calculations
  const visibleColumns = columns.filter(col => !col.isHidden);
  
  /**
   * Calculate column width considering fixed widths and remaining space distribution
   */
  const getColumnWidth = (column: TableColumn<T>, columnIndex: number) => {
    const visibleIndex = visibleColumns.findIndex(col => col.key === column.key);
    return calculateColumnWidth(column, visibleIndex >= 0 ? visibleIndex : columnIndex, visibleColumns);
  };

  /**
   * Get minimum width for a column
   */
  const getColumnMinWidth = (column: TableColumn<T>, columnIndex: number) => {
    if (column.minWidth) {
      return column.minWidth;
    }
    return getColumnWidth(column, columnIndex);
  };

  ////////////////////////////////////
  // Sticky Column Calculation: Use shared utility functions
  ////////////////////////////////////
  
  /**
   * Get sticky styling for a column using shared utility
   * Only applies sticky positioning on md+ viewports (768px+)
   */
  const getColumnStickyStyle = (column: TableColumn<T>, columnIndex: number): React.CSSProperties => {
    if (!column.sticky || !isMdViewport) {
      return {}; // Return empty styles if not sticky or on smaller screens
    }
    
    const visibleIndex = visibleColumns.findIndex(col => col.key === column.key);
    return getStickyStyle(column, visibleIndex >= 0 ? visibleIndex : columnIndex, visibleColumns, '');
  };

  // Calculate total minimum width needed for all columns
  const calculateTotalMinWidth = () => {
    let totalMinWidth = 0;
    columns.forEach((column, index) => {
      if (column.isHidden) {
        return;
      }
      const minWidth = getColumnMinWidth(column, index);
      const numericValue = parseInt(minWidth);
      if (!isNaN(numericValue)) {
        totalMinWidth += numericValue;
      }
    });
    return totalMinWidth > 0 ? `${totalMinWidth}px` : '100%';
  };

  const totalMinWidth = calculateTotalMinWidth();

  // Calculate grip icon width for alignment
  // Grip icon: px-2 (8px each side = 16px) + w-4 icon (16px) = 32px total
  const gripIconWidth = 32; // px-2 (8px * 2) + w-4 (16px) = 32px

  return (
    <div
      style={{
        minWidth: '100%',
        width: '100%',
      }}
      className={`flex flex-col ${className}`}
    >
      {/* Summary row content */}
      <div
        style={{
          minWidth: totalMinWidth,
          paddingLeft: `${gripIconWidth}px`, // Add padding to align with rows above (grip icon width)
        }}
        className="flex items-stretch border- border-border"
      >
        {/* Map through each column to render cells */}
        {(() => {
          const visibleColumns = columns.filter(col => !col.isHidden);
          return columns.map((column, colIndex) => {
            // Skip rendering if column is hidden
            if (column.isHidden) {
              return null;
            }
            
            // Check if this is the last visible column
            const visibleIndex = visibleColumns.findIndex(col => col.key === column.key);
            const isLastVisibleColumn = visibleIndex === visibleColumns.length - 1;
            
            const columnWidth = getColumnWidth(column, colIndex);
            const columnMinWidth = getColumnMinWidth(column, colIndex);
            
            // Only display value if column is a number field and has a sum
            const hasSum = column.isNumberField && groupSums[column.key] !== undefined;
            const sumValue = hasSum ? groupSums[column.key] : null;
            
            // Format the value if it exists
            const displayValue = sumValue !== null 
              ? formatCellValue({ 
                  value: sumValue, 
                  column 
                })
              : '';
            
            return (
              <div
                key={colIndex}
                className={`px-2 py-1 flex items-center ${isLastVisibleColumn ? 'border-r border-gray-200' : ''}`}
                style={{ 
                  width: columnWidth,
                  minWidth: columnMinWidth,
                  flexShrink: 0,
                  ...getColumnStickyStyle(column, colIndex)
                }}
              >
                {/* Display sum value or empty */}
                <div className="flex items-center w-full gap-2">
                  {displayValue ? (
                    <span className="text-foreground text-xs font-medium relative">
                    <span className="text-foreground/50 dark:text-foreground/20 text-[10px] font-normal dark:font-light -bottom-0.5 absolute -left-1 translate-x-[-100%]">SUM</span>
                      {displayValue}
                    </span>
                  ) : (
                    <span className="text-foreground/0 text-xs">—</span>
                  )}
                </div>
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
}

export default GroupSummaryRow;
