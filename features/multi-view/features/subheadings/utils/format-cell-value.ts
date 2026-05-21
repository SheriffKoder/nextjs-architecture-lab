/**
 * Format Cell Value Utility
 * 
 * Purpose: Formats cell values for display in table cells
 * Used in: VirtualizedTable component row renderer
 * Why: Separates formatting logic for reusability and consistent display
 * 
 * Steps:
 * 1. Check for null/undefined values
 * 2. Apply custom formatter if available
 * 3. Apply default formatting based on column type
 * 4. Return formatted string
 */

import { TableColumn } from "../types/table-column";
import { formatCurrencyLegacy } from "../../../utils/formatting/format-currency";

////////////////////////////////////
// Type Definitions: Cell formatting parameters
////////////////////////////////////

/**
 * Parameters for formatting a cell value
 */
interface FormatCellValueParams<T> {
  // Raw value from data item
  value: any;
  // Column definition for formatting rules
  column: TableColumn<T>;
}

////////////////////////////////////
// Cell Formatting Logic: Apply formatting rules
////////////////////////////////////

/**
 * Formats a cell value for display in the table
 * Handles custom formatters, number formatting, and fallback string conversion
 * 
 * @template T - The type of data items
 * @param {FormatCellValueParams<T>} params - Formatting parameters
 * @returns {string} Formatted value string
 * 
 * @example
 * ```tsx
 * const displayValue = formatCellValue({
 *   value: 123.45,
 *   column: { key: "amount", isNumberField: true, decimalPlaces: 2 }
 * });
 * // Returns: "$123.45"
 * ```
 */
export function formatCellValue<T>({
  value,
  column
}: FormatCellValueParams<T>): string {
  // Handle null/undefined values
  if (value === null || value === undefined) {
    return "";
  }

  // Apply custom formatter if available (highest priority)
  if (column.formatter) {
    return column.formatter(value);
  }

  // Apply number formatting for numeric fields
  if (column.isNumberField && typeof value === "number") {
    // Use default decimal places if not specified
    const decimalPlaces = column.decimalPlaces ?? 2;
    return formatCurrencyLegacy(value, decimalPlaces);
  }

  // Default string conversion for all other values
  return String(value);
} 