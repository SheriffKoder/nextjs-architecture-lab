/**
 * Row Styler Left Border Utilities
 * 
 * Purpose: Centralized row styler utilities for left border indicators
 * Used in: Table configs (trailers, invoices, etc.)
 * Why: Single source of truth for row border styling, easy to update globally
 * 
 * Usage:
 * ```typescript
 * import { createRowStyler, getBorderColor, rowStylerBaseClasses } from '@/features/filtering-wrapper-multi-display/styles/row-styler-left-border';
 * 
 * const rowStyler = createRowStyler<MyType>((rowData) => {
 *   if (rowData.status === 'paid') return 'success';
 *   if (rowData.status === 'overdue') return 'error';
 *   return 'default';
 * });
 * ```
 */

/**
 * Semantic border color styles for left border indicators
 * Maps semantic meanings to Tailwind CSS classes
 */
export const borderColors = {
  // Success states (green)
  success: 'before:bg-green-500',
  
  // Warning states (yellow)
  warning: 'before:bg-yellow-500',
  
  // Error/Danger states (red)
  error: 'before:bg-red-500',
  
  // Info states (blue)
  info: 'before:bg-blue-500',
  
  // Default/neutral (uses theme border color)
  default: 'before:bg-border',
} as const;

/**
 * Get border color class by semantic key
 * 
 * @param key - Semantic color key (success, warning, error, info, default)
 * @returns Tailwind CSS class for border color
 * 
 * @example
 * getBorderColor('success') // Returns 'before:bg-green-500'
 * getBorderColor('error') // Returns 'before:bg-red-500'
 */
export function getBorderColor(
  key: keyof typeof borderColors
): string {
  return borderColors[key] || borderColors.default;
}

/**
 * Row styler base classes
 * These classes are applied to all rows with left border indicators
 * - relative: Allows absolute positioning of border element
 * - pl-4: Left padding to make room for border
 * - before:absolute before:left-1: Positions border on left edge
 * - before:top-1/2 before:-translate-y-1/2: Centers border vertically
 * - before:w-1: Border width (4px)
 * - before:h-[17px]: Border height (shorter than row)
 * - before:rounded: Rounded corners on border
 */
export const rowStylerBaseClasses = 'relative pl-4 before:absolute before:left-1 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-[17px] before:rounded';

/**
 * Create a complete row styler className
 * 
 * @param colorKey - Semantic color key (success, warning, error, info, default)
 * @returns Complete className string for row with left border
 * 
 * @example
 * createRowStylerClassName('success') // Returns full row className with green border
 */
export function createRowStylerClassName(
  colorKey: keyof typeof borderColors
): string {
  return `${rowStylerBaseClasses} ${getBorderColor(colorKey)}`;
}

/**
 * Date utility: Check if a date is overdue (in the past)
 * 
 * @param date - Date to check (Date object or string)
 * @returns true if date is in the past (overdue)
 * 
 * @example
 * isOverdue(new Date('2024-01-01')) // Returns true if today is after Jan 1, 2024
 */
export function isOverdue(date: Date | string): boolean {
  const checkDate = date instanceof Date ? date : new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  checkDate.setHours(0, 0, 0, 0);
  
  return checkDate.getTime() < today.getTime();
}

/**
 * Date utility: Check if a date is within N days from today
 * 
 * @param date - Date to check (Date object or string)
 * @param days - Number of days to check (default: 7)
 * @returns true if date is within the specified number of days (0 to N days)
 * 
 * @example
 * isDueWithinDays(new Date('2024-12-25'), 7) // Returns true if date is within 7 days
 */
export function isDueWithinDays(date: Date | string, days: number = 7): boolean {
  const checkDate = date instanceof Date ? date : new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  checkDate.setHours(0, 0, 0, 0);
  
  const diffTime = checkDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Return true if date is between today and N days from now (inclusive)
  return diffDays >= 0 && diffDays <= days;
}

/**
 * Create a row styler function
 * 
 * @param getColorKey - Function that returns a semantic color key based on row data
 * @returns Row styler function that returns className string
 * 
 * @example
 * const rowStyler = createRowStyler<InvoiceTableItem>((rowData) => {
 *   if (rowData.status === 'paid') return 'success';
 *   if (rowData.status === 'overdue') return 'error';
 *   if (rowData.status === 'unpaid' && isDueWithinDays(rowData.dueDate, 7)) return 'warning';
 *   return 'default';
 * });
 */
export function createRowStyler<T>(
  getColorKey: (rowData: T) => keyof typeof borderColors
): (rowData: T) => string {
  return (rowData: T) => {
    const colorKey = getColorKey(rowData);
    return createRowStylerClassName(colorKey);
  };
}
