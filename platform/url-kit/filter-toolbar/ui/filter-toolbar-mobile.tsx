/**
 * Mobile filter-toolbar layout (two rows):
 * Row 1: [filter] [date] [group]  [search……]  [status]
 * ──────── separator ────────
 * Row 2: [view pills…]
 *
 * Left cluster = “what I want to see”; search is the hero; status sits alone on the right.
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
  placeholderMarquee,
  className,
}: FilterToolbarLayoutProps) {
  const showViewPills = resolveViewOptions(availableViews).length > 1

  return (
    <div className={cn('flex w-full flex-col md:hidden', className)}>
      {/* Row 1 — filter/date/group · search · status */}
      <div className="flex w-full items-center gap-2 px-2 py-2">
        <div className="flex shrink-0 items-center gap-1">
          <FilterControl
            filters={displayedFilters}
            showInitialCount={showInitialCount}
            panelClassName={FILTER_TOOLBAR_PANEL_SURFACE_CLASS}
            panelAlign="start"
          />
          {dateFilterKey ? (
            <DateControl
              filterKey={dateFilterKey}
              filterLabel={dateFilterLabel}
              buttonText={dateFilterButtonText}
              panelClassName={FILTER_TOOLBAR_PANEL_SURFACE_CLASS}
              panelAlign="start"
            />
          ) : null}
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

        <SearchControl
          config={searchConfig}
          placeholderMarquee={placeholderMarquee}
          className="min-w-0 max-w-none flex-1"
        />

        {resolvedLabelKey ? (
          <div className="flex shrink-0 items-center">
            <LabelFilters
              filterKey={resolvedLabelKey}
              filterOptions={filters}
              selectType={labelSelectType}
              showInitialCount={showInitialCount}
              iconOnly
            />
          </div>
        ) : null}
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
