/**
 * Table Columns Configuration
 * 
 * Purpose: Defines column structure and formatting for virtualized table
 * Used in: app/virtualized-table/page.tsx
 * Why: Provides consistent column definitions with proper formatting and filter capabilities
 * 
 * NEW APPROACH: Centralized column management
 * - Define all columns once in allColumns object
 * - Reference columns by name in tableColumns and headerColumns
 * - Easy to maintain and modify columns in one place
 * - No more duplication between different column arrays
 */

// Import types from new types folder structure
import React from "react";
import { TableColumn, TableItem } from "../types";
import { StatusBadge } from "../features/virtualized-table/components/rows/cell-status-badge";

////////////////////////////////////
// Centralized Column Definitions: All columns defined once
////////////////////////////////////

/**
 * Centralized column definitions
 * All columns are defined here and can be referenced by name
 * 
 * @type {Record<string, TableColumn<TableItem>>}
 */
export const allColumns: Record<string, TableColumn<TableItem>> = {
  ////////////////////////////////////
  // Basic Columns: Simple display without special formatting
  ////////////////////////////////////
  
  id: {
    // Unique identifier for the column (matches TableItem property)
    key: "id",
    // Human-readable name displayed in table header
    name: "ID",
    // Fixed width to prevent layout shifts during rendering
    width: "120px",
    
    // sticky configs
    sticky: true,
    fixedWidth: 120,
    stickyPosition: 0,
  },
  
  name: {
    // Column key matching TableItem.name property
    key: "name",
    // Display name in table header
    name: "Name",
    // Provide adequate space for item names
    width: "400px",

  },
  
  ////////////////////////////////////
  // Formatted Columns: Custom formatting and specialized filters
  ////////////////////////////////////
  
  amount: {
    // Column key matching TableItem.amount property
    key: "amount",
    // Display name in table header
    name: "Amount",
    /**
     * Custom formatter to display amounts as currency
     * Handles edge cases and ensures consistent formatting
     * 
     * @param {any} value - Raw amount value from data
     * @returns {string} Formatted currency string or empty string
     */
    formatter: (value) => {
      // Handle null/undefined values gracefully
      if (value === null || value === undefined) return '';
      
      // Ensure value is a number for consistent formatting
      const numValue = typeof value === 'number' ? value : Number(value);
      
      // Check if conversion resulted in valid number
      if (isNaN(numValue)) return String(value);
      
      // Format the number as currency with dollar sign and 2 decimal places
      return `$${numValue.toFixed(2)}`;
    },
    // Enable number range filtering for this column
    isNumberField: true,
    // Fixed width for consistent layout
    width: "200px",
    // Accordion grouping configuration
    groupId: 'group1',
  },

  date: {
    // Column key matching TableItem.date property
    key: "date",
    // Display name in table header
    name: "Date",
    // Enable date range filtering for this column
    isDateField: true,
    // Fixed width for consistent layout
    width: "200px",
    // Accordion grouping configuration
    groupId: 'group1',
    /**
     * Custom formatter to convert MM/DD/YYYY to MM-DD-YYYY
     * Provides consistent date formatting across the application
     * 
     * @param {any} value - Raw date string from data
     * @returns {string} Formatted date string or original value
     */
    formatter: (value) => {
      // Handle null/undefined values gracefully
      if (value === null || value === undefined) return '';
      
      // Split date string by forward slashes to extract components
      const parts = String(value).split('/');
      // Check if we have exactly 3 parts (month, day, year)
      if (parts.length === 3) {
        // Reconstruct date with hyphens instead of slashes
        return `${parts[0]}-${parts[1]}-${parts[2]}`;
      }
      
      // Return original value if not in expected MM/DD/YYYY format
      return String(value);
    }
    
  },
  datepicker: {
    // Column key matching TableItem.date property
    key: "datepicker",
    // Display name in table header
    name: "Date Picker",
    // Enable date range filtering for this column
    isDateField: true,
    // Fixed width for consistent layout
    width: "200px",
    /**
     * Custom formatter to convert MM/DD/YYYY to MM-DD-YYYY
     * Provides consistent date formatting across the application
     * 
     * @param {any} value - Raw date string from data
     * @returns {string} Formatted date string or original value
     */
    formatter: (value) => {
      // Handle null/undefined values gracefully
      if (value === null || value === undefined) return '';
      
      // Split date string by forward slashes to extract components
      const parts = String(value).split('/');
      // Check if we have exactly 3 parts (month, day, year)
      if (parts.length === 3) {
        // Reconstruct date with hyphens instead of slashes
        return `${parts[0]}-${parts[1]}-${parts[2]}`;
      }
      
      // Return original value if not in expected MM/DD/YYYY format
      return String(value);
    }
  },
  
  time: {
    // Column key matching TableItem.time property
    key: "time",
    // Display name in table header
    name: "Time",
    // Fixed width for consistent layout
    width: "200px",
    // Enable time range filtering for this column
    isTimeField: true,
    // Enable date range filtering for this column
    // Time values can be filtered by date ranges (e.g., "show items between 9 AM and 5 PM")
    // isDateField: true
  },
  
  status: {
    // Column key matching TableItem.status property
    key: "status",
    // Display name in table header
    name: "Status",
    isDropdown: true,
    dropdownOptions: [
      { value: 'Resolved', label: 'Resolved' },
      { value: 'Escalated', label: 'Escalated' }
    ],
    dropdownFormatter: (option): React.ReactElement => {
      const isResolved = option.value === 'Resolved';
      return React.createElement('div', {
        className: `w-full text-sm px-2 py-1 text-start ${
          isResolved 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`
      }, option.label);
    },

    // Fixed width for consistent layout
    // width: "150px",
    /**
     * Custom cell renderer to display status as colored badges
     * Provides visual distinction between different status values
     * 
     * @param {any} value - Raw status value from data
     * @returns {React.ReactElement | null} Status badge JSX element
     */
    cellRenderer: (value): React.ReactElement | null => {
      return StatusBadge({ status: String(value) }) as React.ReactElement;
    }
  },
  
  actions: {
    // Action column for row-specific actions
    key: "actions",
    // Display name in table header
    name: "Action",
    // Fixed width for action button
    width: "200px",
    /**
     * Custom cell renderer to display action icon
     * Will be handled by the table component with row data
     */
    cellRenderer: () => null // Placeholder, will be overridden by table component
  }
};

////////////////////////////////////
// Column Arrays: Reference columns by name from allColumns
////////////////////////////////////

/**
 * Helper function to create column arrays from allColumns
 * 
 * @param columnKeys - Array of column keys to include
 * @returns Array of TableColumn objects
 */
function createColumnArray(columnKeys: string[]): TableColumn<TableItem>[] {
  return columnKeys.map(key => {
    const column = allColumns[key];
    if (!column) {
      console.warn(`Column with key "${key}" not found in allColumns`);
      return null;
    }
    return column;
  }).filter(Boolean) as TableColumn<TableItem>[];
}

/**
 * Main table columns for the virtualized table
 * Includes all columns for full table display
 * 
 * @type {TableColumn<TableItem>[]}
 */
export const tableColumns: TableColumn<TableItem>[] = createColumnArray([
  'id',
  'name', 
  'amount',
  'date',
  'time',
  'status',
  'actions'
]);

/**
 * Header columns for the filter row level 2
 * Includes only columns that should have filters (excludes actions)
 * 
 * @type {TableColumn<TableItem>[]}
 */
export const headerColumns: TableColumn<TableItem>[] = createColumnArray([
  // 'id',
  'datepicker',
  'name',
  'amount', 
  // 'time',
  'status'
  // Note: 'actions' is excluded as it doesn't need filtering
]);

/**
 * Sortable columns for table sorting
 * Includes only columns that support sorting
 * 
 * @type {TableColumn<TableItem>[]}
 */
export const sortableColumns: TableColumn<TableItem>[] = createColumnArray([
  'id',
  'name',
  'amount',
  'date',
  'time',
  'status'
  // Note: 'actions' is excluded as it doesn't support sorting
]);

////////////////////////////////////
// Column Utilities: Helper functions for column management
////////////////////////////////////

/**
 * Get a single column by key
 * 
 * @param key - Column key to retrieve
 * @returns TableColumn object or undefined if not found
 */
export function getColumn(key: string): TableColumn<TableItem> | undefined {
  return allColumns[key];
}

/**
 * Get multiple columns by keys
 * 
 * @param keys - Array of column keys to retrieve
 * @returns Array of TableColumn objects
 */
export function getColumns(keys: string[]): TableColumn<TableItem>[] {
  return createColumnArray(keys);
}

/**
 * Check if a column exists
 * 
 * @param key - Column key to check
 * @returns True if column exists
 */
export function hasColumn(key: string): boolean {
  return key in allColumns;
}

/**
 * Get all column keys
 * 
 * @returns Array of all available column keys
 */
export function getAllColumnKeys(): string[] {
  return Object.keys(allColumns);
} 
