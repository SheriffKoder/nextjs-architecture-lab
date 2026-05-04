/**
 * Trailer Management Table Configuration
 * 
 * Purpose: Defines column structure and formatting for trailers virtualized table
 * Used in: Trailer management page with FilteringWrapper component
 * Why: Provides consistent column definitions with proper formatting
 * 
 * Columns: Trailer Number, Status, Assigned To, Current Location, Type, Condition
 * 
 * Important: This file should NOT import TanStack hooks, router, or handle mutations.
 * It should only describe columns, cell renderers, and which props they expect.
 */

import React from "react";
import { TableColumn } from "@/features/filtering-wrapper-multi-display/types";
////////////////////////////////////
// Centralized Column Definitions: All columns defined once
////////////////////////////////////

export interface RentalCarTableItem {
  id: string;
  model: string;
  make: string;
  year: number;
  status: string;
  location: string;
  mileage: number;
  pricePerDay: number;
  color: string;
  licensePlate: string;
  assignedToName?: string;
  lastServiceDate?: Date;
}


/**
 * Table Columns Configuration
 */
export const allColumns: TableColumn<RentalCarTableItem>[] = [
    {
      key: 'model',
      name: 'Model',
      sortable: true,
      filterable: true,
    },
    {
      key: 'make',
      name: 'Make',
      sortable: true,
      filterable: true,
    },
    {
      key: 'year',
      name: 'Year',
      sortable: true,
      filterable: true,
      isNumberField: true,
    },
    {
      key: 'status',
      name: 'Status',
      sortable: true,
      filterable: true,
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
      sortable: true,
      filterable: true,
    },
    {
      key: 'mileage',
      name: 'Mileage',
      sortable: true,
      filterable: true,
      isNumberField: true,
      formatter: (value) => {
        return typeof value === 'number' ? `${value.toLocaleString()} mi` : String(value)
      },
    },
    {
      key: 'pricePerDay',
      name: 'Price/Day',
      sortable: true,
      filterable: true,
      isNumberField: true,
      formatter: (value) => {
        return typeof value === 'number' ? `$${value.toFixed(2)}` : String(value)
      },
    },
    {
      key: 'color',
      name: 'Color',
      sortable: true,
      filterable: true,
    },
    {
      key: 'licensePlate',
      name: 'License Plate',
      sortable: true,
      filterable: true,
    },
  ]

////////////////////////////////////
// Column Array Creation: Helper function
////////////////////////////////////

/**
 * Helper function to create column array from keys
 * 
 * @param keys - Array of column keys to include
 * @returns Array of TableColumn objects
 */
function createColumnArray(keys: string[]): TableColumn<RentalCarTableItem>[] {
  return keys
    .map(key => allColumns.find(col => col.key === key))
    .filter((col): col is TableColumn<RentalCarTableItem> => col !== undefined);
}

////////////////////////////////////
// Table Columns: Columns to display in table
////////////////////////////////////

/**
 * Columns to display in the trailers table
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
  'assignedToName',
]);

/**
 * Header columns for filter configuration
 */
export const headerColumns = createColumnArray([
//   'trailerNumber',
  'status',
//   'assignedToName',
//   'currentLocation',
//   'type',
//   'condition',
]);

////////////////////////////////////
// Filter Configuration
////////////////////////////////////

/**
 * Filter configuration object for FilteringWrapper component
 */
export const filterConfig = {
  // Sorting configuration
  initialSortKey: "model" as const,
  initialSortDirection: "ascending" as const,
  
  // Filter dropdown configuration
  autoApplyDropdown: false,
  showBadgesDropdown: true,
  rangeOpen: false,
  
  // Search configuration
  searchPlaceholder: "Search by model, make, year, status, location, mileage, pricePerDay, color, licensePlate, assignedToName...",
  searchHighlightStyle: "bg-tertiary text-background font-medium px-0 rounded",
  hideTopLevelFilterSorting: true,
  hideTopLevelFiltering: true,
  hideTopLevelSearch: true,

  // Header configuration
  headerColumns: headerColumns,
  
  // Filter controls configuration
  showPill: true,
  showIndependentDateFilter: false,
  showDateFilterHeader: false,
  
  // Pagination configuration
  initialPaginationMode: true,
  itemsPerPage: 20,
  hidePaginationSwitch: true,
};



////////////////////////////////////
// Table Configuration
////////////////////////////////////

/**
 * Table configuration object for FilteringWrapper component
 */
export const tableConfig = {
  // Row height configuration
  rowHeight: 40,
  minRowHeight: 40,
  
  // Display configuration
  dynamicRowHeight: false,
  tableHeight: undefined,
  emptyMessage: "No rental cars found",
  
  // Loading configuration
  loading: undefined,
  loadingStateShimmer: true,
  
  // Row expansion configuration
  rowExpansion: undefined,
  
  // Action configuration
  actionMode: 'inline' as const,
  
  // Selection and editing
  editableColumns: [], // No inline editing for trailers
  
  // Styling configuration
  groupStylerConfig: undefined,
  rowStyler: undefined,
};
