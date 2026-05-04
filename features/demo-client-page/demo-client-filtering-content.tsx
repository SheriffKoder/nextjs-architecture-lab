/**
 * Demo Client Page — `FilteringWrapper` only
 *
 * Purpose: Isolate table / multi-view chrome from page chrome (`demo-client-index.tsx`)
 * Used in: `demo-client-index.tsx`
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import { FilteringWrapper } from '@/features/filtering-wrapper-multi-display-clean/filtering-wrapper'
import type { SubheadingsUpdateContext } from '@/features/filtering-wrapper-multi-display-clean/features/subheadings/dnd'
import type { FilterConfig } from '@/features/ui/filters/feature-filtering/components/filter-types'

import { minimalControlsConfig } from './config/minimal-controls-config'
import { tableConfig } from './config/displays/table-config'
import type { RentalCarTableItem } from './types/rental-car-table-item'
import { tableColumns } from './config/columns'
import { kanbanConfig } from './config/displays/kanban-config'
import { calendarConfig } from './config/displays/calendar-config'
import { mapConfig } from './config/displays/map-config'
import { timelineConfig } from './config/displays/timeline-config'
import { subheadingsConfig } from './config/displays/subheadings-config'
import { listViewConfig } from './config/displays/list-config'

export interface DemoClientFilteringContentProps {
  data: RentalCarTableItem[]
  filters: FilterConfig[]
  carsLoading: boolean
  /** Omit when rows should not open a detail / edit flow (e.g. create-only drawer). */
  onRowClick?: (car: RentalCarTableItem) => void
}

export default function DemoClientFilteringContent({
  data,
  filters,
  carsLoading,
  onRowClick,
}: DemoClientFilteringContentProps) {
  const [tableData, setTableData] = useState<RentalCarTableItem[]>(data)

  useEffect(() => {
    setTableData(data)
  }, [data])

  const onSubheadingsItemUpdate = useCallback(
    (ctx: SubheadingsUpdateContext<RentalCarTableItem>) => {
      setTableData((prev) => {
        const nextById = new Map(ctx.data.map((r) => [r.id, r]))
        const prevIds = new Set(prev.map((r) => r.id))
        const sameLengthAndIds =
          prev.length === ctx.data.length &&
          ctx.data.every((r) => prevIds.has(r.id)) &&
          prev.every((r) => nextById.has(r.id))
        if (sameLengthAndIds) {
          return ctx.data
        }
        return prev.map((r) => nextById.get(r.id) ?? r)
      })
    },
    []
  )

  return (
    <div className="flex-1 min-h-0">
      <FilteringWrapper
        data={tableData}
        columns={tableColumns}
        filters={filters}
        onRowClick={onRowClick}
        minimalControlsConfig={minimalControlsConfig}
        availableViews={[
          'table',
          'kanban',
          'calendar',
          'map',
          'timeline',
          'subheadings',
          'list',
        ]}
        tableConfig={{
          ...tableConfig,
          loading: carsLoading,
        }}
        kanbanConfig={kanbanConfig}
        listViewConfig={listViewConfig}
        calendarConfig={calendarConfig}
        mapConfig={mapConfig}
        timelineConfig={timelineConfig}
        subheadingsConfig={{
          ...subheadingsConfig,
          headerFilters: subheadingsConfig.headerFilters,
          onSubheadingsItemUpdate,
        }}
      />
    </div>
  )
}
