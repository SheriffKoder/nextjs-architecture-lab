/**
 * DemoRscDrawerLayer
 *
 * Purpose: Server shell — mounts client `DrawerWrapper` + demo car drawer body; delete modal is a client island
 * Used in: `demo-rsc-index.tsx`
 * Why: `params` flow from `page.tsx` so `RscCarDrawerContent` can stay server (no `useSearchParams` in content)
 */

// Features/UI
import { DrawerWrapper } from '@/platform/url-kit/drawer-2'

// Types
import type { DemoRscPageSearchParams } from '@/app/(root)/demo-rsc-page/page'

// Components
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
