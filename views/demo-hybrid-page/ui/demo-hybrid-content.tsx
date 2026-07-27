/**
 * @file views/demo-hybrid-page/ui/demo-hybrid-content.tsx
 * Hybrid table surface: ViewOrchestrator + detail hover prefetch + URL drawer actions.
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useDrawerActions } from '@/platform/url-kit/url-drawer'
import { ViewOrchestrator } from '@/widgets/multi-view/view-orchestrator'
import type { FilterConfig } from '@/platform/url-kit/filters/feature-filtering/components/filter-types'
import { rentalCarKeys } from '@/entities/demo-hybrid-cars/cache/rental-car-keys'
import { fetchRentalCarById } from '@/entities/demo-hybrid-cars/client'
import type { RentalCarTableItem } from '@/entities/demo-hybrid-cars/model/rental-car-table-item'
import type { SubheadingsUpdateContext } from '@/widgets/multi-view/features/subheadings/dnd'
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

const DETAIL_STALE_TIME_MS = 5 * 60 * 1000

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

  useEffect(() => {
    setTableData(cars)
  }, [cars])

  const handleRowPointerEnter = useCallback(
    (row: RentalCarTableItem) => {
      void queryClient.prefetchQuery({
        queryKey: rentalCarKeys.detail(row.id),
        queryFn: () => fetchRentalCarById(row.id),
        staleTime: DETAIL_STALE_TIME_MS,
      })
    },
    [queryClient]
  )

  const handleRowClick = useCallback(
    (row: RentalCarTableItem) => {
      openView(DEMO_HYBRID_CAR_DRAWER_KEY, row.id)
    },
    [openView],
  )

  const onActionClick = useCallback(
    (action: string, row: RentalCarTableItem) => {
      if (action === 'view') {
        openView(DEMO_HYBRID_CAR_DRAWER_KEY, row.id)
        return
      }
      if (action === 'edit') {
        openEdit(DEMO_HYBRID_CAR_DRAWER_KEY, row.id)
      }
    },
    [openEdit, openView],
  )

  const handleDeleteColumnAction = useCallback(
    (item: RentalCarTableItem) => {
      openRowDeleteConfirm(DEMO_HYBRID_CAR_DRAWER_KEY, item.id)
    },
    [openRowDeleteConfirm],
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
