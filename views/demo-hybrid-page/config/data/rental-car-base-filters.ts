/**
 * Base filter definitions for facets + server filter option generation.
 *
 * Used by `getFilterOptionsServer` / cached loaders. Options are filled at runtime.
 * Display chrome (icons, FiltersHeader layout) lives under `config/ui/`.
 */

import type { FilterConfig } from '@/platform/url-kit/filters/feature-filtering/components/filter-types'

/**
 * showOptionSearch: only for multi/single-select when rendered as DropdownFilter.
 * defaultRangeExpanded / quickSelectOptionsExpanded: DropdownFilter range UX defaults.
 */
export const rentalCarBaseFilters: FilterConfig[] = [
  {
    key: 'model',
    label: 'Model',
    type: 'multi-select',
  },
  {
    key: 'status',
    label: 'Status',
    type: 'multi-select',
  },
  {
    key: 'make',
    label: 'Make',
    type: 'multi-select',
  },
  {
    key: 'location',
    label: 'Location',
    type: 'multi-select',
  },
  {
    key: 'year',
    label: 'Year',
    type: 'number-range',
    showQuickSelect: true,
    defaultRangeExpanded: true,
    quickSelectOptionsExpanded: false,
  },
  {
    key: 'pricePerDay',
    label: 'Price Per Day',
    type: 'number-range',
    showQuickSelect: true,
    defaultRangeExpanded: false,
    quickSelectOptionsExpanded: true,
  },
  {
    key: 'mileage',
    label: 'Mileage',
    type: 'number-range',
    showQuickSelect: true,
  },
  {
    key: 'rentalStartDate',
    label: 'Rental Start Date',
    type: 'date-range',
    showQuickSelect: true,
    quickSelectType: 'unique',
    defaultRangeExpanded: false,
    quickSelectOptionsExpanded: false,
  },
  {
    key: 'rentalEndDate',
    label: 'Rental End Date',
    type: 'date-range',
    showQuickSelect: true,
    quickSelectType: 'unique',
    defaultRangeExpanded: true,
  },
  {
    key: 'color',
    label: 'Color',
    type: 'multi-select',
    showOptionSearch: false,
  },
  {
    key: 'licensePlate',
    label: 'License Plate',
    type: 'multi-select',
  },
]
