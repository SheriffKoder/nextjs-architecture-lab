/**
 * Demo RSC Content Component
 *
 * Purpose: Client component that renders ViewOrchestrator with rental cars data
 * Used in: `demo-rsc-index.tsx`
 * Why: Separates client-side rendering logic from server component
 */

'use client'

import { useCallback } from 'react'
import { useDrawerActions } from '@/platform/url-kit/url-drawer'
import { ViewOrchestrator } from '@/widgets/multi-view/view-orchestrator'
import {
  DEMO_RSC_AVAILABLE_VIEWS,
  DEMO_RSC_USE_ALL_ITEMS_VIEWS,
} from './config/data/demo-rsc-views-config'
import { DEMO_RSC_DEFAULT_GROUPS_EXPANDED } from './config/data/demo-rsc-grouping-config'
import { DEMO_RSC_GROUPING_ALLOWED_KEYS } from './config/ui/demo-rsc-filter-toolbar-config'
import { tableConfig } from './config/ui/displays/table-config'
import { accordionConfig } from './config/ui/accordion-config'
import { tableColumns } from './config/ui/columns'
import { listViewConfig } from './config/ui/displays/list-config'
import { mobileListConfig } from './config/ui/displays/mobile-list-config'
import { demoRscRowActionConfigs } from './config/ui/demo-rsc-row-action-configs'
import type { RentalCarTableItem } from '@/entities/cars-rsc/types/rental-car-table-item'
import { DEMO_RSC_CAR_DRAWER_KEY } from './ui/drawer'
import { useDemoRscTableActivityToggle } from './hooks/use-demo-rsc-table-activity-toggle'
import type { FilterConfig } from '@/platform/url-kit/filters/feature-filtering/components/filter-types'

interface DemoRscContentProps {
  cars: RentalCarTableItem[]
  loading?: boolean
  filters?: FilterConfig[]
}

export default function DemoRscContent({
  cars,
  loading = false,
  filters,
}: DemoRscContentProps) {
  const { openView, openEdit, openRowDeleteConfirm } = useDrawerActions()
  const { setTableData, displayData, setActivityColumnAction } =
    useDemoRscTableActivityToggle(cars)

  const handleRowClick = useCallback(
    (row: RentalCarTableItem) => {
      openView(DEMO_RSC_CAR_DRAWER_KEY, row.id)
    },
    [openView],
  )

  const onActionClick = useCallback(
    (action: string, row: RentalCarTableItem) => {
      if (action === 'view') {
        openView(DEMO_RSC_CAR_DRAWER_KEY, row.id)
        return
      }
      if (action === 'edit') {
        openEdit(DEMO_RSC_CAR_DRAWER_KEY, row.id)
      }
    },
    [openEdit, openView],
  )

  const handleDeleteColumnAction = useCallback(
    (item: RentalCarTableItem) => {
      openRowDeleteConfirm(DEMO_RSC_CAR_DRAWER_KEY, item.id)
    },
    [openRowDeleteConfirm],
  )

  const getRowActionConfigs = useCallback(
    (row: RentalCarTableItem) => demoRscRowActionConfigs(onActionClick, row),
    [onActionClick],
  )

  const onCellValueChange = useCallback(
    (rowIndex: number, columnKey: string, newValue: unknown) => {
      setTableData((prev) => {
        const row = prev[rowIndex]
        if (!row) return prev
        const next = [...prev]
        next[rowIndex] = { ...row, [columnKey]: newValue } as RentalCarTableItem
        return next
      })
    },
    [setTableData],
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ViewOrchestrator
        data={displayData}
        columns={tableColumns}
        accordionConfig={accordionConfig}
        filters={filters}
        onRowClick={handleRowClick}
        onCellValueChange={onCellValueChange}
        onActionClick={onActionClick}
        actionConfigs={getRowActionConfigs}
        columnActions={{
          delete: (item) => handleDeleteColumnAction(item),
          setActivity: setActivityColumnAction,
        }}
        externalUrlControls
        urlGroupingAllowedKeys={DEMO_RSC_GROUPING_ALLOWED_KEYS}
        defaultGroupsExpanded={DEMO_RSC_DEFAULT_GROUPS_EXPANDED}
        useAllItems={[...DEMO_RSC_USE_ALL_ITEMS_VIEWS]}
        defaultPageSize={10}
        availableViews={[...DEMO_RSC_AVAILABLE_VIEWS]}
        tableConfig={{
          ...tableConfig,
          loading,
        }}
        listViewConfig={listViewConfig}
        mobileListConfig={{
          ...mobileListConfig,
          loading,
        }}
      />
    </div>
  )
}
