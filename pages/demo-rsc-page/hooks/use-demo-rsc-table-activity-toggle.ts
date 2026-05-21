'use client'

/**
 * Demo RSC table — activity toggle (`setActivity` column).
 * combined into one file to decrease bundle size on the demo-rsc-content.tsx file
 *
 * Purpose: `useOptimistic` list data + `rowStatusUpdateAction` handler for available ↔ reserved.
 * Used in: `demo-rsc-content.tsx`
 */

import { useCallback, useEffect, useOptimistic, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/features/ui-kit/feeback/toast/use-toast'
import { rowStatusUpdateAction } from '@/features/cars-rsc/actions/row-status-update-action'
import {
  formatActivityStatusLabel,
  getNextActivityStatus,
} from '@/features/cars-rsc/lib/rental-car-activity-status'
import type { RentalCarTableItem } from '../../../features/cars-rsc/types/rental-car-table-item'
import type { RentalCarStatusValue } from '../../../features/cars-rsc/types/rental-car-status'

type ActivityStatusPatch = { id: string; status: RentalCarStatusValue }

export function useDemoRscTableActivityToggle(cars: RentalCarTableItem[]) {
  const router = useRouter()
  const { showError, showSuccess } = useToast()
  const [tableData, setTableData] = useState<RentalCarTableItem[]>(cars)

  const [displayData, addOptimistic] = useOptimistic(
    tableData,
    (state, patch: ActivityStatusPatch) =>
      state.map((row) =>
        row.id === patch.id ? { ...row, status: patch.status } : row
      )
  )

  useEffect(() => {
    setTableData(cars)
  }, [cars])

  const handleSetActivityColumnAction = useCallback(
    async (item: RentalCarTableItem) => {
      const nextStatus = getNextActivityStatus(item.status)
      const previousStatus = item.status

      addOptimistic({ id: item.id, status: nextStatus })

      // Optional: wrap the server call in `startTransition(() => { void (async () => { ... })() })`
      // so React ties optimistic rollback to transition completion automatically. We call the
      // action directly here and revert with `addOptimistic` on failure + `router.refresh()` on success.

      const result = await rowStatusUpdateAction(item.id)

      if (result.success) {
        showSuccess(
          `Status is now ${formatActivityStatusLabel(result.status)}.`,
          'Activity updated',
          6000
        )
        router.refresh()
        return
      }

      addOptimistic({ id: item.id, status: previousStatus as RentalCarStatusValue })
      showError(result.error, 'Could not update activity', 10000)
    },
    [addOptimistic, router, showError, showSuccess]
  )

  const setActivityColumnAction = useCallback(
    (item: RentalCarTableItem) => {
      void handleSetActivityColumnAction(item)
    },
    [handleSetActivityColumnAction]
  )

  return {
    tableData,
    setTableData,
    displayData,
    handleSetActivityColumnAction,
    setActivityColumnAction,
  }
}
