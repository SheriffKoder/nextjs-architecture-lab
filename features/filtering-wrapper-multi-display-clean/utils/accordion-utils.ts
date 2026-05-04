/**
 * Accordion Utilities
 * 
 * Purpose: Provides utility functions for accordion group column positioning
 * Used in: VirtualizedTableHeader for determining column positions within groups
 * Why: Separates accordion logic from components for better maintainability
 * 
 * Features:
 * - Determine if column is first in group
 * - Determine if column is last in group
 * - Get group column information
 * 
 * Steps:
 * 1. Define utility function interfaces
 * 2. Implement column position detection logic
 * 3. Export utilities for use in components
 */

import { TableColumn } from '../features/virtualized-table/types/table-column';

////////////////////////////////////
// Type Definitions: Utility function interfaces
////////////////////////////////////

/**
 * Information about a column's position within its group
 */
export interface ColumnGroupPosition {
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  groupColumnCount: number;
  columnIndexInGroup: number;
}

////////////////////////////////////
// Utility Functions: Column position detection
////////////////////////////////////

/**
 * Determine if a column is the first column in its group
 * 
 * @param column - The column to check
 * @param allColumns - All columns array for comparison
 * @returns True if this is the first column in the group
 */
export const isFirstColumnInGroup = <T = any>(
  column: TableColumn<T>,
  allColumns: TableColumn<T>[]
): boolean => {
  // If column has no group, it's not part of a group
  if (!column.groupId) return false;
  
  // Find all columns in the same group
  const groupColumns = allColumns.filter(col => col.groupId === column.groupId);
  
  // Check if this column is the first one in the group
  return groupColumns[0]?.key === column.key;
};

/**
 * Determine if a column is the last column in its group
 * 
 * @param column - The column to check
 * @param allColumns - All columns array for comparison
 * @returns True if this is the last column in the group
 */
export const isLastColumnInGroup = <T = any>(
  column: TableColumn<T>,
  allColumns: TableColumn<T>[]
): boolean => {
  // If column has no group, it's not part of a group
  if (!column.groupId) return false;
  
  // Find all columns in the same group
  const groupColumns = allColumns.filter(col => col.groupId === column.groupId);
  
  // Check if this column is the last one in the group
  return groupColumns[groupColumns.length - 1]?.key === column.key;
};

/**
 * Get comprehensive position information for a column within its group
 * 
 * @param column - The column to analyze
 * @param allColumns - All columns array for comparison
 * @returns Complete position information
 */
export const getColumnGroupPosition = <T = any>(
  column: TableColumn<T>,
  allColumns: TableColumn<T>[]
): ColumnGroupPosition => {
  // If column has no group, return default values
  if (!column.groupId) {
    return {
      isFirstInGroup: false,
      isLastInGroup: false,
      groupColumnCount: 0,
      columnIndexInGroup: -1
    };
  }
  
  // Find all columns in the same group
  const groupColumns = allColumns.filter(col => col.groupId === column.groupId);
  const columnIndexInGroup = groupColumns.findIndex(col => col.key === column.key);
  
  return {
    isFirstInGroup: columnIndexInGroup === 0,
    isLastInGroup: columnIndexInGroup === groupColumns.length - 1,
    groupColumnCount: groupColumns.length,
    columnIndexInGroup
  };
};

/**
 * Get group styling information for a column
 * 
 * @param column - The column to analyze
 * @param allColumns - All columns array for comparison
 * @returns Group styling information or null if not in a group
 */
export const getGroupStylingInfo = <T = any>(
  column: TableColumn<T>,
  allColumns: TableColumn<T>[]
) => {
  if (!column.groupId) return null;
  
  const groupColumns = allColumns.filter(col => col.groupId === column.groupId);
  const isFirst = groupColumns[0]?.key === column.key;
  const isLast = groupColumns[groupColumns.length - 1]?.key === column.key;
  
  return {
    groupId: column.groupId,
    isFirstColumn: isFirst,
    isLastColumn: isLast,
    groupSize: groupColumns.length
  };
};

/**
 * Get group styling classes for a column based on row data
 * 
 * @param rowData - The data for the current row
 * @param column - The column to style
 * @param allColumns - All columns array for comparison
 * @param groupStylerConfig - Optional group styler configuration
 * @returns CSS classes to apply to the cell
 */
export const getGroupStyling = <T = any>(
  rowData: T,
  column: TableColumn<T>,
  allColumns: TableColumn<T>[],
  groupStylerConfig?: { [groupId: string]: (rowData: T, isFirstColumn: boolean, isLastColumn: boolean) => string }
): string => {
  if (!groupStylerConfig || !column.groupId) return '';
  
  const groupInfo = getGroupStylingInfo(column, allColumns);
  if (!groupInfo) return '';
  
  const styler = groupStylerConfig[column.groupId];
  if (!styler) return '';
  
  return styler(rowData, groupInfo.isFirstColumn, groupInfo.isLastColumn);
};
 
