/**
 * Demo RSC Content Component
 *
 * Purpose: Client component that renders FilteringWrapper with rental cars data
 * Used in: `demo-rsc-index.tsx`
 * Why: Separates client-side rendering logic from server component
 *
 * Steps:
 * 1. Import FilteringWrapper from clean version
 * 2. Import table configurations
 * 3. Render FilteringWrapper with data and configs
 */

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useDrawerActions } from '@/features/ui/drawer-2'
import { FilteringWrapper } from '@/features/filtering-wrapper-multi-display-clean/filtering-wrapper'
import type { SubheadingsUpdateContext } from '@/features/filtering-wrapper-multi-display-clean/features/subheadings/dnd'

////////////////////////////////////////////////////////////
// Minimal Controls configs (grouping, sorting, filtering)
import { minimalControlsConfig } from './config/minimal-controls-config'

////////////////////////////////////////////////////////////
// Individual Display configs (different types of UI layouts)
import { tableConfig } from './config/displays/table-config'
import type { RentalCarTableItem } from './types/rental-car-table-item'
import { tableColumns } from './config/columns'
import { kanbanConfig } from './config/displays/kanban-config'
import { calendarConfig } from './config/displays/calendar-config'
import { mapConfig } from './config/displays/map-config'
import { timelineConfig } from './config/displays/timeline-config'
import { subheadingsConfig } from './config/displays/subheadings-config'
import { listViewConfig } from './config/displays/list-config'
import { demoRscRowActionConfigs } from './config/demo-rsc-row-action-configs'
import { getRentalCarByIdAction } from './actions/get-rental-car-by-id-action'
import { DEMO_RSC_CAR_DRAWER_KEY } from './components/drawer-content/rsc-car-drawer-content'

/** Must stay aligned with `FilteringWrapper` `availableViews` default (`table` when `view` param absent). */
const DEMO_RSC_TABLE_VIEW_KEYS = ['table'] as const

////////////////////////////////////////////////////////////
// Filter Configs Types
import type { FilterConfig } from '@/features/ui/filters/feature-filtering/components/filter-types'

interface DemoRscContentProps {
  cars: RentalCarTableItem[]
  loading?: boolean
  filters?: FilterConfig[]
  /** When set, subheadings drag-end calls this instead of updating local demo state (parent owns persistence). */
  onSubheadingsDragEnd?: (updatedData: RentalCarTableItem[]) => void
}

/**
 * Demo RSC content component
 *
 * Why: Displays rental cars in all available views using FilteringWrapper
 * How: Configures FilteringWrapper with all view configs and enables all views
 */
export default function DemoRscContent({
  cars,
  loading = false,
  filters,
  onSubheadingsDragEnd,
}: DemoRscContentProps) {
  const searchParams = useSearchParams()
  const { openView, openEdit, openRowDeleteConfirm } = useDrawerActions()
  const [tableData, setTableData] = useState<RentalCarTableItem[]>(cars)

  const viewParam = searchParams.get('view')
  const isTableSurface =
    !viewParam || (DEMO_RSC_TABLE_VIEW_KEYS as readonly string[]).includes(viewParam)

  const columnsForActiveView = useMemo(
    () =>
      tableColumns.map((col) =>
        col.key === 'delete' ? { ...col, isHidden: !isTableSurface } : col
      ),
    [isTableSurface]
  )

  /** Prefetch drawer payload; `getRentalCarByIdAction` → `getRentalCarByIdCached` (`unstable_cache` by id). */
  const handleRowPointerEnter = useCallback((row: RentalCarTableItem) => {
    void getRentalCarByIdAction(row.id)
  }, [])

  const handleRowClick = useCallback(
    (row: RentalCarTableItem) => {
      openView(DEMO_RSC_CAR_DRAWER_KEY, row.id)
    },
    [openView]
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
      //
      // if (action === 'delete') {
      //   openRowDeleteConfirm(DEMO_RSC_CAR_DRAWER_KEY, row.id)
      //   return
      // }
    },
    [openEdit, openView]
  )

  /** Wired to `delete` column via `columnActions`; preserves URL `mode` if any (does not force edit). */
  const handleDeleteColumnAction = useCallback(
    (item: RentalCarTableItem) => {
      openRowDeleteConfirm(DEMO_RSC_CAR_DRAWER_KEY, item.id)
    },
    [openRowDeleteConfirm]
  )

  const getRowActionConfigs = useCallback(
    (row: RentalCarTableItem) => demoRscRowActionConfigs(onActionClick, row),
    [onActionClick]
  )

  useEffect(() => {
    setTableData(cars)
  }, [cars])

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
    []
  )

  const subheadingsDragEnd = (updatedData: RentalCarTableItem[]) => {
    if (onSubheadingsDragEnd) {
      onSubheadingsDragEnd(updatedData)
    } else {
      setTableData(updatedData)
    }
  }

  const onSubheadingsItemUpdate = useCallback(
    (ctx: SubheadingsUpdateContext<RentalCarTableItem>) => {
      if (onSubheadingsDragEnd) {
        onSubheadingsDragEnd(ctx.data)
      } else {
        setTableData(ctx.data)
      }
    },
    [onSubheadingsDragEnd]
  )

  ////////////////////////////////////////////////////////////
  // Main Render
  ////////////////////////////////////////////////////////////

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <FilteringWrapper
        data={tableData}
        columns={columnsForActiveView}
        filters={filters}
        onRowClick={handleRowClick}
        onRowPointerEnter={handleRowPointerEnter}
        onCellValueChange={onCellValueChange}
        onActionClick={onActionClick}
        actionConfigs={getRowActionConfigs}
        columnActions={{
          delete: (item) => handleDeleteColumnAction(item),
        }}
        minimalControlsConfig={minimalControlsConfig}
        availableViews={['table', 'kanban', 'calendar', 'map', 'timeline', 'subheadings', 'list']}
        tableConfig={{
          ...tableConfig,
          loading,
        }}
        kanbanConfig={kanbanConfig}
        listViewConfig={listViewConfig}
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
