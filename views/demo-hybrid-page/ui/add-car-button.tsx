/**
 * @file views/demo-hybrid-page/ui/add-car-button.tsx
 * Header CTA — opens create drawer via URL (`drawer=car&mode=create`).
 */

'use client'

import { Plus } from 'lucide-react'
import { useDrawerActions } from '@/platform/url-kit/url-drawer'
import { DEMO_HYBRID_CAR_DRAWER_KEY } from './drawer'

type AddCarButtonProps = {
  drawerKey?: string
}

export default function AddCarButton({
  drawerKey = DEMO_HYBRID_CAR_DRAWER_KEY,
}: AddCarButtonProps) {
  const { openCreate } = useDrawerActions()

  return (
    <button
      type="button"
      onClick={() => openCreate(drawerKey)}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
    >
      <Plus className="size-4" aria-hidden />
      Add car
    </button>
  )
}
