/**
 * Rental Car Filter Configuration
 * 
 * Purpose: Centralized configuration for rental car filters
 * Used in: API routes and server functions that need rental car filter options
 * Why: Single source of truth for rental car filter configs, data, and field mappings
 * 
 * Filter Configuration Layers:
 * 1. API/Data Layer: rentalCarBaseFilters
 *    - Used by API routes and server functions (get-filter-options-server.ts)
 *    - Defines all available filters for data processing
 *    - what is here will be also used to be enabled as filters in the layers below.
 * 
 * 2. Filter buttons Layer (above table): rentalCarFiltersHeaderConfig
 *    - Controls FiltersHeader component (filter rows above table display)
 * 
 * 3. Table Header Layer: tableConfig.headerFilters / subheadingsConfig.headerFilters
 * is another way of displaying filters and related to the displays themselves thus are in the display config files not here.
 *    - Controls which filters appear in table column headers
 *    - Configured separately in table-config.ts or subheadings-config.ts
 */

import { rentalCars } from "./lib/data-source"
import type { RentalCarTableItem } from '../types/rental-car-table-item'
import type { FilterConfig } from "../../ui/filters/feature-filtering/components/filter-types"
import type { SearchConfig } from "../../ui/filters/feature-filtering/components/search-types"
import type { PaginationConfig } from "../../ui/filters/feature-pagination/types"
import type { FiltersHeaderConfig } from "../../ui/filters/components/filters-header-config"
import { 
  Car, 
  MapPin, 
  Calendar,
  DollarSign,
  Gauge,
  Calendar as CalendarIcon
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

//////////////////////////////////
// Field Mapping
//////////////////////////////////

/**
 * Field mapping for rental car filters
 * WHY: Maps filter configuration keys to actual rental car data fields
 * HOW: Object mapping filter key strings to rental car property keys
 */
export const rentalCarFieldMap: Record<string, keyof RentalCarTableItem> = {
  model: "model",
  status: "status",
  make: "make",
  location: "location",
  year: "year",
  pricePerDay: "pricePerDay",
  mileage: "mileage",
  rentalStartDate: "rentalStartDate",
  rentalEndDate: "rentalEndDate",
  color: "color",
  licensePlate: "licensePlate",
}

//////////////////////////////////
// Base Filter Configurations
//////////////////////////////////

/**
 * Base filter configurations for rental cars
 * WHY: Centralized filter configs used by both API and server function
 * HOW: Array of FilterConfig objects without options (populated dynamically)
 *
 * showOptionSearch: only for multi/single-select when rendered as DropdownFilter (e.g. filterType dropdown-2).
 * false hides the in-dropdown search bar for that filter; omit or true shows it.
 *
 * defaultRangeExpanded: date/number range “Filter by range” open on first open (DropdownFilter).
 * quickSelectOptionsExpanded: false = quick select values behind “Quick select options” until expanded; omit/true = list visible.
 */
export const rentalCarBaseFilters: FilterConfig[] = [
  { 
    key: "model",
    label: "Model",
    type: "multi-select",
    // showOptionSearch: false,
  },
  {
    key: "status",
    label: "Status",
    type: "multi-select",
  },
  {
    key: "make",
    label: "Make",
    type: "multi-select",
    // showOptionSearch: false,
  },
  {
    key: "location",
    label: "Location",
    type: "multi-select",
  },
  {
    key: "year",
    label: "Year",
    type: "number-range",
    showQuickSelect: true,
    defaultRangeExpanded: true,
    quickSelectOptionsExpanded: false,
  },
  {
    key: "pricePerDay",
    label: "Price Per Day",
    type: "number-range",
    showQuickSelect: true,
    defaultRangeExpanded: false,
    quickSelectOptionsExpanded: true,
  },
  {
    key: "mileage",
    label: "Mileage",
    type: "number-range",
    showQuickSelect: true,
  },
  {
    key: "rentalStartDate",
    label: "Rental Start Date",
    type: "date-range",
    showQuickSelect: true,
    quickSelectType: "unique",
    defaultRangeExpanded: false,
    quickSelectOptionsExpanded: false,
  },
  {
    key: "rentalEndDate",
    label: "Rental End Date",
    type: "date-range",
    showQuickSelect: true,
    quickSelectType: "unique",
    defaultRangeExpanded: true,
  },
  {
    key: "color",
    label: "Color",
    type: "multi-select",
    showOptionSearch: false,
  },
  {
    key: "licensePlate",
    label: "License Plate",
    type: "multi-select",
  },
]

//////////////////////////////////
// Icon Configuration
//////////////////////////////////

/**
 * Icon mapping for rental car filters
 * WHY: Provides icons for each filter to display in FilterBoxButton
 * HOW: Maps filter keys to Lucide icon components
 */
export const rentalCarFilterIcons: Record<string, LucideIcon> = {
  status: Car,
  make: Car,
  location: MapPin,
  year: Calendar,
  pricePerDay: DollarSign,
  mileage: Gauge,
  rentalStartDate: CalendarIcon,
}

//////////////////////////////////
// Search Configuration
//////////////////////////////////

/**
 * Search configuration for rental cars, shared by header filters and minimal controls
 * WHY: Defines which fields are searchable and search behavior
 * HOW: Specifies fields to search across and placeholder text
 */
export const rentalCarSearchConfig: SearchConfig<RentalCarTableItem> = {
  searchableFields: ["model", "make", "location", "licensePlate"],
  placeholder: "Search cars by model, make, location, or license plate...",
  minLength: 0, // Search immediately (no minimum length requirement)
}

//////////////////////////////////
// Pagination Configuration
//////////////////////////////////

/**
 * Pagination configuration for rental car pages
 * WHY: Define default page size and available options
 * HOW: Used by pagination hook and components
 */
export const rentalCarPaginationConfig: PaginationConfig = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 20, 50, 100],
  allowPageSizeChange: true
}

//////////////////////////////////
// Filters Header Configuration
//////////////////////////////////

/**
 * Filters header configuration for rental cars page
 * WHY: Controls which filter rows are displayed and their behavior
 * HOW: Defines filter type, search visibility, date select, and column options
 */
export const rentalCarFiltersHeaderConfig: FiltersHeaderConfig = {
  filterType: 'pill', // available types: dropdown-1, dropdown-2, pill
  showSearch: true,
  //////////////////////////////////////////////////////////////
  showColumnOptions: true, // Key Options Buttons
  columnOptionsKey: 'status', // Key to use for column options
  //////////////////////////////////////////////////////////////
  showIndependentDateSelect: true, // Not used for dropdown-2 (designed for the pill filter)
  enabledFilterKeys: ['status', 'make', 'location'], // Only show these 3 filters
}

//////////////////////////////////
// Data Source Exports
//////////////////////////////////

/**
 * Export rental car data source
 * WHY: Single import point for both config and data
 * HOW: Re-export from data-source.ts
 */
// In production you’d drop that re-export and keep data behind APIs only.
export { rentalCars }
export type { RentalCarTableItem } from '../types/rental-car-table-item'
