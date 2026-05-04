/**
 * Demo RSC Page Table Configuration
 * 
 * Purpose: Defines column structure and formatting for rental cars virtualized table
 * Used in: Demo RSC page with FilteringWrapper component
 * Why: Provides consistent column definitions with proper formatting
 * 
 * Columns: Model, Make, Year, Status, Location, Mileage, Price/Day, Color, License Plate
 * 
 * Important: This file should NOT import TanStack hooks, router, or handle mutations.
 * It should only describe columns, cell renderers, and which props they expect.
 */

import React from "react";
import type { TableConfig } from "@/features/filtering-wrapper-multi-display-clean/types";
import type { RentalCarTableItem } from '../../types/rental-car-table-item'

////////////////////////////////////
// Table Configuration - Split into Display and Header Configs
////////////////////////////////////

/**
 * Table Display Configuration
 * Controls display properties like row height, dynamic sizing, loading states, etc.
 */
export const tableDisplayConfig: TableConfig<RentalCarTableItem> = {
  // Row height configuration
  rowHeight: 60,                     // Fixed row height in pixels
  minRowHeight: 40,                  // Minimum row height for dynamic rows
  
  // Display configuration
  dynamicRowHeight: false,           // Disable variable row heights
  tableHeight: undefined,           // undefined = fill container
  emptyMessage: "No rental cars found",
  
  // Loading configuration
  loading: undefined,                // Set dynamically from props
  loadingStateShimmer: true,         // Show shimmer effect when loading
  
  // Row expansion configuration
  rowExpansion: undefined,           // No row expansion for this demo
  
  // Action configuration
  actionMode: 'inline',              // 'inline' | 'dropdown' for row actions
  
  // Selection and editing
  editableColumns: [],               // No inline editing for this demo
  
  // Styling configuration
  groupStylerConfig: undefined,     // No custom group styling
  rowStyler: undefined,              // No custom row styling
  
  // Header configuration
  transparentHeader: false,          // Header does not become transparent on scroll
  
  // Grouping configuration
  groupBy: undefined,                // No primary grouping
  subGroupBy: undefined,             // No secondary grouping
  groupKeyFormatter: undefined,      // No custom group formatter
  subGroupKeyFormatter: undefined,   // No custom sub-group formatter
  groupSpacing: undefined,          // No group spacing
}

/**
 * Table Header Configuration
 * Controls filters and sort buttons in table column headers
 */
export const tableHeaderConfig = {
  // Header filter configuration
  headerFilters: {
    // Map column keys to filter keys (defaults to column.key if not specified)
    // For the table header
    columnToFilterMap: {
      'status': 'status',
      'make': 'make',
      'location': 'location',
      'year': 'year',
      'pricePerDay': 'pricePerDay',
      'mileage': 'mileage',
      'rentalStartDate': 'rentalStartDate',
      'rentalEndDate': 'rentalEndDate',
      'licensePlate': 'licensePlate',
      'color': 'color',
    },
    
    // Which filters to show per column (optional - shows all matching if not specified)
    // For the table header
    enabledFilterKeys: {
      'model': ['model'],
      'status': ['status'],
      'make': ['make'],
      'location': ['location'],
      'year': ['year'],
      'pricePerDay': ['pricePerDay'],
      'mileage': ['mileage'],
      'rentalStartDate': ['rentalStartDate'],
      'rentalEndDate': ['rentalEndDate'],
      'licensePlate': ['licensePlate'],
      'color': ['color'],
    },
    
    // Filter behavior props
    autoApply: false,
    showBadges: true,
    defaultRangeExpanded: false,
    showInitialCount: true,
  },
  
  // Sort configuration for table header sort buttons
  sortConfig: [
    { key: 'model', label: 'Model' },
    { key: 'make', label: 'Make' },
    { key: 'year', label: 'Year' },
    { key: 'status', label: 'Status' },
    { key: 'location', label: 'Location' },
    { key: 'mileage', label: 'Mileage' },
    { key: 'pricePerDay', label: 'Price Per Day' },
    { key: 'rentalStartDate', label: 'Rental Start Date' },
    { key: 'rentalEndDate', label: 'Rental End Date' },
    { key: 'licensePlate', label: 'License Plate' },
    { key: 'color', label: 'Color' },
    { key: 'licensePlate', label: 'License Plate' },
    { key: 'color', label: 'Color' },
    { key: 'licensePlate', label: 'License Plate' },
  ],
}

/**
 * Table Configuration (Combined)
 * Combines display and header configs for backward compatibility
 */
export const tableConfig: TableConfig<RentalCarTableItem> = {
  ...tableDisplayConfig,
  ...tableHeaderConfig,
}

