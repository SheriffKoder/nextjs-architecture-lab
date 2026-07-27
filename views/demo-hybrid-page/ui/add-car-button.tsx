/**
 * @file views/demo-hybrid-page/ui/add-car-button.tsx
 * Header CTA — opens create drawer via URL (`drawer=car&mode=create`).
 *
 * Mobile: icon-only `[+]`. Desktop: icon + “Add car” label.
 */

'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDrawerActions } from '@/platform/url-kit/url-drawer'
import { DEMO_HYBRID_CAR_DRAWER_KEY } from './drawer'

type AddCarButtonProps = {
  drawerKey?: string
}

export default function AddCarButton({
  drawerKey = DEMO_HYBRID_CAR_DRAWER_KEY,
}: AddCarButtonProps) {
  const { openCreate } = useDrawerActions()
  const open = () => openCreate(drawerKey)

  return (
    <>
      <Button
        type="button"
        variant="action"
        size="icon-sm"
        onClick={open}
        className="md:hidden"
        aria-label="Add car"
        title="Add car"
      >
        <Plus className="h-4 w-4" strokeWidth={2} />
      </Button>

      <Button
        type="button"
        variant="action"
        size="default"
        onClick={open}
        className="hidden h-auto py-2.5 md:inline-flex [&_svg]:size-5"
      >
        <Plus strokeWidth={2} />
        Add car
      </Button>
    </>
  )
}
