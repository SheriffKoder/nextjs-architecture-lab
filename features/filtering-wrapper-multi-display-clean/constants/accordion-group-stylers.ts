/**
 * Group Stylers Configuration
 * 
 * Purpose: Group styling rules for virtualized table
 * Used in: VirtualizedTable component to highlight groups based on data conditions
 * Why: Provides visual feedback for important data conditions across entire groups
 * 
 * Features:
 * - Data-driven group highlighting
 * - Configurable rules per group
 * - First/last column border styling
 * - Middle column background styling
 * - Multiple conditions per group
 */

import { TableItem } from '../types';

/**
 * Type definition for group styler functions
 * Takes row data and column position info, returns CSS class names
 */
export type GroupStylerFunction<T = any> = (
  rowData: T, 
  isFirstColumn: boolean, 
  isLastColumn: boolean
) => string;

/**
 * Helper function to safely convert string/number to number for comparison
 */
const toNumber = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Remove % symbol and convert to number
    const cleaned = value.replace('%', '').trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

/**
 * Virtualized Table Group Stylers
 * Each group can have multiple conditions that trigger highlighting
 * Based on the groupId configuration in columns.ts
 */
const virtualizedTableGroupStylers: Record<string, GroupStylerFunction<TableItem>> = {
  // Group 1: Amount and Date columns (based on groupId: 'group1' in columns.ts)
  group1: (rowData, isFirst, isLast) => {
    const conditions = [
      // Highlight if amount is above $1000
      toNumber(rowData.amount) > 1000,
      // Highlight if date is in the current year (2024)
      rowData.date && rowData.date.includes('2024'),
      // Highlight if status is 'Escalated'
      rowData.status === 'Escalated'
    ];
    
    if (conditions.some(Boolean)) {
      return isFirst ? 'bg-[#FFC7CE] border-l-4 border-[#ffa2ad]' : 
             isLast ? 'bg-[#FFC7CE] border-r-4 border-[#ffa2ad]' :
             'bg-[#FFC7CE]';
    }
    return '';
  },

  // Group 2: Example for future grouping (if you add more groups)
  group2: (rowData, isFirst, isLast) => {
    const conditions = [
      // Highlight if amount is below $100
      toNumber(rowData.amount) < 100,
      // Highlight if status is 'Resolved'
      rowData.status === 'Resolved'
    ];
    
    if (conditions.some(Boolean)) {
      return isFirst ? 'bg-[#D4F1D4] border-l-4 border-[#90EE90]' : 
             isLast ? 'bg-[#D4F1D4] border-r-4 border-[#90EE90]' :
             'bg-[#D4F1D4]';
    }
    return '';
  }
};

/**
 * Group Stylers Map
 * Maps table types to their corresponding group styler configurations
 */
const GROUP_STYLERS = {
  virtualized_table: virtualizedTableGroupStylers,
  // Add other table group stylers here as needed
  // admin_table: adminTableGroupStylers,
  // etc.
} as const;

/**
 * Get Group Styler Configuration
 * Returns the group styler configuration for the given table type
 * Returns undefined if no group styler is defined for the table type
 * 
 * @param tableType - The table type to get group styler for
 * @returns Group styler configuration or undefined
 */
export const getGroupStylers = (tableType: string): Record<string, GroupStylerFunction<TableItem>> | undefined => {
  return GROUP_STYLERS[tableType as keyof typeof GROUP_STYLERS];
};

/**
 * Get Group Styler for Virtualized Table
 * Convenience function to get group stylers for the virtualized table
 * 
 * @returns Group styler configuration for virtualized table
 */
export const getVirtualizedTableGroupStylers = (): Record<string, GroupStylerFunction<TableItem>> => {
  return virtualizedTableGroupStylers;
};
