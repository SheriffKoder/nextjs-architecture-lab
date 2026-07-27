/**
 * @file views/demo-hybrid-page/ui/drawer/actions/delete-modal.tsx
 * URL-driven delete confirmation (`action=delete`) — TanStack DELETE mutation.
 */

'use client'

import { DeleteActionModal, useDrawerActions } from '@/platform/url-kit/url-drawer'
import { useToast } from '@/shared/ui/toast/use-toast'
import { useDeleteRentalCar } from '@/entities/demo-hybrid-cars/mutations'

export default function CarDrawerDeleteModal() {
  const { close } = useDrawerActions()
  const deleteCar = useDeleteRentalCar()
  const { showError, showSuccess } = useToast()

  return (
    <DeleteActionModal
      title="Delete this car?"
      description="Removes the row from the demo mock store and updates the TanStack list cache. No route refresh."
      onConfirm={async (id) => {
        try {
          await deleteCar.mutateAsync(id)
          showSuccess('Car deleted', 'Deleted', 4000)
          close()
        } catch (e) {
          showError(
            e instanceof Error ? e.message : 'Failed to delete car.',
            'Delete failed',
            8000,
          )
        }
      }}
    />
  )
}
