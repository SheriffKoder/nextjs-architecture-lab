/**
 * Table Columns Configuration
 * 
 * Purpose: Defines all available columns and helper functions for column management
 * Used in: Table views, filter configurations, and column displays
 * Why: Centralizes column definitions for consistency and reusability
 */

import React from 'react'
import { Trash2 } from 'lucide-react'
import { TableColumn } from "@/features/filtering-wrapper-multi-display-clean/types";
import type { RentalCarTableItem } from "../types/rental-car-table-item";

////////////////////////////////////
// Centralized Column Definitions: All columns defined once
////////////////////////////////////

/**
 * All available columns for rental cars table
 * WHY: Single source of truth for column display (labels, formatters, layout hints)
 * HOW: Table sort/filter/search chrome is driven by table-config, minimal-controls-config, etc.
 */
export const allColumns: TableColumn<RentalCarTableItem>[] = [
  {
    key: 'model',
    name: 'Model',
  },
  {
    key: 'make',
    name: 'Make',
  },
  {
    key: 'year',
    name: 'Year',
    isNumberField: true, // Formatting
  },
  {
    key: 'status',
    name: 'Status',
    formatter: (value) => {
      const statusMap: Record<string, string> = {
        'available': 'Available',
        'rented': 'Rented',
        'maintenance': 'Maintenance',
        'reserved': 'Reserved',
      }
      return statusMap[value as string] || String(value)
    },
  },
  {
    key: 'location',
    name: 'Location',
  },
  {
    key: 'mileage',
    name: 'Mileage',
    isNumberField: true,
    formatter: (value) => {
      return typeof value === 'number' ? `${value.toLocaleString()} mi` : String(value)
    },
  },
  {
    key: 'pricePerDay',
    name: 'Price/Day',
    isNumberField: true,
    formatter: (value) => {
      return typeof value === 'number' ? `$${value.toFixed(2)}` : String(value)
    },  
  },
  {
    key: 'color',
    name: 'Color',
    groupId: 'vehicle-details', // Accordion group for vehicle details
  },
  {
    key: 'licensePlate',
    name: 'License Plate',
    groupId: 'vehicle-details', // Accordion group for vehicle details
  },
  {
    key: 'rentalStartDate',
    name: 'Rental Start Date',
    formatter: (value) => {
      if (typeof value === 'string') {
        const date = new Date(value)
        return date.toLocaleDateString()
      }
      return String(value)
    },
  },
  {
    key: 'rentalEndDate',
    name: 'Rental End Date',
    formatter: (value) => {
      if (typeof value === 'string') {
        const date = new Date(value)
        return date.toLocaleDateString()
      }
      return String(value)
    },
  },
  /**
   * Reserved key: row actions column — `VirtualizedTable` renders `ActionButton` (dropdown: View / Edit for demo RSC).
   * `cellRenderer` unused for this key; kept as stub for type consistency.
   */
  {
    key: 'actions',
    name: 'Actions',
    // width: '72px',
    cellRenderer: () => null,
  },
  /**
   * Delete column (table only): centered trash control; same interaction pattern as checkbox column (stopPropagation → no row click).
   * Handler supplied via `FilteringWrapper` `columnActions.delete`.
   */
  {
    key: 'delete',
    name: 'Delete',
    // width: '56px',
    // minWidth: '52px',
    cellRenderer: (value, item, columnAction): React.ReactElement | null => {
      if (!item || !columnAction) return null
      return React.createElement(
        'div',
        {
          className: 'flex items-center justify-center px-2 w-full h-full',
          onClick: (e: React.MouseEvent) => {
            e.stopPropagation()
          },
        },
        React.createElement(
          'button',
          {
            type: 'button',
            className:
              'rounded-md bg-foreground/5 p-2 text-destructive transition-colors hover:bg-destructive/10 dark:bg-transparent dark:hover:bg-destructive/15',
            'aria-label': 'Delete car',
            title: 'Delete',
            onClick: (e: React.MouseEvent) => {
              e.stopPropagation()
              void columnAction(item, value)
            },
          },
          React.createElement(Trash2, { size: 18 })
        )
      )
    },
  },
]

////////////////////////////////////
// Column Array Creation: Helper function
////////////////////////////////////

/**
 * Helper function to create column array from keys
 * WHY: Allows selecting specific columns from allColumns without duplicating definitions
 * HOW: Maps keys to column definitions and filters out undefined values
 * 
 * @param keys - Array of column keys to include
 * @returns Array of TableColumn objects
 */
export function createColumnArray(keys: string[]): TableColumn<RentalCarTableItem>[] {
  return keys
    .map(key => allColumns.find(col => col.key === key))
    .filter((col): col is TableColumn<RentalCarTableItem> => col !== undefined);
}

////////////////////////////////////
// Table Columns: Columns to display in table
////////////////////////////////////

/**
 * Columns to display in the rental cars table
 * WHY: Defines which columns are visible in the main table view
 * HOW: Uses createColumnArray to select specific columns from allColumns
 */
export const tableColumns = createColumnArray([
  'model',
  'make',
  'year',
  'status',
  'location',
  'mileage',
  'pricePerDay',
  'color',
  'licensePlate',
  'delete',
  'actions',
  // 'rentalStartDate',
  // 'rentalEndDate',
]);
