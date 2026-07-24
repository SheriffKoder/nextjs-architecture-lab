/**
 * RscCarDrawerDeleteModal
 *
 * Purpose: Client island for URL-driven delete confirmation (`action=delete`) on the demo RSC page
 * Used in: `demo-rsc-drawer-layer.tsx` (server) — keeps the layer free of `'use client'`
 */

'use client'

import { DeleteActionModal, useDrawerActions } from '@/platform/url-kit/drawer-2'

export default function RscCarDrawerDeleteModal() {
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
