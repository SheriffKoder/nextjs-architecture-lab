/**
 * Table Columns Configuration
 * 
 * Purpose: Defines all available columns and helper functions for column management
 * Used in: Table views, filter configurations, and column displays
 * Why: Centralizes column definitions for consistency and reusability
 */

import { TableColumn } from "@/features/filtering-wrapper-multi-display-clean/types";
import type { RentalCarTableItem } from "../types/rental-car-table-item";
import { rentalCarStatusFormat } from "./cells/rental-car-status-format";
import {
  rentalCarLocationDropdownFormatter,
  rentalCarLocationDropdownOptions,
  rentalCarLocationFormat,
} from "./cells/rental-car-location-options";
import { formatGroupedInteger, formatGroupedNumber } from "@/utils/number-formatters/format-grouped-number";

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
    formatter: rentalCarLocationFormat.text,
    cellRenderer: rentalCarLocationFormat.cell,
    isDropdown: true,
    dropdownOptions: rentalCarLocationDropdownOptions,
    dropdownFormatter: rentalCarLocationDropdownFormatter,
  },
  {
    key: 'mileage',
    name: 'Mileage',
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
  /** Reserved key: row actions when `FilteringWrapper` gets `onActionClick` + `actionConfigs` (demo: delete only). */
  {
    key: 'actions',
    name: 'Actions',
    width: '72px',
    cellRenderer: () => null,
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
  'actions',
  // 'rentalStartDate',
  // 'rentalEndDate',
]);
