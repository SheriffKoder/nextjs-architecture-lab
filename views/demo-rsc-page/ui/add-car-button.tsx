/**
 * AddCarButton
 *
 * Purpose: Isolated control that opens the URL-driven car drawer (`url-drawer` + `openCreate`)
 * Used in: `demo-rsc-page-header` / `ActionButtons`
 *
 * Mobile: icon-only `[+]`. Desktop: icon + “Add Car” label.
 * Uses `Button` variant **action**.
 */

'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDrawerActions } from '@/platform/url-kit/url-drawer'
import { DEMO_RSC_CAR_DRAWER_KEY } from './drawer-content/rsc-car-drawer-content'

interface AddCarButtonProps {
  /** Query `drawer=` value; must match `RscCarDrawerContent` */
  drawerKey?: string
}

export default function AddCarButton({ drawerKey = DEMO_RSC_CAR_DRAWER_KEY }: AddCarButtonProps) {
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
        aria-label="Add Car"
        title="Add Car"
      >
        <Plus className="h-4 w-4" strokeWidth={2} />
      </Button>

      <Button
        type="button"
        variant="action"
        size="default"
        onClick={open}
        className="hidden md:inline-flex h-auto py-2.5 [&_svg]:size-5"
      >
        <Plus strokeWidth={2} />
        Add Car
      </Button>
    </>
  )
}
