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

import { useCallback } from 'react'

// Features/UI
import { useDrawerActions } from '@/platform/url-kit/url-drawer'
import { FilteringWrapper } from '@/widgets/multi-view/filtering-wrapper'


////////////////////////////////////////////////////////////
// Individual Display configs (different types of UI layouts)
// Configs
import { DEMO_RSC_USE_ALL_ITEMS_VIEWS } from './config/data/demo-rsc-views-config'
import { minimalControlsConfig } from './config/ui/minimal-controls-config'
import { tableConfig } from './config/ui/displays/table-config'
import { accordionConfig } from './config/ui/accordion-config'
import { tableColumns } from './config/ui/columns'
import { kanbanConfig } from './config/ui/displays/kanban-config'
import { calendarConfig } from './config/ui/displays/calendar-config'
import { mapConfig } from './config/ui/displays/map-config'
import { timelineConfig } from './config/ui/displays/timeline-config'
import { subheadingsConfig } from './config/ui/displays/subheadings-config'
import { listViewConfig } from './config/ui/displays/list-config'
import { demoRscRowActionConfigs } from './config/ui/demo-rsc-row-action-configs'

// Data
import { getRentalCarByIdAction } from '@/entities/cars-rsc/actions/get-rental-car-by-id-action'

// Types
import type { RentalCarTableItem } from '@/entities/cars-rsc/types/rental-car-table-item'
import type { SubheadingsUpdateContext } from '@/widgets/multi-view/features/subheadings/dnd'

// Components
import { DEMO_RSC_CAR_DRAWER_KEY } from './ui/drawer-content/rsc-car-drawer-content'
import { useDemoRscTableActivityToggle } from './hooks/use-demo-rsc-table-activity-toggle'

////////////////////////////////////////////////////////////
// Filter Configs Types
import type { FilterConfig } from '@/platform/url-kit/filters/feature-filtering/components/filter-types'

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

  ////////////////////////////////////////////////////////////
  // Drawer actions
  ////////////////////////////////////////////////////////////
  const { openView, openEdit, openRowDeleteConfirm } = useDrawerActions()

  ////////////////////////////////////////////////////////////
  // Table data
  ////////////////////////////////////////////////////////////
  const { setTableData, displayData, setActivityColumnAction } =
    useDemoRscTableActivityToggle(cars)

  ////////////////////////////////////////////////////////////
  // Row pointer enter
  ////////////////////////////////////////////////////////////
  /** Prefetch drawer payload; `getRentalCarByIdAction` → `getRentalCarByIdCached` (`unstable_cache` by id). */
  const handleRowPointerEnter = useCallback((row: RentalCarTableItem) => {
    void getRentalCarByIdAction(row.id)
  }, [])

  ////////////////////////////////////////////////////////////
  // Row click
  ////////////////////////////////////////////////////////////
  const handleRowClick = useCallback(
    (row: RentalCarTableItem) => {
      openView(DEMO_RSC_CAR_DRAWER_KEY, row.id)
    },
    [openView]
  )

  ////////////////////////////////////////////////////////////
  // Action click - if actions grow, then this becomes an action dispatcher logic
  ////////////////////////////////////////////////////////////
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

  ////////////////////////////////////////////////////////////
  // Delete column action
  ////////////////////////////////////////////////////////////
  /** Wired to `delete` column via `columnActions`; preserves URL `mode` if any (does not force edit). */
  const handleDeleteColumnAction = useCallback(
    (item: RentalCarTableItem) => {
      openRowDeleteConfirm(DEMO_RSC_CAR_DRAWER_KEY, item.id)
    },
    [openRowDeleteConfirm]
  )

  ////////////////////////////////////////////////////////////
  // Get row action configs - If config generation becomes complex: then this can be extracted to a hook because it is pure function and can be reused
  ////////////////////////////////////////////////////////////
  const getRowActionConfigs = useCallback(
    (row: RentalCarTableItem) => demoRscRowActionConfigs(onActionClick, row),
    [onActionClick]
  )

  ////////////////////////////////////////////////////////////
  // On cell value change - can be a hook because it is pure table state mutation and not orchestrion as rest of the file, and can be reusable
  ////////////////////////////////////////////////////////////
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
    [setTableData]
  )

  ////////////////////////////////////////////////////////////
  // Subheadings drag end - can be extracted to a hook because this is state syncronization behavor between internal state and external controlled prop
  ////////////////////////////////////////////////////////////
  const subheadingsDragEnd = (updatedData: RentalCarTableItem[]) => {
    if (onSubheadingsDragEnd) {
      onSubheadingsDragEnd(updatedData)
    } else {
      setTableData(updatedData)
    }
  }

  ////////////////////////////////////////////////////////////
  // On subheadings item update - can be extracted to a hook because this is state syncronization behavor between internal state and external controlled prop
  ////////////////////////////////////////////////////////////
  const onSubheadingsItemUpdate = useCallback(
    (ctx: SubheadingsUpdateContext<RentalCarTableItem>) => {
      if (onSubheadingsDragEnd) {
        onSubheadingsDragEnd(ctx.data)
      } else {
        setTableData(ctx.data)
      }
    },
    [onSubheadingsDragEnd, setTableData]
  )

  ////////////////////////////////////////////////////////////
  // Main Render
  ////////////////////////////////////////////////////////////

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <FilteringWrapper
        data={displayData}
        columns={tableColumns}
        accordionConfig={accordionConfig}
        filters={filters}
        onRowClick={handleRowClick}
        onRowPointerEnter={handleRowPointerEnter}
        onCellValueChange={onCellValueChange}
        onActionClick={onActionClick}
        actionConfigs={getRowActionConfigs}
        columnActions={{
          delete: (item) => handleDeleteColumnAction(item),
          setActivity: setActivityColumnAction,
        }}
        minimalControlsConfig={minimalControlsConfig}
        useAllItems={[...DEMO_RSC_USE_ALL_ITEMS_VIEWS]}
        defaultPageSize={10}
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
