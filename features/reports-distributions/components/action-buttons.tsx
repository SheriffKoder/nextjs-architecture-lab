/**
 * Action Buttons Component
 * 
 * Purpose: Container for action buttons (Export CSV and Add Distribution)
 * Used in: features/reports-distributions/index.tsx
 * Why: Provides consistent action button layout
 * 
 * Function Index:
 * - ActionButtons: Component that renders export and add distribution buttons
 */

import React from 'react'
import { Save, Plus } from 'lucide-react'
import PrimaryButton from '@/components/design/primary-button'

interface ActionButtonsProps {
  onExportCSV: () => void
}

export default function ActionButtons({ onExportCSV }: ActionButtonsProps) {
  return (
    <div className="flex flex-row gap-2 items-start w-full lg:w-auto">
      <PrimaryButton
        onClick={onExportCSV}
        icon={Save}
        iconPosition="left"
        buttonClassName="bg-primary text-white/90 whitespace-nowrap"
        size="default"
      >
        Export CSV
      </PrimaryButton>
    </div>
  )
}
