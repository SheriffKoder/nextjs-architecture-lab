/**
 * Get Active Columns Utility
 * 
 * Purpose: Extract column titles that have active filters
 * Used in: DashboardContent component
 * Why: Provides a list of columns that currently have filters applied
 * 
 * Functions:
 * - getActiveColumns: Returns array of column objects with active filters
 */

import { TableColumn } from '@/features/filtering-wrapper-multi-display/types';
import { FilterValue, DateRangeFilter, RangeFilter } from '@/features/filtering-wrapper-multi-display/types/filter-types';

/**
 * Parameters for getting active columns
 */
export interface GetActiveColumnsParams<T extends Record<string, any> = Record<string, any>> {
  columns: TableColumn<T>[];
  activeFilters: Record<string, FilterValue>;
  hiddenColumns?: string[];
}

/**
 * Active column result
 */
export interface ActiveColumn<T extends Record<string, any> = Record<string, any>> {
  key: string;
  name: string;
  column: TableColumn<T>;
}

/**
 * Get columns that have active filters applied
 * 
 * @param params - Parameters containing columns, activeFilters, and optional hiddenColumns
 * @returns Array of active column objects with key, name, and column reference
 * 
 * @example
 * ```ts
 * const activeColumns = getActiveColumns({
 *   columns: tableColumns,
 *   activeFilters: { status: ['active', 'pending'], price: { min: 100, max: 500 } },
 *   hiddenColumns: ['id']
 * });
 * // Returns: [{ key: 'status', name: 'Status', column: {...} }, { key: 'price', name: 'Price', column: {...} }]
 * ```
 */
export function getActiveColumns<T extends Record<string, any> = Record<string, any>>({
  columns,
  activeFilters,
  hiddenColumns = []
}: GetActiveColumnsParams<T>): ActiveColumn<T>[] {
  const activeColumns: ActiveColumn<T>[] = [];

  columns.forEach((column) => {
    // Skip hidden columns
    if (hiddenColumns.includes(column.key)) {
      return;
    }

    const filterValue = activeFilters[column.key];

    // Check if filter is active
    if (!filterValue) {
      return;
    }

    // Check for string array filters (multi-select)
    if (Array.isArray(filterValue)) {
      if (filterValue.length > 0) {
        activeColumns.push({
          key: column.key,
          name: column.name,
          column
        });
      }
      return;
    }

    // Check for date range filters
    if (typeof filterValue === 'object' && 'start' in filterValue && 'end' in filterValue) {
      const dateFilter = filterValue as DateRangeFilter;
      if (dateFilter.start !== null || dateFilter.end !== null) {
        activeColumns.push({
          key: column.key,
          name: column.name,
          column
        });
      }
      return;
    }

    // Check for number range filters
    if (typeof filterValue === 'object' && 'min' in filterValue && 'max' in filterValue) {
      const rangeFilter = filterValue as RangeFilter;
      if (rangeFilter.min !== null || rangeFilter.max !== null) {
        activeColumns.push({
          key: column.key,
          name: column.name,
          column
        });
      }
      return;
    }
  });

  return activeColumns;
}
