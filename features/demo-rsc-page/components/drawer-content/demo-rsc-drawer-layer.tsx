/**
 * DemoRscDrawerLayer
 *
 * Purpose: Server shell — mounts client `DrawerWrapper` + demo car drawer body; delete modal is a client island
 * Used in: `demo-rsc-index.tsx`
 * Why: `params` flow from `page.tsx` so `RscCarDrawerContent` can stay server (no `useSearchParams` in content)
 */

import { DrawerWrapper } from '@/features/ui/drawer-2'
import type { DemoRscPageSearchParams } from '@/app/(root)/demo-rsc-page/page'
import RscCarDrawerContent from './rsc-car-drawer-content'
import RscCarDrawerDeleteModal from './rsc-car-drawer-delete-modal'

export default function DemoRscDrawerLayer({ params }: { params: DemoRscPageSearchParams }) {
  return (
    <>
      <DrawerWrapper>
        <RscCarDrawerContent params={params} />
      </DrawerWrapper>
      <RscCarDrawerDeleteModal />
    </>
  )
}
