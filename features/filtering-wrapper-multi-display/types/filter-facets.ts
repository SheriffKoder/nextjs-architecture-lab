/**
 * Filter Facet Types
 *
 * Purpose: Shared types for main-fetch facet data (unique values) used by filter UIs.
 * Used in: PillFilter, FilteringWrapper, ProjectBoardContent, useProjects, API responses
 * Why: Single source of truth for facet/unique-value shapes so the filter contract is defined once.
 */

/**
 * One facet option returned by the API (e.g. company_unique_values, lender_unique_values).
 */
export interface UniqueValueItem {
  id: string;
  title: string;
  available: number;
  total: number;
}

/**
 * Map of facet key → list of unique value items.
 * Keys match RPC/API naming (e.g. company_unique_values, lender_unique_values).
 */
export type FilterUniqueValuesMap = Record<string, UniqueValueItem[]>;

/**
 * Dropdown option shape used by TableFilterList when options come from parent (filterUniqueValues).
 * Maps UniqueValueItem to { id, item, count } for compatibility with getDropdownItems shape.
 */
export interface DropdownOptionFromFacet {
  id?: string | number;
  item: string | number;
  available?: number;
  total?: number;
  count?: number; // fallback
}
