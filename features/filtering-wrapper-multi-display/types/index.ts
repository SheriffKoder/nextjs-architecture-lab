/**
 * Types Index File
 * 
 * Purpose: Central export point for all TypeScript interfaces and types
 * Used in: All components, hooks, and constants that need type definitions
 * Why: Provides single import location and maintains clean import statements
 * 
 * Steps:
 * 1. Import all type definitions from individual files
 * 2. Re-export them for convenient importing
 */

// Import table column type definitions
export type { TableColumn, UniqueValuesOption } from '../features/virtualized-table/types/table-column';

// Import table item type definitions
export type { TableItem } from './table-item';

// Import filter type definitions
export type { RangeFilter, DateRangeFilter, FilterValue } from './filter-types';

// Import filter-facet types (unique values from main fetch)
export type { UniqueValueItem, FilterUniqueValuesMap, DropdownOptionFromFacet } from './filter-facets'; 

// Import table configuration type definitions
export type { TableConfig } from '../features/virtualized-table/types/table-config';

// Import filter configuration type definitions
export type { FilterConfig } from './filter-config'; 