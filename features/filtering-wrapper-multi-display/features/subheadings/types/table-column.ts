/**
 * Table Column Type Definitions
 * 
 * Purpose: Defines TypeScript interfaces for table column configuration
 * Used in: VirtualizedTable components and column definitions
 * Why: Provides type safety and structure for table column configuration
 * 
 * Steps:
 * 1. Define TableColumn interface with all configurable properties
 * 2. Export for use across table components and constants
 */

import React from "react";
import { DropdownOption } from "../../../types/dropdown";
import { FilterValue } from "../../../types/filter-types";
import type { EditableGroupedNumberConfig } from "@/utils/number-formatters/format-grouped-number";

/**
 * Interface defining the structure and behavior of a table column
 * Provides type safety for column configuration across the virtualized table system
 * 
 * @template T - The type of data items in the table
 * 
 * @example
 * ```tsx
 * const columns: TableColumn<User>[] = [
 *   {
 *     key: "name",
 *     name: "Name",
 *     sortable: true,
 *     width: "200px"
 *   }
 * ];
 * ```
 */
export interface TableColumn<T = any> {
  // Unique identifier for the column (must match data object property)
  key: string;
  // Human-readable name displayed in table header
  name: string;
  // Format for filtering options stored for easy lookup in TableFilterDropdownOrchestrator as
  // optionMap.set("formatted string", { value: "formatted string", rawValue: "raw value" })
  // Also used as an optional function to format cell values for display
  formatter?: (value: any) => string;
  // Optional function to render custom JSX for cell content
  // Receives: value (cell value), item (full row data), columnAction (action handler if configured)
  cellRenderer?: (value: any, item?: T, columnAction?: (item: T, value: any) => void | Promise<void>) => React.ReactElement | null;
  // Enable date range filtering for this column
  isDateField?: boolean;
  // Enable number range filtering for this column
  isNumberField?: boolean;
  editableGroupedNumber?: EditableGroupedNumberConfig;
  // Enable time range filtering for this column
  isTimeField?: boolean;
  // Number of decimal places for number formatting
  decimalPlaces?: number;
  // Enable sorting functionality for this column
  sortable?: boolean;
  // CSS width value for column sizing
  width?: string;
  // CSS minimum width value to prevent column from shrinking below this size
  // the rows/header has flex shrink set to 0, but this prop can add more security AND if the column does not have a width, it will have a min of this value
  minWidth?: string;
  // CSS width value specifically for header cells (overrides width if provided)
  headerWidth?: string;
  // CSS minimum width value specifically for header cells (overrides minWidth if provided)
  headerMinWidth?: string;
  // Enable filtering functionality for this column (defaults to true)
  filterable?: boolean;
  // Enable global search for this column (defaults to true)
  isSearchable?: boolean;
  // Dropdown configuration for editable cells
  isDropdown?: boolean;
  dropdownOptions?: DropdownOption[];
  dropdownFormatter?: (option: DropdownOption) => React.ReactElement;
  excludeCurrentSelection?: boolean;
  // Accordion grouping configuration
  groupId?: string;
  // Sticky column configuration
  sticky?: boolean;
  stickyPosition?: number;
  // Fixed width for sticky columns (required for proper positioning)
  fixedWidth?: number;
  // Show expand icon (e.g., +) before cell content
  showExpandIcon?: boolean;
  // Hide column from table display (header and rows) but keep it searchable
  isHidden?: boolean;
  // Optional Lucide icon component for filter buttons
  filterIcon?: React.ComponentType<{ size?: number; className?: string }>;
  // Initial filter values to apply automatically when table loads
  // Supports string arrays (multi-select), boolean values, number ranges, and date ranges
  initialAppliedFilterValues?: FilterValue;
} 