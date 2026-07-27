/**
 * @file views/demo-rsc-page/ui/drawer/actions/delete-modal.tsx
 * Client island for URL-driven delete confirmation (`action=delete`).
 *
 * Used in: `drawer-layer.tsx` (server) — keeps the layer free of `'use client'`
 */

'use client'

import { DeleteActionModal, useDrawerActions } from '@/platform/url-kit/url-drawer'

export default function CarDrawerDeleteModal() {
  const { close } = useDrawerActions()

  return (
    <DeleteActionModal
      title="Delete this car?"
      description="Demo only: no data is removed. Confirm closes the drawer; wire your DELETE mutation here."
      onConfirm={async (_id) => {
        close()
      }}
    />
  )
}
