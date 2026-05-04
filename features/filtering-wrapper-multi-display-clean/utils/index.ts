/**
 * Utils Index
 * 
 * Purpose: Centralized exports for all table-related utility functions
 * Used in: VirtualizedTable component and hooks
 * Why: Provides clean import paths and organized utility access
 */


// Export display utilities
export { formatCellValue } from "../features/virtualized-table/utils/format-cell-value";

// Export formatting utilities
export { formatCurrency, formatCurrencyLegacy } from "./formatting/format-currency";
export type { Currency } from "./formatting/format-currency";

// Export sticky column utilities
export { getStickyLeft, getStickyStyle } from "../features/virtualized-table/utils/sticky-column-utils";

// Export accordion utilities
export { 
  isFirstColumnInGroup, 
  isLastColumnInGroup, 
  getColumnGroupPosition,
  getGroupStylingInfo,
  getGroupStyling
} from "./accordion-utils";
export type { ColumnGroupPosition } from "./accordion-utils"; 

// Export scroll utilities
export { scrollContainerToGroupCenter } from "./scroll-utils";

// Export group stylers
export { 
  getGroupStylers, 
  getVirtualizedTableGroupStylers 
} from "../constants/accordion-group-stylers";
export type { GroupStylerFunction } from "../constants/accordion-group-stylers";