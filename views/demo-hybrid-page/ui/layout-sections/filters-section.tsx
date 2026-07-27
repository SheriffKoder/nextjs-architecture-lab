/**
 * FiltersSection — hybrid client mirror of RSC filters island.
 *
 * Purpose: Same chrome composition as `views/demo-rsc-page/ui/layout-sections/filters-section.tsx`
 * Why: Uncomment blocks to enable optional controls; imports stay `@/platform/url-kit/*`
 * Transport: `ShallowUrlProvider` at page root (not here).
 */

'use client'

import { FiltersHeader } from '@/platform/url-kit/filters/components/filters-header'
import { FilterToolbar } from '@/platform/url-kit/filter-toolbar'
import { MinimalControls } from '@/platform/url-kit/minimal-controls'
import { ViewSwitcherWrapper } from '@/platform/url-kit/view-switchers'
import { NlFilterAssistant } from '@/platform/url-kit/ai-filter/components/nl-filter-assistant'
import { serializeFiltersForNlCatalog } from '@/platform/url-kit/ai-filter/lib/serialize-filter-catalog-for-nl'
import type { FilterConfig } from '@/platform/url-kit/filters/feature-filtering/components/filter-types'
import {
  NL_FILTER_ALLOWED_SORT_KEYS,
  NL_FILTER_EXCLUDED_URL_KEYS,
} from '@/views/demo-hybrid-page/config/data/nl-filter-assistant-config'
import {
  DEMO_RSC_AVAILABLE_VIEWS,
  DEMO_RSC_DEFAULT_VIEW,
  DEMO_RSC_USE_ALL_ITEMS_VIEWS,
} from '@/views/demo-hybrid-page/config/data/demo-rsc-views-config'
import { rentalCarSearchConfig } from '../../config/data/rental-car-search-config'
import { rentalCarFiltersHeaderConfig } from '../../config/ui/rental-car-filters-header-config'
import { demoRscMinimalControlsConfig } from '../../config/ui/demo-rsc-minimal-controls-config'
import { DEMO_RSC_PLACEHOLDER_MARQUEE } from '../../config/ui/demo-rsc-filter-toolbar-config'

type DemoHybridFiltersSectionProps = {
  filters: FilterConfig[]
}

export function DemoHybridFiltersSection({
  filters,
}: DemoHybridFiltersSectionProps) {
  const nlCatalog = serializeFiltersForNlCatalog(filters)

  return (
    <div className="shrink-0 space-y-2">

      {/* <FiltersHeader
        filters={filters}
        searchConfig={rentalCarSearchConfig}
        config={rentalCarFiltersHeaderConfig}
        dateFilterKey="rentalStartDate"
        dateFilterButtonText="Filter by Rental Start Date"
        dateFilterWidth="300px"
      /> */}
      {/* <div className="w-full px-2">
        <ViewSwitcherWrapper
          availableViews={DEMO_RSC_AVAILABLE_VIEWS}
          defaultView={DEMO_RSC_DEFAULT_VIEW}
          useAllItems={DEMO_RSC_USE_ALL_ITEMS_VIEWS}
          defaultPageSize={10}
        />
      </div> */}
      {/* <MinimalControls {...demoRscMinimalControlsConfig} /> */}
      <FilterToolbar
        filters={filters}
        searchConfig={rentalCarSearchConfig}
        labelFilterKey={rentalCarFiltersHeaderConfig.columnOptionsKey ?? 'status'}
        labelSelectType="single-select"
        dateFilterKey="rentalStartDate"
        dateFilterButtonText="Filter by Rental Start Date"
        groupableFields={demoRscMinimalControlsConfig.groupableFields}
        availableViews={demoRscMinimalControlsConfig.availableViews}
        defaultView={demoRscMinimalControlsConfig.defaultView}
        useAllItems={demoRscMinimalControlsConfig.useAllItems}
        defaultPageSize={demoRscMinimalControlsConfig.defaultPageSize}
        enabledFilterKeys={rentalCarFiltersHeaderConfig.enabledFilterKeys}
        placeholderMarquee={DEMO_RSC_PLACEHOLDER_MARQUEE}
        showInitialCount
      />

      {/* <NlFilterAssistant
        catalog={nlCatalog}
        assistantConfig={{
          excludedUrlKeys: NL_FILTER_EXCLUDED_URL_KEYS,
          allowedSortKeys: NL_FILTER_ALLOWED_SORT_KEYS,
          domainDescription: 'rental car inventory on the demo hybrid page',
          keysToClearOnFullReset: ['q'],
        }}
        apiPath="/api/nl-filters/cars"
        placeholder='Describe what you want to see'
        className='w-full max-w-xl'
      /> */}
    </div>
  )
}
