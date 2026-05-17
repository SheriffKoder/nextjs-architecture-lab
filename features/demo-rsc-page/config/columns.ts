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
import { rentalCarStatusFormat } from "./cells/rental-car-status-format";
import {
  rentalCarLocationDropdownFormatter,
  rentalCarLocationDropdownOptions,
  rentalCarLocationFormat,
} from "./cells/rental-car-location-options";
import { formatGroupedInteger, formatGroupedNumber } from "@/utils/number-formatters/format-grouped-number";
import { rentalCarSetActivityCell } from './cells/rental-car-set-activity-cell';

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
    // YYYY
    formatter: (value) => {
      if (typeof value === 'number') {
        return value.toString()
      }
      return String(value)
    },
  },
  {
    key: 'status',
    name: 'Status',
    formatter: rentalCarStatusFormat.text,
    cellRenderer: rentalCarStatusFormat.cell,
  },
  {
    key: 'location',
    name: 'Location',
    groupId: 'updates',
    formatter: rentalCarLocationFormat.text,
    cellRenderer: rentalCarLocationFormat.cell,
    isDropdown: true,
    dropdownOptions: rentalCarLocationDropdownOptions,
    dropdownFormatter: rentalCarLocationDropdownFormatter,
  },
  {
    key: 'mileage',
    name: 'Mileage',
    groupId: 'updates',
    isNumberField: true,
    editableGroupedNumber: { suffix: ' mi' },
    formatter: (value) => {
      return typeof value === 'number'
        ? formatGroupedInteger(value, { suffix: ' mi' })
        : String(value);
    },
  },
  {
    key: 'pricePerDay',
    name: 'Price/Day',
    groupId: 'updates',
    isNumberField: true,
    editableGroupedNumber: {
      prefix: '$',
      allowDecimals: true,
      maxDecimalPlaces: 2,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
    formatter: (value) => {
      return typeof value === 'number'
        ? formatGroupedNumber(value, {
            prefix: '$',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : String(value);
    },
  },
  {
    key: 'color',
    name: 'Color',
  },
  /**
   * Set activity (table only): toggles `available` ↔ `reserved` via `columnActions.setActivity`.
   */
  {
    key: 'setActivity',
    name: 'Set activity',
    groupId: 'updates',
    cellRenderer: rentalCarSetActivityCell,
  },
  {
    key: 'licensePlate',
    name: 'License Plate',
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
  'color',
  'licensePlate',
  'location',
  'mileage',
  'pricePerDay',
  'setActivity',
  'delete',
  'actions',
  // 'rentalStartDate',
  // 'rentalEndDate',
]);
