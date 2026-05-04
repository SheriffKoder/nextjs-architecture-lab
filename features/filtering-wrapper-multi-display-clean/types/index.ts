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
export type { TableColumn } from '../features/virtualized-table/types/table-column';

// Import table item type definitions
export type { TableItem } from './table-item';

// Import table configuration type definitions
export type { TableConfig } from '../features/virtualized-table/types/table-config';

// Import header filter configuration type definitions
export type { HeaderFilterConfig } from './header-filter-config';
