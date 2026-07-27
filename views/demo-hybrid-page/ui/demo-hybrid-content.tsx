/**
 * @file views/demo-hybrid-page/ui/demo-hybrid-content.tsx
 * Hybrid table surface: ViewOrchestrator + detail seed + URL drawer + activity toggle.
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useDrawerActions } from '@/platform/url-kit/url-drawer'
import { ViewOrchestrator } from '@/widgets/multi-view/view-orchestrator'
import type { FilterConfig } from '@/platform/url-kit/filters/feature-filtering/components/filter-types'
import { seedRentalCarDetailFromRow } from '@/entities/demo-hybrid-cars/cache/seed-rental-car-detail'
import { useToggleRentalCarActivity } from '@/entities/demo-hybrid-cars/mutations'
import { formatActivityStatusLabel } from '@/entities/demo-hybrid-cars/lib/rental-car-activity-status'
import type { RentalCarStatusValue } from '@/entities/demo-hybrid-cars/model/rental-car-status'
import type { RentalCarTableItem } from '@/entities/demo-hybrid-cars/model/rental-car-table-item'
import type { SubheadingsUpdateContext } from '@/widgets/multi-view/features/subheadings/dnd'
import { useToast } from '@/shared/ui/toast/use-toast'
import {
  DEMO_RSC_AVAILABLE_VIEWS,
  DEMO_RSC_USE_ALL_ITEMS_VIEWS,
} from '@/views/demo-hybrid-page/config/data/demo-rsc-views-config'
import { DEMO_RSC_DEFAULT_GROUPS_EXPANDED } from '@/views/demo-hybrid-page/config/data/demo-rsc-grouping-config'
import { DEMO_RSC_GROUPING_ALLOWED_KEYS } from '@/views/demo-hybrid-page/config/ui/demo-rsc-minimal-controls-config'
import { accordionConfig } from '@/views/demo-hybrid-page/config/ui/accordion-config'
import { tableConfig } from '@/views/demo-hybrid-page/config/ui/displays/table-config'
import { tableColumns } from '@/views/demo-hybrid-page/config/ui/columns'
import { kanbanConfig } from '@/views/demo-hybrid-page/config/ui/displays/kanban-config'
import { calendarConfig } from '@/views/demo-hybrid-page/config/ui/displays/calendar-config'
import { mapConfig } from '@/views/demo-hybrid-page/config/ui/displays/map-config'
import { timelineConfig } from '@/views/demo-hybrid-page/config/ui/displays/timeline-config'
import { subheadingsConfig } from '@/views/demo-hybrid-page/config/ui/displays/subheadings-config'
import { listViewConfig } from '@/views/demo-hybrid-page/config/ui/displays/list-config'
import { mobileListConfig } from '@/views/demo-hybrid-page/config/ui/displays/mobile-list-config'
import { demoRscRowActionConfigs } from '@/views/demo-hybrid-page/config/ui/demo-rsc-row-action-configs'
import { DEMO_HYBRID_CAR_DRAWER_KEY } from './drawer'

type DemoHybridContentProps = {
  cars: RentalCarTableItem[]
  filters?: FilterConfig[]
}

export function DemoHybridContent({
  cars,
  filters,
}: DemoHybridContentProps) {
  const queryClient = useQueryClient()
  const [tableData, setTableData] = useState(cars)
  const { openView, openEdit, openRowDeleteConfirm } = useDrawerActions()
  const toggleActivity = useToggleRentalCarActivity()
  const { showError, showSuccess } = useToast()

  useEffect(() => {
    setTableData(cars)
  }, [cars])

  /** Seed detail key from the list row — no network when shapes match. */
  const handleRowPointerEnter = useCallback(
    (row: RentalCarTableItem) => {
      seedRentalCarDetailFromRow(queryClient, row)
    },
    [queryClient],
  )

  const handleRowClick = useCallback(
    (row: RentalCarTableItem) => {
      seedRentalCarDetailFromRow(queryClient, row)
      openView(DEMO_HYBRID_CAR_DRAWER_KEY, row.id)
    },
    [openView, queryClient],
  )

  const onActionClick = useCallback(
    (action: string, row: RentalCarTableItem) => {
      if (action === 'view') {
        seedRentalCarDetailFromRow(queryClient, row)
        openView(DEMO_HYBRID_CAR_DRAWER_KEY, row.id)
        return
      }
      if (action === 'edit') {
        seedRentalCarDetailFromRow(queryClient, row)
        openEdit(DEMO_HYBRID_CAR_DRAWER_KEY, row.id)
      }
    },
    [openEdit, openView, queryClient],
  )

  const handleDeleteColumnAction = useCallback(
    (item: RentalCarTableItem) => {
      openRowDeleteConfirm(DEMO_HYBRID_CAR_DRAWER_KEY, item.id)
    },
    [openRowDeleteConfirm],
  )

  const handleSetActivityColumnAction = useCallback(
    (item: RentalCarTableItem) => {
      toggleActivity.mutate(
        { id: item.id, currentStatus: String(item.status ?? '') },
        {
          onSuccess: (car) => {
            showSuccess(
              `Status is now ${formatActivityStatusLabel(car.status as RentalCarStatusValue)}.`,
              'Activity updated',
              6000,
            )
          },
          onError: (e) => {
            showError(
              e instanceof Error ? e.message : 'Could not update activity',
              'Could not update activity',
              10000,
            )
          },
        },
      )
    },
    [showError, showSuccess, toggleActivity],
  )

  const getRowActionConfigs = useCallback(
    (row: RentalCarTableItem) => demoRscRowActionConfigs(onActionClick, row),
    [onActionClick],
  )

  const subheadingsDragEnd = useCallback((updatedData: RentalCarTableItem[]) => {
    setTableData(updatedData)
  }, [])

  const onSubheadingsItemUpdate = useCallback(
    (ctx: SubheadingsUpdateContext<RentalCarTableItem>) => {
      setTableData(ctx.data)
    },
    [],
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <ViewOrchestrator
        data={tableData}
        columns={tableColumns}
        accordionConfig={accordionConfig}
        filters={filters}
        onRowClick={handleRowClick}
        onRowPointerEnter={handleRowPointerEnter}
        onActionClick={onActionClick}
        actionConfigs={getRowActionConfigs}
        columnActions={{
          delete: (item) => handleDeleteColumnAction(item),
          setActivity: (item) => handleSetActivityColumnAction(item),
        }}
        externalUrlControls
        urlGroupingAllowedKeys={DEMO_RSC_GROUPING_ALLOWED_KEYS}
        defaultGroupsExpanded={DEMO_RSC_DEFAULT_GROUPS_EXPANDED}
        useAllItems={[...DEMO_RSC_USE_ALL_ITEMS_VIEWS]}
        defaultPageSize={10}
        availableViews={[...DEMO_RSC_AVAILABLE_VIEWS]}
        tableConfig={tableConfig}
        kanbanConfig={kanbanConfig}
        listViewConfig={listViewConfig}
        mobileListConfig={mobileListConfig}
        calendarConfig={calendarConfig}
        mapConfig={mapConfig}
        timelineConfig={timelineConfig}
        subheadingsConfig={{
          ...subheadingsConfig,
          headerFilters: subheadingsConfig.headerFilters,
          subheadingsDragEnd,
          onSubheadingsItemUpdate,
        }}
      />
    </div>
  )
}
