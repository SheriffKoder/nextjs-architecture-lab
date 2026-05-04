/**
 * FiltersSection
 *
 * Purpose: Async RSC boundary that loads filter facet options only (not list payload)
 * Used in: `demo-rsc-index.tsx` inside `<Suspense>`
 */

import { FiltersHeader } from '@/features/ui/filters/components/filters-header'
import {
  rentalCarSearchConfig,
  rentalCarFiltersHeaderConfig,
  rentalCarBaseFilters,
} from '../config/header-filters-config'
import { getFilterOptionsServer } from '../utils/server/get-filter-options-server'
import type { DemoRscPageSearchParams } from '@/app/(root)/demo-rsc-page/page'

export default async function FiltersSection({
  params,
}: {
  params: DemoRscPageSearchParams
}) {
  const filters = await getFilterOptionsServer(rentalCarBaseFilters, params)

  return (
    <div className="shrink-0">
      <FiltersHeader
        filters={filters}
        searchConfig={rentalCarSearchConfig}
        config={rentalCarFiltersHeaderConfig}
        dateFilterKey="rentalStartDate"
        dateFilterButtonText="Filter by Rental Start Date"
        dateFilterWidth="300px"
      />
    </div>
  )
}
