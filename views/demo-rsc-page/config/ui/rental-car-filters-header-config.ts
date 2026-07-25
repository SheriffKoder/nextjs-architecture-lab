/**
 * FiltersHeader layout — which filter rows show above the table and how.
 *
 * Does not define base filter types or facet generation; those live in `config/data/`.
 */

import type { FiltersHeaderConfig } from '@/platform/url-kit/filters/components/filters-header-config'

export const rentalCarFiltersHeaderConfig: FiltersHeaderConfig = {
  filterType: 'pill', // available types: dropdown-1, dropdown-2, pill
  showSearch: true,
  showColumnOptions: false,
  columnOptionsKey: 'status',
  showIndependentDateSelect: true, // Not used for dropdown-2 (designed for the pill filter)
  enabledFilterKeys: ['status', 'make', 'location'],
}
