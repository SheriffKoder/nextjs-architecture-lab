/**
 * Hooks Index
 * 
 * Purpose: Centralized exports for all table-related hooks
 * Used in: VirtualizedTable component and other components
 * Why: Provides clean import paths and organized hook access
 */

// Export sorting hook
export { useTableSorting } from "./sorting/use-table-sorting";

// Export filtering hook
export { useTableFiltering } from "./filtering/use-table-filtering";

// Export pagination hook
export { useTablePagination } from "../features/subheadings/hooks/pagination/use-table-pagination";

// Export demo data hook
export { useDemoData } from "../features/subheadings/hooks/useDemoData";

// Export UI hooks
export { useContainerHeight } from "../features/subheadings/hooks/ui"; 