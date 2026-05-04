/**
 * Calculate Group Sums Utility
 * 
 * Purpose: Calculates the sum of numeric values for each column in a group of items
 * Used in: SubHeadingsContainer summary rows
 * Why: Provides aggregated data for group summary rows
 * 
 * Steps:
 * 1. Filter columns that have isNumberField property
 * 2. Sum all numeric values for each number field column
 * 3. Return a map of column keys to their sums
 */

import { TableColumn } from "../types/table-column";

////////////////////////////////////
// Type Definitions: Group sum calculation parameters
////////////////////////////////////

/**
 * Parameters for calculating group sums
 */
interface CalculateGroupSumsParams<T> {
  // Array of items in the group
  items: T[];
  // Column definitions for the table
  columns: TableColumn<T>[];
}

/**
 * Result of group sum calculation
 * Maps column keys to their calculated sums
 */
export type GroupSums = Record<string, number>;

////////////////////////////////////
// Group Sum Calculation Logic
////////////////////////////////////

/**
 * Calculates the sum of numeric values for each number field column in a group
 * 
 * @template T - The type of data items
 * @param {CalculateGroupSumsParams<T>} params - Calculation parameters
 * @returns {GroupSums} Map of column keys to their sums
 * 
 * @example
 * ```tsx
 * const sums = calculateGroupSums({
 *   items: [
 *     { id: 1, amount: 100, price: 50 },
 *     { id: 2, amount: 200, price: 75 }
 *   ],
 *   columns: [
 *     { key: "amount", isNumberField: true },
 *     { key: "price", isNumberField: true }
 *   ]
 * });
 * // Returns: { amount: 300, price: 125 }
 * ```
 */
export function calculateGroupSums<T>({
  items,
  columns
}: CalculateGroupSumsParams<T>): GroupSums {
  const sums: GroupSums = {};
  
  // Filter columns that have isNumberField property
  const numberColumns = columns.filter(col => col.isNumberField && !col.isHidden);
  
  // Calculate sum for each number field column
  numberColumns.forEach(column => {
    let sum = 0;
    
    items.forEach(item => {
      const value = (item as any)[column.key];
      
      // Only add numeric values
      if (typeof value === 'number' && !isNaN(value)) {
        sum += value;
      } else if (value !== null && value !== undefined) {
        // Try to parse string numbers
        const parsed = parseFloat(String(value));
        if (!isNaN(parsed)) {
          sum += parsed;
        }
      }
    });
    
    sums[column.key] = sum;
  });
  
  return sums;
}
