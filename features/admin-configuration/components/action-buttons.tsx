/**
 * Action Buttons Component
 * 
 * Purpose: Container for action buttons (Apply and Cancel)
 * Used in: features/admin-configuration/index.tsx
 * Why: Provides consistent action button layout
 */

import React from 'react'
import { Check, Undo2 } from 'lucide-react'
import PrimaryButton from '@/components/design/primary-button'

interface ActionButtonsProps {
  onApply: () => void
  onCancel: () => void
}

export default function ActionButtons({ onApply, onCancel }: ActionButtonsProps) {
  return (
    <div className="flex flex-row gap-2 items-start w-full lg:w-auto relative">

        <PrimaryButton
        onClick={onCancel}
        icon={Undo2}
        iconPosition="left"
        buttonClassName="bg-primary text-white/90 whitespace-nowrap"
        size="default"
        >
            Cancel
        </PrimaryButton>

        <PrimaryButton
        onClick={onApply}
        icon={Check}
        iconPosition="left"
        buttonClassName="bg-primary text-white/90 whitespace-nowrap"
        size="default"
        >
            Apply
        </PrimaryButton>
    </div>
  )
}
