/**
 * @file views/demo-rsc-page/ui/drawer/drawer-layer.tsx
 * Server shell — mounts client `DrawerWrapper` + car drawer body; delete modal is a client island.
 *
 * Used in: `demo-rsc-index.tsx`
 * Why: `params` flow from `page.tsx` so the orchestrator can stay server
 * (no `useSearchParams` in content).
 */

import { DrawerWrapper } from '@/platform/url-kit/url-drawer'
import type { DemoRscPageSearchParams } from '@/app/(root)/demo-rsc-page/page'
import CarDrawerOrchestrator from './car-drawer-orchestrator'
import CarDrawerDeleteModal from './actions/delete-modal'

export default function DemoRscDrawerLayer({
  params,
}: {
  params: DemoRscPageSearchParams
}) {
  return (
    <>
      <DrawerWrapper>
        <CarDrawerOrchestrator params={params} />
      </DrawerWrapper>
      <CarDrawerDeleteModal />
    </>
  )
}
