/**
 * FiltersSection
 *
 * Purpose: Async RSC — loads facet config via `getFilters` (cached); wrapped in `<Suspense>` from `demo-rsc-index`.
 * Why: Filter strip can stream independently of the table island.
 */

import { FiltersHeader } from '@/platform/url-kit/filters/components/filters-header'
import { NlFilterAssistant } from '@/platform/url-kit/ai-filter/components/nl-filter-assistant'
import { serializeFiltersForNlCatalog } from '@/platform/url-kit/ai-filter/lib/serialize-filter-catalog-for-nl'
import {
  NL_FILTER_ALLOWED_SORT_KEYS,
  NL_FILTER_EXCLUDED_URL_KEYS,
} from '@/views/demo-rsc-page/config/data/nl-filter-assistant-config'
import { rentalCarSearchConfig } from '../../config/data/rental-car-search-config'
import { rentalCarFiltersHeaderConfig } from '../../config/ui/rental-car-filters-header-config'
import type { DemoRscPageSearchParams } from '@/app/(root)/demo-rsc-page/page'
import { getFilters } from '../../../../entities/cars-rsc/server/demo-rsc-cached-loaders'
import { demoRscDataParamsToCacheKey } from '../../lib/demo-rsc-search-params-cache-key'

export default async function FiltersSection({
  params,
}: {
  params: DemoRscPageSearchParams
}) {

  // remove UI keys from the cache key to avoid re-rendering when triggering the drawer or filters.
  const filters = await getFilters(demoRscDataParamsToCacheKey(params))
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
