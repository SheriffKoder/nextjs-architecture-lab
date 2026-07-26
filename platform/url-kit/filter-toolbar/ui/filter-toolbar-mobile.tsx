/**
 * Mobile filter-toolbar layout (two rows):
 * Row 1: [search……] ---- [filter] [group] [label] [date]
 * ──────── separator ────────
 * Row 2: [view pills…]
 */

'use client'

import { cn } from '@/shared/lib/utils'
import { FILTER_TOOLBAR_PANEL_SURFACE_CLASS } from '../config/chrome'
import type { FilterToolbarLayoutProps } from './filter-toolbar-layout-types'
import { FilterControl } from './filter-control/filter-control'
import { GroupControl } from './group-control/group-control'
import { SearchControl } from './search-control/search-control'
import { LabelFilters } from './label-filters'
import { ViewPills } from './view-control/view-pills'
import { DateControl } from './date-control/date-control'
import { resolveViewOptions } from './view-control/view-options'

export function FilterToolbarMobile({
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
  const showViewPills = resolveViewOptions(availableViews).length > 1

  return (
    <div className={cn('flex w-full flex-col md:hidden', className)}>
      {/* Row 1 — search + icons */}
      <div className="flex w-full items-center gap-2 px-2 py-2">
        <SearchControl
          config={searchConfig}
          className="min-w-0 max-w-none flex-1"
        />

        <div className="flex shrink-0 items-center gap-1">
          <FilterControl
            filters={displayedFilters}
            showInitialCount={showInitialCount}
            panelClassName={FILTER_TOOLBAR_PANEL_SURFACE_CLASS}
            panelAlign="end"
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
          {resolvedLabelKey ? (
            <LabelFilters
              filterKey={resolvedLabelKey}
              filterOptions={filters}
              selectType={labelSelectType}
              showInitialCount={showInitialCount}
              iconOnly
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

      {showViewPills ? (
        <>
          <div
            className="mx-2 border-t border-border/60 dark:border-border/40"
            role="separator"
            aria-hidden
          />
          <div className="border-b border-border/60 px-2 py-2 dark:border-border/40">
            <ViewPills
              availableViews={availableViews}
              currentView={currentView}
              onViewChange={setView}
            />
          </div>
        </>
      ) : null}
    </div>
  )
}
