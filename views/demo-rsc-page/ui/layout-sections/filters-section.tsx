/**
 * FiltersSection — RSC filter toolbar island.
 */

import { FilterToolbar } from '@/platform/url-kit/filter-toolbar'
import { rentalCarSearchConfig } from '../../config/data/rental-car-search-config'
import {
  demoRscFilterToolbarConfig,
  DEMO_RSC_PLACEHOLDER_MARQUEE,
} from '../../config/ui/demo-rsc-filter-toolbar-config'
import type { DemoRscPageSearchParams } from '@/app/(root)/demo-rsc-page/page'
import { getFilters } from '../../../../entities/cars-rsc/server/demo-rsc-cached-loaders'
import { demoRscDataParamsToCacheKey } from '../../lib/demo-rsc-search-params-cache-key'

export default async function FiltersSection({
  params,
}: {
  params: DemoRscPageSearchParams
}) {
  const filters = await getFilters(demoRscDataParamsToCacheKey(params))

  return (
    <div className="shrink-0 space-y-2">
      <FilterToolbar
        filters={filters}
        searchConfig={rentalCarSearchConfig}
        labelFilterKey={demoRscFilterToolbarConfig.labelFilterKey ?? 'status'}
        labelSelectType="single-select"
        dateFilterKey="rentalStartDate"
        dateFilterButtonText="Filter by Rental Start Date"
        groupableFields={demoRscFilterToolbarConfig.groupableFields}
        availableViews={demoRscFilterToolbarConfig.availableViews}
        defaultView={demoRscFilterToolbarConfig.defaultView}
        useAllItems={demoRscFilterToolbarConfig.useAllItems}
        defaultPageSize={demoRscFilterToolbarConfig.defaultPageSize}
        enabledFilterKeys={demoRscFilterToolbarConfig.enabledFilterKeys}
        placeholderMarquee={DEMO_RSC_PLACEHOLDER_MARQUEE}
        showInitialCount
      />
    </div>
  )
}
