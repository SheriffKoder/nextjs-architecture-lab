/**
 * ConfirmRoot
 *
 * Purpose: URL-driven confirm modal renderer — reads `action` from search params and shows the correct confirm UI
 * Used in: `demo-client-index.tsx` (mounted as sibling of drawer, not inside RightDrawer)
 * Used for: Centralises delete (and future action) confirm so table, edit header, and view can all trigger it via URL
 *
 * Steps:
 * 1. Read confirm state from `useConfirmAction`
 * 2. If not open → null
 * 3. Resolve display label from TanStack list cache (no extra fetch)
 * 4. Pick entity mutation by `drawer` value
 * 5. Render `ConfirmModal` with confirm → mutate + toast + clearAll, cancel → clearAction
 */

'use client'

import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import ConfirmModal from '@/components/confirm-modal'
import { useToast } from '@/components/design/toast/use-toast'
import { useConfirmAction } from '@/features/ui/confirm'

import { rentalCarKeys, type RentalCarsPageResponse, useDeleteRentalCar } from '@/features/demo-client-page/tanstack'
import type { RentalCarTableItem } from '@/features/demo-client-page/types/rental-car-table-item'

/////////////////////////////////////////////////////////////
// Label resolver — scan TanStack list cache for display name by id
/////////////////////////////////////////////////////////////

//////////////////////////////////
// resolveCarLabel — find car make+model from cached list pages
// Used in: ConfirmRoot (delete confirm copy)
// Used for: Avoids extra GET; falls back to generic text on cache miss
function resolveCarLabel(queryClient: ReturnType<typeof useQueryClient>, id: string): string {
  const pages = queryClient.getQueriesData<RentalCarsPageResponse>({
    queryKey: rentalCarKeys.lists(),
  })

  for (const [, data] of pages) {
    if (!data?.cars) continue
    const car = data.cars.find((c: RentalCarTableItem) => c.id === id)
    if (car) return `${car.make} ${car.model}`.trim()
  }

  // Fallback: try detail cache
  const detail = queryClient.getQueryData<RentalCarTableItem>(rentalCarKeys.detail(id))
  if (detail) return `${detail.make} ${detail.model}`.trim()

  return 'this car'
}
//////////////////////////////////

/////////////////////////////////////////////////////////////
// Component
/////////////////////////////////////////////////////////////

//////////////////////////////////
// ConfirmRoot — URL-driven confirm modal
// Used in: page-level layout (sibling of drawer)
// Used for: Single confirm owner for delete (and future actions) across all entry points
//////////////////////////////////
export default function ConfirmRoot() {
  const { isConfirmOpen, confirmAction, confirmId, cancelConfirm, confirmDone } = useConfirmAction()
  const queryClient = useQueryClient()
  const { showError, showSuccess } = useToast()
  const deleteCar = useDeleteRentalCar()

  // 1. Resolve label from cache (no network)
  const label = confirmId ? resolveCarLabel(queryClient, confirmId) : 'this car'

  // 2. Confirm handler: run mutation, toast, clear all params
  const handleConfirm = useCallback(async () => {
    if (!confirmId) return
    try {
      await deleteCar.mutateAsync(confirmId)
      showSuccess('Car deleted successfully!', 'Success', 5000)
      confirmDone()
    } catch (e) {
      showError(
        e instanceof Error ? e.message : 'Failed to delete car.',
        'Delete failed',
        5000
      )
    }
  }, [confirmId, deleteCar, confirmDone, showError, showSuccess])

  // 3. Nothing to render when no action is active
  if (!isConfirmOpen || confirmAction !== 'delete' || !confirmId) return null

  return (
    <ConfirmModal
      open
      onClose={cancelConfirm}
      title="Delete this car?"
      description={
        <>
          This will remove{' '}
          <span className="font-medium text-foreground">{label}</span> from the list.
          This demo uses in-memory data until a real database is wired.
        </>
      }
      confirmLabel="Delete"
      cancelLabel="Cancel"
      variant="destructive"
      loading={deleteCar.isPending}
      onConfirm={handleConfirm}
    />
  )
}
//////////////////////////////////
