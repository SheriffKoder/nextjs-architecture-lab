/**
 * RscCarDrawerContent
 *
 * Purpose: Server body for URL-driven car drawer — branches create / view / edit from `params` (same contract as `parseDrawerState`)
 * Used in: `demo-rsc-drawer-layer.tsx` inside `DrawerWrapper`
 * Why: Drawer state comes from the RSC page `searchParams` prop; view mode suspends on **`getRentalCarByIdAction`**
 */

import { Suspense } from 'react'
import { parseDrawerState } from '@/features/ui/drawer-2'
import type { DemoRscPageSearchParams } from '@/app/(root)/demo-rsc-page/page'
import { DEMO_RSC_CAR_DRAWER_KEY } from './rsc-car-drawer-constants'
import RscCarDrawerCreateContent from './rsc-car-drawer-create-content'
import RscCarDrawerEditContent from './rsc-car-drawer-edit-content'
import RscCarDrawerViewContent from './rsc-car-drawer-view-content'
import { RscCarDrawerViewHeader } from './rsc-car-drawer-sticky-header'

export { DEMO_RSC_CAR_DRAWER_KEY } from './rsc-car-drawer-constants'

function RscCarDrawerViewSkeleton({ id }: { id: string }) {
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

export default function RscCarDrawerContent({ params }: { params: DemoRscPageSearchParams }) {
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
    return <RscCarDrawerCreateContent />
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
      <Suspense fallback={<RscCarDrawerViewSkeleton id={id} />}>
        <RscCarDrawerViewContent key={id} id={id} />
      </Suspense>
    )
  }

  if (state.mode === 'edit') {
    return <RscCarDrawerEditContent id={id} />
  }

  return null
}
