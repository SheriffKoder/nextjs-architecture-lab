/**
 * @file views/demo-hybrid-page/ui/drawer/car-drawer-orchestrator.tsx
 * Mode router — branches create / view / edit from transport URL params.
 */

'use client'

import { useMemo } from 'react'
import { parseDrawerState } from '@/platform/url-kit/url-drawer'
import { useEffectiveSearchParams } from '@/platform/url-kit/url-params'
import { DEMO_HYBRID_CAR_DRAWER_KEY } from './car-drawer-key'
import CarDrawerCreateContent from './modes/create/create-content'
import CarDrawerEditContent from './modes/edit/edit-content'
import CarDrawerViewPanel from './modes/view/view-panel'

export default function CarDrawerOrchestrator() {
  const searchParams = useEffectiveSearchParams()

  const state = useMemo(() => {
    const acc: Record<string, string | undefined> = {}
    searchParams.forEach((value, key) => {
      if (acc[key] === undefined) acc[key] = value
    })
    return parseDrawerState(acc)
  }, [searchParams])

  if (state.drawer !== DEMO_HYBRID_CAR_DRAWER_KEY) {
    return (
      <div className="flex flex-1 flex-col p-4">
        <p className="text-sm text-muted-foreground">Unknown drawer key.</p>
      </div>
    )
  }

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
    return <CarDrawerViewPanel key={id} id={id} />
  }

  if (state.mode === 'edit') {
    return <CarDrawerEditContent key={id} id={id} />
  }

  return null
}
