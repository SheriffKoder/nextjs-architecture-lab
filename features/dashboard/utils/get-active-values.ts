/**
 * Get Active Values Utility
 * 
 * Purpose: Extract and format filter values for active columns
 * Used in: DashboardContent component
 * Why: Provides formatted display values for active filters
 * 
 * Functions:
 * - getActiveValues: Returns formatted filter values for each active column
 */

import { TableColumn } from '@/features/filtering-wrapper-multi-display/types';
import { FilterValue, DateRangeFilter, RangeFilter } from '@/features/filtering-wrapper-multi-display/types/filter-types';
import { format } from 'date-fns';

/**
 * Parameters for getting active values
 */
export interface GetActiveValuesParams<T extends Record<string, any> = Record<string, any>> {
  columnKey: string;
  column: TableColumn<T>;
  filterValue: FilterValue;
}

/**
 * Active value result
 */
export interface ActiveValue {
  columnKey: string;
  formattedValue: string;
  rawValue: FilterValue;
}

/**
 * Format date for display
 */
function formatDate(date: Date | null): string {
  if (!date) return '';
  try {
    return format(date, 'MMM d, yyyy');
  } catch {
    return date.toLocaleDateString();
  }
}

/**
 * Format number with decimal places if specified
 */
function formatNumber(value: number | null, decimalPlaces?: number): string {
  if (value === null) return '';
  if (decimalPlaces !== undefined) {
    return value.toFixed(decimalPlaces);
  }
  return value.toString();
}

/**
 * Get formatted filter values for a specific column
 * 
 * @param params - Parameters containing columnKey, column, and filterValue
 * @returns Formatted value string for the filter
 * 
 * @example
 * ```ts
 * // String array filter
 * const value = getActiveValues({
 *   columnKey: 'status',
 *   column: statusColumn,
 *   filterValue: ['active', 'pending']
 * });
 * // Returns: "active, pending"
 * 
 * // Date range filter
 * const value = getActiveValues({
 *   columnKey: 'created_at',
 *   column: dateColumn,
 *   filterValue: { start: new Date('2024-01-01'), end: new Date('2024-01-31') }
 * });
 * // Returns: "Jan 1, 2024 - Jan 31, 2024"
 * 
 * // Number range filter
 * const value = getActiveValues({
 *   columnKey: 'price',
 *   column: priceColumn,
 *   filterValue: { min: 100, max: 500 }
 * });
 * // Returns: "$100 - $500"
 * ```
 */
export function getActiveValues<T extends Record<string, any> = Record<string, any>>({
  columnKey,
  column,
  filterValue
}: GetActiveValuesParams<T>): string {
  // Handle string array filters (multi-select)
  if (Array.isArray(filterValue)) {
    if (filterValue.length === 0) {
      return '';
    }

    // Use column formatter if available
    if (column.formatter) {
      return filterValue
        .map((val) => {
          try {
            return column.formatter!(val);
          } catch {
            return String(val);
          }
        })
        .join(', ');
    }

    // Default: join with comma
    return filterValue.join(', ');
  }

  // Handle date range filters
  if (typeof filterValue === 'object' && 'start' in filterValue && 'end' in filterValue) {
    const dateFilter = filterValue as DateRangeFilter;
    const { start, end } = dateFilter;

    if (start && end) {
      return `${formatDate(start)} - ${formatDate(end)}`;
    } else if (start) {
      return `From ${formatDate(start)}`;
    } else if (end) {
      return `Until ${formatDate(end)}`;
    }

    return '';
  }

  // Handle number range filters
  if (typeof filterValue === 'object' && 'min' in filterValue && 'max' in filterValue) {
    const rangeFilter = filterValue as RangeFilter;
    const { min, max } = rangeFilter;
    const decimalPlaces = column.decimalPlaces;

    if (min !== null && max !== null) {
      const minFormatted = formatNumber(min, decimalPlaces);
      const maxFormatted = formatNumber(max, decimalPlaces);
      
      // Use column formatter if available for the range display
      if (column.formatter) {
        try {
          const minFormattedValue = column.formatter(min);
          const maxFormattedValue = column.formatter(max);
          return `${minFormattedValue} - ${maxFormattedValue}`;
        } catch {
          return `${minFormatted} - ${maxFormatted}`;
        }
      }

      return `${minFormatted} - ${maxFormatted}`;
    } else if (min !== null) {
      const minFormatted = formatNumber(min, decimalPlaces);
      if (column.formatter) {
        try {
          return `From ${column.formatter(min)}`;
        } catch {
          return `From ${minFormatted}`;
        }
      }
      return `From ${minFormatted}`;
    } else if (max !== null) {
      const maxFormatted = formatNumber(max, decimalPlaces);
      if (column.formatter) {
        try {
          return `Up to ${column.formatter(max)}`;
        } catch {
          return `Up to ${maxFormatted}`;
        }
      }
      return `Up to ${maxFormatted}`;
    }

    return '';
  }

  return '';
}

/**
 * Get all active values for multiple columns
 * 
 * @param columns - Array of active columns
 * @param activeFilters - Record of all active filters
 * @returns Array of active values with column keys and formatted values
 */
export function getAllActiveValues<T extends Record<string, any> = Record<string, any>>(
  columns: Array<{ key: string; column: TableColumn<T> }>,
  activeFilters: Record<string, FilterValue>
): ActiveValue[] {
  // @ts-ignore
  return columns
    .map(({ key, column }) => {
      const filterValue = activeFilters[key];
      if (!filterValue) {
        return null;
      }

      return {
        columnKey: key,
        formattedValue: getActiveValues({ columnKey: key, column, filterValue }),
        rawValue: filterValue
      };
    })
    // @ts-ignore
    .filter((value): value is ActiveValue => value !== null && value.formattedValue !== '');
}
