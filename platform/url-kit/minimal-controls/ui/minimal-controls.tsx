/**
 * MinimalControls — composed URL-driven bar:
 * group | query builder | sort | view | search
 *
 * Writes URL only. ViewOrchestrator reads the same params.
 */

'use client'

import { Suspense } from 'react'
import { SortingControl } from '@/platform/url-kit/filters/feature-sorting-builder-control/components'
import { QueryBuilder } from '@/platform/url-kit/filters/feature-query-builder-filter/components/query-builder'
import { ExpandableSearchControl } from '@/platform/url-kit/filters/feature-filtering/components'
import { GroupingControl } from './grouping-control'
import { ViewSwitcherControl } from './view-switcher-control'
import { useUrlGrouping } from '../hooks/use-url-grouping'
import { useInitialGrouping } from '../hooks/use-initial-grouping'
import { useViewResolution } from '../hooks/use-view-resolution'
import {
  DEFAULT_GROUPING_SUPPORTED_VIEWS,
  MINIMAL_CONTROLS_SEARCH_SURFACE_BG,
  MINIMAL_CONTROLS_SURFACE_BG,
  MINIMAL_CONTROLS_TRIGGER_CLASS,
} from '../config/defaults'
import type { MinimalControlsConfig } from '../model/types'

export type MinimalControlsProps = MinimalControlsConfig

function MinimalControlsInner(config: MinimalControlsProps) {
  const {
    availableViews,
    defaultView,
    useAllItems,
    defaultPageSize = 10,
    groupableFields = [],
    groupingSupportedViews = DEFAULT_GROUPING_SUPPORTED_VIEWS,
    sortConfig,
    queryBuilderFields,
    searchConfig,
    showGrouping = true,
    showQueryBuilder = true,
    showSort = true,
    showViewSwitcher = true,
    showSearch = true,
    className = '',
  } = config

  const allowedKeys = groupableFields.map((f) => f.key)

  const { groupBy, subGroupBy, setGroupBy, setSubGroupBy } = useUrlGrouping({
    allowedKeys,
  })

  useInitialGrouping(groupableFields, { allowedKeys })

  const { currentView, setView, resolution } = useViewResolution({
    availableViews,
    defaultView,
    useAllItems,
    defaultPageSize,
  })

  return (
    <div
      className={`w-full flex items-center justify-end px-2 py-2 border-b border-tertiary/10 ${className}`}
      data-view-resolution={resolution.status}
    >
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {showGrouping && groupableFields.length > 0 && (
          <GroupingControl
            fields={groupableFields}
            selectedGroupBy={groupBy}
            selectedSubGroupBy={subGroupBy}
            onGroupByChange={setGroupBy}
            onSubGroupByChange={setSubGroupBy}
            currentView={currentView}
            groupingSupportedViews={groupingSupportedViews}
          />
        )}

        {showQueryBuilder && queryBuilderFields && queryBuilderFields.length > 0 && (
          <QueryBuilder
            fields={queryBuilderFields}
            placeholder="Advanced Filter"
            triggerClassName={MINIMAL_CONTROLS_TRIGGER_CLASS}
            triggerSurfaceClassName={MINIMAL_CONTROLS_SURFACE_BG}
          />
        )}

        {showSort && sortConfig && sortConfig.length > 0 && (
          <SortingControl
            sortConfig={sortConfig}
            placeholder="Sort by..."
            triggerClassName={MINIMAL_CONTROLS_TRIGGER_CLASS}
            triggerSurfaceClassName={MINIMAL_CONTROLS_SURFACE_BG}
          />
        )}

        {showViewSwitcher && (
          <ViewSwitcherControl
            availableViews={availableViews}
            currentView={currentView}
            onViewChange={setView}
          />
        )}

        {showSearch && searchConfig && (
          <ExpandableSearchControl
            config={searchConfig}
            surfaceClassName={MINIMAL_CONTROLS_SEARCH_SURFACE_BG}
          />
        )}
      </div>
    </div>
  )
}

/**
 * Suspense boundary required — hooks read `useSearchParams`.
 */
export function MinimalControls(props: MinimalControlsProps) {
  return (
    <Suspense
      fallback={
        <div className="w-full h-10 px-2 py-2 mb-0 border-b border-tertiary/10 animate-pulse bg-muted/30 rounded-sm" />
      }
    >
      <MinimalControlsInner {...props} />
    </Suspense>
  )
}
