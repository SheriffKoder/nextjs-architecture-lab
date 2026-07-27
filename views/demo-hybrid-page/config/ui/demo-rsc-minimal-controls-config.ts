/**
 * Demo RSC — config for url-kit `MinimalControls` (filters island).
 * availableViews / defaultView / useAllItems come from `config/data/demo-rsc-views-config`.
 * defaultGroupsExpanded comes from `config/data/demo-rsc-grouping-config`.
 */

import type { MinimalControlsConfig } from '@/platform/url-kit/minimal-controls'
import type { RentalCarTableItem } from '@/entities/demo-hybrid-cars/model/rental-car-table-item'
import type { SortConfig } from '@/platform/url-kit/filters/feature-sorting/types'
import type { FilterField } from '@/platform/url-kit/filters/feature-query-builder-filter/types/field'
import type { SearchConfig } from '@/platform/url-kit/filters/feature-filtering/components/search-types'
import {
  DEMO_RSC_AVAILABLE_VIEWS,
  DEMO_RSC_DEFAULT_VIEW,
  DEMO_RSC_USE_ALL_ITEMS_VIEWS,
} from '../data/demo-rsc-views-config'
import {
  RENTAL_CAR_SEARCH_MIN_LENGTH,
  RENTAL_CAR_SEARCH_PLACEHOLDER,
  RENTAL_CAR_SEARCHABLE_FIELDS,
} from '../contract/rental-car-search-fields'

/** Re-export so consumers can import views + grouping + minimal controls from one place if desired. */
export {
  DEMO_RSC_AVAILABLE_VIEWS,
  DEMO_RSC_DEFAULT_VIEW,
  DEMO_RSC_USE_ALL_ITEMS_VIEWS,
} from '../data/demo-rsc-views-config'

export { DEMO_RSC_DEFAULT_GROUPS_EXPANDED } from '../data/demo-rsc-grouping-config'

const rentalCarSearchConfig: SearchConfig<RentalCarTableItem> = {
  searchableFields: RENTAL_CAR_SEARCHABLE_FIELDS,
  placeholder: RENTAL_CAR_SEARCH_PLACEHOLDER,
  minLength: RENTAL_CAR_SEARCH_MIN_LENGTH,
}

const rentalCarSortConfig: SortConfig[] = [
  { key: 'model', label: 'Model' },
  { key: 'make', label: 'Make' },
  { key: 'year', label: 'Year' },
  { key: 'status', label: 'Status' },
  { key: 'location', label: 'Location' },
  { key: 'pricePerDay', label: 'Price Per Day' },
  { key: 'mileage', label: 'Mileage' },
  { key: 'rentalStartDate', label: 'Rental Start Date' },
  { key: 'rentalEndDate', label: 'Rental End Date' },
]

const rentalCarQueryBuilderFields: FilterField[] = [
  { key: 'model', label: 'Model', type: 'text' },
  { key: 'make', label: 'Make', type: 'text' },
  { key: 'year', label: 'Year', type: 'number' },
  { key: 'status', label: 'Status', type: 'text' },
  { key: 'location', label: 'Location', type: 'text' },
  { key: 'pricePerDay', label: 'Price Per Day', type: 'number' },
  { key: 'mileage', label: 'Mileage', type: 'number' },
  { key: 'rentalStartDate', label: 'Rental Start Date', type: 'date' },
]

export const demoRscMinimalControlsConfig: MinimalControlsConfig = {
  availableViews: [...DEMO_RSC_AVAILABLE_VIEWS],
  defaultView: DEMO_RSC_DEFAULT_VIEW,
  useAllItems: DEMO_RSC_USE_ALL_ITEMS_VIEWS,
  defaultPageSize: 10,
  groupableFields: [
    { key: 'status', label: 'Status' },
    { key: 'make', label: 'Make' },
    { key: 'location', label: 'Location' },
  ],
  sortConfig: rentalCarSortConfig,
  queryBuilderFields: rentalCarQueryBuilderFields,
  searchConfig: rentalCarSearchConfig,
}

export const DEMO_RSC_GROUPING_ALLOWED_KEYS =
  demoRscMinimalControlsConfig.groupableFields?.map((f) => f.key) ?? []
