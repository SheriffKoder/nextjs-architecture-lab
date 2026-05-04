/**
 * Action Buttons Component
 * 
 * Purpose: Container for action buttons (Export CSV)
 * Used in: features/reports-expirations/index.tsx
 * Why: Provides consistent action button layout
 * 
 * Function Index:
 * - ActionButtons: Component that renders export CSV button
 */

import React from 'react'
import { Save } from 'lucide-react'
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
