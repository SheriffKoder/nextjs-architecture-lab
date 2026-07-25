/**
 * Minimal Controls Configuration
 * 
 * Purpose: Configuration for minimal controls (grouping, sorting, filtering) in FilteringWrapper
 * Used in: demo-rsc-content.tsx
 * Why: Centralizes all minimal control configurations in one place
 * 
 * Note: 
 * - If availableColumnsForGrouping is not provided, all eligible columns will be available for grouping
 * - availableViews is passed separately to FilteringWrapper (not in this config)
 *   See: features/filtering-wrapper-multi-display-clean/filtering-wrapper.tsx
 *   Reason: availableViews is a core component configuration that affects entire wrapper behavior,
 *           not just minimal controls, so it's kept separate for better separation of concerns
 */

import type { RentalCarTableItem } from '@/entities/cars-rsc/types/rental-car-table-item'
import type { SortConfig } from '@/platform/url-kit/filters/feature-sorting/types'
import type { FilterField } from '@/platform/url-kit/filters/feature-query-builder-filter/types/field'
import type { SearchConfig } from '@/platform/url-kit/filters/feature-filtering/components/search-types'
import {
  RENTAL_CAR_SEARCH_MIN_LENGTH,
  RENTAL_CAR_SEARCH_PLACEHOLDER,
  RENTAL_CAR_SEARCHABLE_FIELDS,
} from '../contract/rental-car-search-fields'

/** Built from `contract/rental-car-search-fields` — do not import `config/data`. */
const rentalCarSearchConfig: SearchConfig<RentalCarTableItem> = {
  searchableFields: RENTAL_CAR_SEARCHABLE_FIELDS,
  placeholder: RENTAL_CAR_SEARCH_PLACEHOLDER,
  minLength: RENTAL_CAR_SEARCH_MIN_LENGTH,
}

//////////////////////////////////
// Sort Configuration
//////////////////////////////////

/**
 * Sort configuration for rental car fields
 * WHY: Defines which fields can be sorted and their display labels
 * HOW: Array of SortConfig objects with key and label
 */
const rentalCarSortConfig: SortConfig[] = [
  { key: "model", label: "Model" },
  { key: "make", label: "Make" },
  { key: "year", label: "Year" },
  { key: "status", label: "Status" },
  { key: "location", label: "Location" },
  { key: "pricePerDay", label: "Price Per Day" },
  { key: "mileage", label: "Mileage" },
  { key: "rentalStartDate", label: "Rental Start Date" },
  { key: "rentalEndDate", label: "Rental End Date" },
]

//////////////////////////////////
// Query Builder Configuration
//////////////////////////////////

/**
 * Query builder field configuration for rental cars
 * WHY: Defines which fields are available in the query builder dropdown
 * HOW: Array of FilterField objects with key, label, and type
 */
const rentalCarQueryBuilderFields: FilterField[] = [
  { key: "model", label: "Model", type: "text" },
  { key: "make", label: "Make", type: "text" },
  { key: "year", label: "Year", type: "number" },
  { key: "status", label: "Status", type: "text" },
  { key: "location", label: "Location", type: "text" },
  { key: "pricePerDay", label: "Price Per Day", type: "number" },
  { key: "mileage", label: "Mileage", type: "number" },
  { key: "rentalStartDate", label: "Rental Start Date", type: "date" },
]

//////////////////////////////////
// Minimal Controls Configuration
//////////////////////////////////

/**
 * Minimal controls configuration for rental cars
 * Consolidates grouping, sorting, and query builder configurations
 */
export const minimalControlsConfig = {
  // Columns available for grouping
  // Leave empty to allow all columns for grouping
  // Or specify specific columns: availableColumnsForGrouping: ['status', 'make', 'location']
  availableColumnsForGrouping: ['status', 'make', 'location'],
  
  // Sort configuration for SortingControl component
  // Used across all views (table, list, subheadings)
  sortConfig: rentalCarSortConfig,
  
  // Query builder fields for advanced filtering
  queryBuilderFields: rentalCarQueryBuilderFields,
  
  // Search configuration for ExpandableSearchControl component
  // Used across all views (table, list, subheadings)
  searchConfig: rentalCarSearchConfig,
}
