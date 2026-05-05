/**
 * RscCarDrawerContent
 *
 * Purpose: Body for URL-driven car drawer on the demo RSC page (`?drawer=car&mode=…`)
 * Used in: `DemoRscDrawerLayer` inside `DrawerWrapper`
 * Used for: Delegates to mode-specific panels (`create` / `view` / `edit`)
 *
 * Steps:
 * 1. Read search params → `parseDrawerState`
 * 2. If drawer key is not `car`, render nothing (defensive)
 * 3. Branch by `mode` to dedicated components
 */

'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { parseDrawerState } from '@/features/ui/drawer-2'
import { DEMO_RSC_CAR_DRAWER_KEY } from './rsc-car-drawer-constants'
import RscCarDrawerCreateContent from './rsc-car-drawer-create-content'
import RscCarDrawerEditContent from './rsc-car-drawer-edit-content'
import RscCarDrawerViewContent from './rsc-car-drawer-view-content'

export { DEMO_RSC_CAR_DRAWER_KEY } from './rsc-car-drawer-constants'

//////////////////////////////////
// Build the same flat record shape as `DrawerWrapper` for consistent parsing.
//////////////////////////////////
function searchParamsToRecord(searchParams: ReturnType<typeof useSearchParams>) {
  const acc: Record<string, string | undefined> = {}
  searchParams.forEach((value, key) => {
    if (acc[key] === undefined) acc[key] = value
  })
  return acc
}

//////////////////////////////////
// RscCarDrawerContent
//////////////////////////////////
export default function RscCarDrawerContent() {
  const searchParams = useSearchParams()

  const state = useMemo(
    () => parseDrawerState(searchParamsToRecord(searchParams)),
    [searchParams]
  )

  if (state.drawer !== DEMO_RSC_CAR_DRAWER_KEY) {
    return (
      <div className="flex flex-1 flex-col p-4">
        <p className="text-sm text-muted-foreground">Unknown drawer key.</p>
      </div>
    )
  }

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
    return <RscCarDrawerViewContent id={id} />
  }

  if (state.mode === 'edit') {
    return <RscCarDrawerEditContent id={id} />
  }

  return null
}
