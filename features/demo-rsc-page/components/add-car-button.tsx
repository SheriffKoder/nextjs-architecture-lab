/**
 * AddCarButton
 *
 * Purpose: Isolated control that opens the URL-driven car drawer (`drawer-2` + `openCreate`)
 * Used in: `demo-rsc-index.tsx` header beside `ActionButtons`
 * Used for: Keeps drawer navigation out of shared `action-buttons.tsx`
 */

'use client'

import { Plus } from 'lucide-react'
import PrimaryButton from '@/components/design/primary-button'
import { useDrawerActions } from '@/features/ui/drawer-2'
import { DEMO_RSC_CAR_DRAWER_KEY } from './drawer-content/rsc-car-drawer-content'

interface AddCarButtonProps {
  /** Query `drawer=` value; must match `RscCarDrawerContent` */
  drawerKey?: string
}

export default function AddCarButton({ drawerKey = DEMO_RSC_CAR_DRAWER_KEY }: AddCarButtonProps) {
  const { openCreate } = useDrawerActions()

  return (
    <PrimaryButton
      type="button"
      onClick={() => openCreate(drawerKey)}
      icon={Plus}
      iconPosition="left"
      buttonClassName="border border-input bg-background text-foreground whitespace-nowrap"
      size="default"
    >
      Add Car
    </PrimaryButton>
  )
}
