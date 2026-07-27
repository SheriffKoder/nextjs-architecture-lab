/**
 * @file views/demo-hybrid-page/ui/drawer/actions/delete-modal.tsx
 * URL-driven delete confirmation (`action=delete`) — demo stub until Phase 4 / 6.
 */

'use client'

import { DeleteActionModal, useDrawerActions } from '@/platform/url-kit/url-drawer'

export default function CarDrawerDeleteModal() {
  const { close } = useDrawerActions()

  return (
    <DeleteActionModal
      title="Delete this car?"
      description="Demo only: no data is removed. Confirm closes the drawer; wire your DELETE mutation in Phase 4. Phase 6 moves confirm off the URL."
      onConfirm={async (_id) => {
        close()
      }}
    />
  )
}
