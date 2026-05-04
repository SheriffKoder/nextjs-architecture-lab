/**
 * Column filter helpers
 *
 * Purpose: Reusable logic for “active filters for this column” and “dropdown source for this column”.
 * Used in: PillFilter and any other filter UIs (e.g. header filters, other boards).
 * Why: Single place for uniqueValues-vs-getDropdownItems rules and activeFilter → list shaping.
 */

import type { TableColumn } from '../../../types';
import type { FilterUniqueValuesMap, DropdownOptionFromFacet } from '../../../types';

/** Format a Date as MM-DD-YYYY for filter inputs. */
function formatDateForFilter(date: Date | null): string {
  if (!date) return '';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
}

/**
 * Normalize active filter state for a column into the array shape TableFilterList expects.
 * - Text/multi-select: string[] as-is.
 * - Number range: [minStr, maxStr] (empty string when null).
 * - Date range: [startStr, endStr] in MM-DD-YYYY.
 */
export function getActiveFiltersForColumn(
  activeFilters: Record<string, unknown>,
  column: TableColumn<unknown>
): string[] {
  const filterValue = activeFilters[column.key];
  if (filterValue == null) return [];

  if (Array.isArray(filterValue)) {
    return filterValue as string[];
  }

  if (column.isNumberField && filterValue && typeof filterValue === 'object' && 'min' in filterValue && 'max' in filterValue) {
    const range = filterValue as { min: number | null; max: number | null };
    return [
      range.min !== null ? String(range.min) : '',
      range.max !== null ? String(range.max) : '',
    ];
  }

  if (column.isDateField && filterValue && typeof filterValue === 'object' && 'start' in filterValue && 'end' in filterValue) {
    const range = filterValue as { start: Date | null; end: Date | null };
    return [formatDateForFilter(range.start), formatDateForFilter(range.end)];
  }

  return [];
}

/**
 * Resolve dropdown source for a column: uniqueValues first, else getDropdownItems.
 * Uses uniqueValues.key for lookup and uniqueValues.formatter for display text when present.
 * Returns the props TableFilterList needs: getDropdownItems and/or dropdownItemsFromParent.
 */
export function getDropdownSourceForColumn<T = unknown>(
  column: TableColumn<T>,
  filterUniqueValues?: FilterUniqueValuesMap | null
): {
  getDropdownItems: TableColumn<T>['getDropdownItems'];
  dropdownItemsFromParent: DropdownOptionFromFacet[] | undefined;
} {
  const opt = column.uniqueValues;
  if (opt == null || !filterUniqueValues) {
    return { getDropdownItems: column.getDropdownItems, dropdownItemsFromParent: undefined };
  }
  const items = filterUniqueValues[opt.key] ?? [];
  const formatter = opt.formatter;
  const dropdownItemsFromParent: DropdownOptionFromFacet[] = items.map(({ id, title, available, total }) => ({
    id,
    item: formatter ? formatter(title) : title,
    available,
    total,
  }));
  return { getDropdownItems: undefined, dropdownItemsFromParent };
}
