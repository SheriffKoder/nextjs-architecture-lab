/**
 * @file views/demo-hybrid-page/ui/drawer/drawer-layer.tsx
 * Hybrid drawer shell — URL-driven `DrawerWrapper` + orchestrator + delete modal.
 *
 * Purpose: Mount inside `ShallowUrlProvider` so open/close is shallow (no RSC remount)
 * Used in: `demo-hybrid-page-client.tsx`
 */

'use client'

import { DrawerWrapper } from '@/platform/url-kit/url-drawer'
import CarDrawerOrchestrator from './car-drawer-orchestrator'
import CarDrawerDeleteModal from './actions/delete-modal'

export default function DemoHybridDrawerLayer() {
  return (
    <>
      <DrawerWrapper>
        <CarDrawerOrchestrator />
      </DrawerWrapper>
      <CarDrawerDeleteModal />
    </>
  )
}
