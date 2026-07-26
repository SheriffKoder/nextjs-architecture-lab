/**
 * AddCarButton
 *
 * Purpose: Isolated control that opens the URL-driven car drawer (`url-drawer` + `openCreate`)
 * Used in: `demo-rsc-page-header` / `ActionButtons`
 * Used for: Keeps drawer navigation out of shared `action-buttons.tsx`
 *
 * Mobile: icon-only `[+]`. Desktop: icon + “Add Car” label.
 */

'use client'

import { Plus } from 'lucide-react'
import PrimaryButton from '@/shared/ui/buttons/primary-button'
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
      <button
        type="button"
        onClick={open}
        className="inline-flex size-10 items-center justify-center rounded-md border border-input bg-background text-foreground transition-colors hover:bg-foreground/5 md:hidden"
        aria-label="Add Car"
        title="Add Car"
      >
        <Plus className="h-5 w-5" strokeWidth={2} />
      </button>

      <div className="hidden md:block">
        <PrimaryButton
          type="button"
          onClick={open}
          icon={Plus}
          iconPosition="left"
          buttonClassName="border border-input bg-background text-foreground whitespace-nowrap"
          size="default"
        >
          Add Car
        </PrimaryButton>
      </div>
    </>
  )
}
