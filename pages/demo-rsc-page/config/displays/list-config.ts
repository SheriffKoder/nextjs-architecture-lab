/**
 * List View Configuration
 * 
 * Purpose: Configuration for list (grouped table) view of rental cars
 * Used in: demo-rsc-content.tsx
 * Why: Groups rental cars in a list format with collapsible groups
 */

import type { RentalCarTableItem } from '../../../../features/cars-rsc/types/rental-car-table-item'
import type { TableConfig, HeaderFilterConfig } from '@/features/multi-view/types'
import { demoRscEditableColumnKeys } from '../cells/rental-car-location-options'
import { demoRscRowHighlighting, demoRscRowStyler } from '../row-highlighting'
import type { GroupConfig } from '@/features/multi-view/features/virtualized-list/utils/grouping-utils'
import type { SortConfig } from '@/features/url-kit/filters/feature-sorting/types'

////////////////////////////////////
// List Display Configuration
////////////////////////////////////

/**
 * List Display Configuration
 * Controls display properties like row height, dynamic sizing, loading states, etc.
 * Separate from table display config to allow different settings for list view
 */
export const listDisplayConfig: TableConfig<RentalCarTableItem> = {
  // Row height configuration
  rowHeight: 30,                     // Fixed row height in pixels
  minRowHeight: 30,                  // Minimum row height for dynamic rows
  
  // Display configuration
  dynamicRowHeight: true,            // Enable variable row heights for list
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
  editableColumns: [...demoRscEditableColumnKeys],
  
  // Styling configuration
  groupStylerConfig: undefined,     // No custom group styling
  rowStyler: demoRscRowStyler,
  rowHighlighting: demoRscRowHighlighting,
  
  // Header configuration
  transparentHeader: false,          // Header does not become transparent on scroll
}

////////////////////////////////////
// List Grouping Configuration
////////////////////////////////////

/**
 * List Grouping Configuration
 * Controls how items are grouped in the list view
 */
export const listGroupingConfig: GroupConfig = {
  // groupBy: 'status', // Primary grouping by status
  // subGroupBy: undefined, // No secondary grouping
  groupKeyFormatter: (value) => {
    // Format status values for display
    const statusMap: Record<string, string> = {
      'available': 'Available',
      'rented': 'Rented',
      'maintenance': 'Maintenance',
      'reserved': 'Reserved',
    }
    return statusMap[value as string] || String(value)
  },
  subGroupKeyFormatter: undefined, // No sub-grouping
  groupSpacing: 16, // 16px spacing between groups
}

////////////////////////////////////
// List Header Configuration
////////////////////////////////////

/**
 * List Header Configuration
 * Controls filters and sort buttons in table column headers
 */
export const listHeaderConfig = {
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
  ] as SortConfig[],
}

////////////////////////////////////
// List Configuration (Combined)
////////////////////////////////////

/**
 * List Configuration (Combined)
 * Combines display, grouping, and header configs
 */
export const listViewConfig = {
  ...listDisplayConfig,
  ...listGroupingConfig,
  ...listHeaderConfig,
}
