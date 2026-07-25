/**
 * FilterToolbar — one-row chrome:
 * [filter] [group]  [search……] ---- [label filters] [view] [date]
 *
 * Decoupled from FiltersHeader / MinimalControls. Owns its own URL hooks + chrome.
 * Only reuses low-level filter engines (pill panel pieces, SearchBar, FilterOptionsButtons, date dropdown).
 */

'use client'

import { Suspense } from 'react'
import { cn } from '@/shared/lib/utils'
import type { FilterToolbarProps } from '../model/types'
import {
  DEFAULT_GROUPING_SUPPORTED_VIEWS,
  FILTER_TOOLBAR_PANEL_SURFACE_CLASS,
} from '../config/chrome'
import { useUrlGrouping } from '../hooks/use-url-grouping'
import { useViewResolution } from '../hooks/use-view-resolution'
import { FilterControl } from './filter-control/filter-control'
import { GroupControl } from './group-control/group-control'
import { SearchControl } from './search-control/search-control'
import { LabelFilters } from './label-filters'
import { ViewControl } from './view-control/view-control'
import { DateControl } from './date-control/date-control'

export type { FilterToolbarProps }

function FilterToolbarInner({
  filters,
  searchConfig,
  labelFilterKey,
  labelSelectType = 'single-select',
  dateFilterKey = 'rentalStartDate',
  dateFilterButtonText,
  groupableFields = [],
  groupingSupportedViews = DEFAULT_GROUPING_SUPPORTED_VIEWS,
  availableViews = [],
  defaultView,
  useAllItems,
  defaultPageSize = 10,
  enabledFilterKeys,
  showInitialCount = false,
  className,
}: FilterToolbarProps) {
  const displayedFilters = enabledFilterKeys
    ? filters.filter((f) => enabledFilterKeys.includes(f.key))
    : filters

  const allowedKeys = groupableFields.map((f) => f.key)
  const { groupBy, subGroupBy, setGroupBy, setSubGroupBy } = useUrlGrouping({
    allowedKeys,
  })

  const { currentView, setView } = useViewResolution({
    availableViews,
    defaultView,
    useAllItems,
    defaultPageSize,
  })

  const resolvedLabelKey =
    labelFilterKey ||
    displayedFilters[0]?.key ||
    filters[0]?.key ||
    ''

  const dateFilterLabel =
    dateFilterKey
      ? filters.find((f) => f.key === dateFilterKey)?.label
      : undefined

  return (
    <div
      className={cn(
        'flex w-full flex-wrap items-center gap-2 px-2 py-2',
        className
      )}
    >
      <div className="flex shrink-0 items-center gap-1">
        <FilterControl
          filters={displayedFilters}
          showInitialCount={showInitialCount}
          panelClassName={FILTER_TOOLBAR_PANEL_SURFACE_CLASS}
        />
        {groupableFields.length > 0 && (
          <GroupControl
            fields={groupableFields}
            selectedGroupBy={groupBy}
            selectedSubGroupBy={subGroupBy}
            onGroupByChange={setGroupBy}
            onSubGroupByChange={setSubGroupBy}
            currentView={currentView}
            groupingSupportedViews={groupingSupportedViews}
          />
        )}
      </div>

      <SearchControl config={searchConfig} />

      <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-2">
        {resolvedLabelKey ? (
          <LabelFilters
            filterKey={resolvedLabelKey}
            filterOptions={filters}
            selectType={labelSelectType}
            showInitialCount={showInitialCount}
          />
        ) : null}
        {availableViews.length > 0 ? (
          <ViewControl
            availableViews={availableViews}
            currentView={currentView}
            onViewChange={setView}
          />
        ) : null}
        {dateFilterKey ? (
          <DateControl
            filterKey={dateFilterKey}
            filterLabel={dateFilterLabel}
            buttonText={dateFilterButtonText}
            panelClassName={FILTER_TOOLBAR_PANEL_SURFACE_CLASS}
          />
        ) : null}
      </div>
    </div>
  )
}

export function FilterToolbar(props: FilterToolbarProps) {
  return (
    <Suspense
      fallback={
        <div className="h-10 w-full animate-pulse rounded-md bg-muted/40 px-2" />
      }
    >
      <FilterToolbarInner {...props} />
    </Suspense>
  )
}
