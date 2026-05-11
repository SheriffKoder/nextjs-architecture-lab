/**
 * FiltersSection
 *
 * Purpose: Async RSC boundary that loads filter facet options only (not list payload)
 * Used in: `demo-rsc-index.tsx` inside `<Suspense>`
 */

import { FiltersHeader } from '@/features/ui/filters/components/filters-header'
import { NlFilterAssistant } from '@/features/ui/ai-filter/components/nl-filter-assistant'
import { serializeFiltersForNlCatalog } from '@/features/ui/ai-filter/lib/serialize-filter-catalog-for-nl'
import {
  NL_FILTER_ALLOWED_SORT_KEYS,
  NL_FILTER_EXCLUDED_URL_KEYS,
} from '@/features/demo-rsc-page/config/nl-filter-assistant-config'
import {
  rentalCarSearchConfig,
  rentalCarFiltersHeaderConfig,
  rentalCarBaseFilters,
} from '../../config/header-filters-config'
import { getFilterOptionsServer } from '../../utils/server/get-filter-options-server'
import type { DemoRscPageSearchParams } from '@/app/(root)/demo-rsc-page/page'

export default async function FiltersSection({
  params,
}: {
  params: DemoRscPageSearchParams
}) {
  const filters = await getFilterOptionsServer(rentalCarBaseFilters, params)
  const nlCatalog = serializeFiltersForNlCatalog(filters)

  return (
    <div className="shrink-0 space-y-2">
      <FiltersHeader
        filters={filters}
        searchConfig={rentalCarSearchConfig}
        config={rentalCarFiltersHeaderConfig}
        dateFilterKey="rentalStartDate"
        dateFilterButtonText="Filter by Rental Start Date"
        dateFilterWidth="300px"
      />
      <NlFilterAssistant
        catalog={nlCatalog}
        assistantConfig={{
          excludedUrlKeys: NL_FILTER_EXCLUDED_URL_KEYS,
          allowedSortKeys: NL_FILTER_ALLOWED_SORT_KEYS,
          domainDescription: 'rental car inventory on the demo RSC page',
          keysToClearOnFullReset: ['q'],
        }}
        apiPath="/api/nl-filters/cars"
        placeholder='Describe what you want to see'
        className='w-full max-w-xl'
      />
    </div>
  )
}
