/**
 * Desktop filter-toolbar layout (one row):
 * [filter] [group]  [search……] ---- [label filters] [view] [date]
 */

'use client'

import { cn } from '@/shared/lib/utils'
import { FILTER_TOOLBAR_PANEL_SURFACE_CLASS } from '../config/chrome'
import type { FilterToolbarLayoutProps } from './filter-toolbar-layout-types'
import { FilterControl } from './filter-control/filter-control'
import { GroupControl } from './group-control/group-control'
import { SearchControl } from './search-control/search-control'
import { LabelFilters } from './label-filters'
import { ViewControl } from './view-control/view-control'
import { DateControl } from './date-control/date-control'

export function FilterToolbarDesktop({
  displayedFilters,
  filters,
  searchConfig,
  showInitialCount,
  groupableFields,
  groupBy,
  subGroupBy,
  setGroupBy,
  setSubGroupBy,
  currentView,
  setView,
  groupingSupportedViews,
  resolvedLabelKey,
  labelSelectType,
  availableViews,
  dateFilterKey,
  dateFilterLabel,
  dateFilterButtonText,
  className,
}: FilterToolbarLayoutProps) {
  return (
    <div
      className={cn(
        'hidden w-full flex-wrap items-center gap-2 px-2 py-2 md:flex',
        className
      )}
    >
      <div className="flex shrink-0 items-center gap-1">
        <FilterControl
          filters={displayedFilters}
          showInitialCount={showInitialCount}
          panelClassName={FILTER_TOOLBAR_PANEL_SURFACE_CLASS}
          panelAlign="start"
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
