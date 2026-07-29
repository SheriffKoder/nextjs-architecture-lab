/**
 * FiltersSection — hybrid client filter toolbar.
 *
 * Transport: `ShallowUrlProvider` at page root (not here).
 */

'use client'

import { FilterToolbar } from '@/platform/url-kit/filter-toolbar'
import type { FilterConfig } from '@/platform/url-kit/filters/feature-filtering/components/filter-types'
import { rentalCarSearchConfig } from '../../config/data/rental-car-search-config'
import {
  demoRscFilterToolbarConfig,
  DEMO_RSC_PLACEHOLDER_MARQUEE,
} from '../../config/ui/demo-rsc-filter-toolbar-config'

type DemoHybridFiltersSectionProps = {
  filters: FilterConfig[]
}

export function DemoHybridFiltersSection({
  filters,
}: DemoHybridFiltersSectionProps) {
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
