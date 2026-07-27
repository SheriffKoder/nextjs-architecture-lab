/**
 * @file views/demo-rsc-page/ui/drawer/car-drawer-orchestrator.tsx
 * Server mode router — branches create / view / edit from page `searchParams`.
 *
 * Used in: `drawer-layer.tsx` inside `DrawerWrapper`
 * Why: Drawer state comes from the RSC page `searchParams` prop; view mode
 * suspends on `getRentalCarByIdAction`.
 */

import { Suspense } from 'react'
import { parseDrawerState } from '@/platform/url-kit/url-drawer'
import type { DemoRscPageSearchParams } from '@/app/(root)/demo-rsc-page/page'
import { DEMO_RSC_CAR_DRAWER_KEY } from './car-drawer-key'
import CarDrawerCreateContent from './modes/create/create-content'
import CarDrawerEditContent from './modes/edit/edit-content'
import CarDrawerViewPanel from './modes/view/view-panel'
import { RscCarDrawerViewHeader } from './chrome/sticky-header'

function CarDrawerViewSkeleton({ id }: { id: string }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <RscCarDrawerViewHeader id={id} />
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <div className="h-48 animate-pulse rounded-lg border border-border bg-muted/30" aria-hidden />
        <p className="text-xs text-muted-foreground">Loading car details…</p>
      </div>
    </div>
  )
}

export default function CarDrawerOrchestrator({
  params,
}: {
  params: DemoRscPageSearchParams
}) {
  const state = parseDrawerState(params)

  if (state.drawer !== DEMO_RSC_CAR_DRAWER_KEY) {
    return (
      <div className="flex flex-1 flex-col p-4">
        <p className="text-sm text-muted-foreground">Unknown drawer key.</p>
      </div>
    )
  }

  // Client form with server action, RHF, Zod.
  if (state.mode === 'create') {
    return <CarDrawerCreateContent />
  }

  const id = state.id
  if (!id) {
    return (
      <div className="flex flex-1 flex-col p-4">
        <p className="text-sm text-muted-foreground">Missing car id for this drawer.</p>
      </div>
    )
  }

  if (state.mode === 'view') {
    return (
      <Suspense fallback={<CarDrawerViewSkeleton id={id} />}>
        <CarDrawerViewPanel key={id} id={id} />
      </Suspense>
    )
  }

  if (state.mode === 'edit') {
    return <CarDrawerEditContent id={id} />
  }

  return null
}
