/**
 * Column Width Calculator Utility
 * 
 * Purpose: Provides intelligent width calculation for table columns
 * Used in: VirtualizedTable components for consistent column sizing
 * Why: Handles mixed fixed and percentage widths properly
 */

import { TableColumn } from "../types/table-column";

/**
 * Calculate column width considering fixed widths and remaining space distribution
 * 
 * @param column - The column to calculate width for
 * @param columnIndex - Index of the column in the columns array
 * @param allColumns - All columns array for calculations
 * @returns CSS width value
 */
export function calculateColumnWidth<T>(
  column: TableColumn<T>, 
  columnIndex: number, 
  allColumns: TableColumn<T>[]
): string {
  // If column has a fixed width, use it
  if (column.width) {
    return column.width;
  }
  
  // Calculate total fixed width used by all columns with fixed widths
  const totalFixedWidth = allColumns.reduce((total, col) => {
    if (col.width) {
      // Convert width to pixels for calculation (assuming px units)
      const widthValue = parseInt(col.width);
      return total + (isNaN(widthValue) ? 0 : widthValue);
    }
    return total;
  }, 0);
  
  // Count columns without fixed widths (including current column)
  const flexibleColumns = allColumns.filter(col => !col.width).length;
  
  // If no flexible columns, return auto
  if (flexibleColumns === 0) {
    return 'auto';
  }
  
  // Use CSS calc() for precise remaining space distribution
  // This ensures the remaining space is evenly distributed among flexible columns
  const flexibleWidth = `calc((100% - ${totalFixedWidth}px) / ${flexibleColumns})`;
  
  return flexibleWidth;
}

/**
 * Get all column widths as an object for debugging
 * 
 * @param columns - Array of table columns
 * @returns Object with column keys and their calculated widths
 */
export function getAllColumnWidths<T>(columns: TableColumn<T>[]): Record<string, string> {
  const widths: Record<string, string> = {};
  
  columns.forEach((column, index) => {
    widths[column.key] = calculateColumnWidth(column, index, columns);
  });
  
  return widths;
} 