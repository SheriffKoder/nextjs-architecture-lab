/**
 * Subheadings View Configuration
 * 
 * Purpose: Configuration for subheadings (grouped) view of rental cars
 * Used in: demo-rsc-content.tsx
 * Why: Groups rental cars by status with collapsible sections
 */

import type { RentalCarTableItem } from '../../types/rental-car-table-item'
import type { TableConfig, HeaderFilterConfig } from '@/features/filtering-wrapper-multi-display-clean/types'

////////////////////////////////////
// Subheadings Display Configuration
////////////////////////////////////

/**
 * Subheadings Display Configuration
 * Controls display properties like row height, dynamic sizing, loading states, etc.
 * Separate from table display config to allow different settings for subheadings view
 */
export const subheadingsDisplayConfig: TableConfig<RentalCarTableItem> = {
  // Row height configuration
  rowHeight: 40,                     // Fixed row height in pixels (different from table)
  minRowHeight: 40,                  // Minimum row height for dynamic rows

  /** When true, subheadings data rows render without drag grip (see SubHeadingsContainer + DraggableRow). */
  subheadingsDisableRowDrag: false,
  
  // Display configuration
  dynamicRowHeight: true,            // Enable variable row heights for subheadings
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
  
  // Grouping configuration (not used in subheadings - handled by subheadingsGroupingConfig)
  groupBy: undefined,
  subGroupBy: undefined,
  groupKeyFormatter: undefined,
  subGroupKeyFormatter: undefined,
  groupSpacing: undefined,
}

////////////////////////////////////
// Subheadings Grouping Configuration
////////////////////////////////////

/**
 * Subheadings Grouping Configuration
 * Controls how items are grouped in the subheadings view
 */
export const subheadingsGroupingConfig = {
  // Required: Key to group by (defaults to 'status' if not provided)
  columnKey: 'status',
  
  // Optional: Explicit group configuration (shows all groups even if empty)
  // groups: [
  //   { key: 'available', label: 'Available' },
  //   { key: 'rented', label: 'Rented' },
  //   { key: 'maintenance', label: 'Maintenance' },
  //   { key: 'reserved', label: 'Reserved' },
  // ],
  
  // Optional: Callback when drag and drop completes
  subheadingsDragEnd: (updatedData: RentalCarTableItem[]) => {
    console.log('Subheadings drag ended:', updatedData)
    // In real app, this would persist the status change
  },
  
  // Optional: Nested grouping configuration
  // nestedGrouping: {
  //   enabled: boolean,
  //   primaryKey: string,      // Field name for primary grouping (e.g., 'project')
  //   secondaryKey: string,    // Field name for secondary grouping (e.g., 'phase')
  //   separator: string,       // Separator for composite keys (e.g., '|')
  // },
  nestedGrouping: undefined, // No nested grouping for this demo

  /** Per-row drop zones + reducer-driven order; requires `manual_sorting` on rows (see data-source). */
  manualSorting: true,
}

////////////////////////////////////
// Subheadings Header Configuration
////////////////////////////////////

/**
 * Subheadings Header Configuration
 * Controls filters and sort buttons in table column headers
 */
export const subheadingsHeaderConfig = {
  // Header filter configuration
  headerFilters: {
    // Map column keys to filter keys (defaults to column.key if not specified)
    columnToFilterMap: {
      'model': 'model',
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
  } as HeaderFilterConfig,
  
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
  ],
}

////////////////////////////////////
// Subheadings Configuration (Combined)
////////////////////////////////////

/**
 * Subheadings Configuration (Combined)
 * Combines display, grouping, and header configs
 */
export const subheadingsConfig = {
  ...subheadingsDisplayConfig,
  ...subheadingsGroupingConfig,
  ...subheadingsHeaderConfig,
}
