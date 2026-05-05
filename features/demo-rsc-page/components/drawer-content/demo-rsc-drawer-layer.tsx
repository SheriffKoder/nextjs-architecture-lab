/**
 * DemoRscDrawerLayer
 *
 * Purpose: Mounts URL-driven `DrawerWrapper` and demo car drawer body for the RSC page
 * Used in: `demo-rsc-index.tsx`
 * Used for: Right-hand panel when drawer query updates; `DeleteActionModal` when `action=delete`
 *
 * Steps:
 * 1. Render `DrawerWrapper` from drawer-2
 * 2. Delegate inner UI to `RscCarDrawerContent`
 */

'use client'

import { DeleteActionModal, DrawerWrapper, useDrawerActions } from '@/features/ui/drawer-2'
import RscCarDrawerContent from './rsc-car-drawer-content'

export default function DemoRscDrawerLayer() {
  const { close } = useDrawerActions()

  return (
    <>
      <DrawerWrapper>
        <RscCarDrawerContent />
      </DrawerWrapper>
      <DeleteActionModal
        title="Delete this car?"
        description="Demo only: no data is removed. Confirm closes the drawer; wire your DELETE mutation here."
        onConfirm={async (_id) => {
          close()
        }}
      />
    </>
  )
}
