/**
 * Action Buttons Component
 * 
 * Purpose: Container for action buttons (Export CSV and Add Project)
 * Used in: features/portfolio-project-board/index.tsx
 * Why: Provides consistent action button layout
 * 
 * Function Index:
 * - ActionButtons: Component that renders export and add project buttons
 */

import React from 'react'
import { Save, Plus } from 'lucide-react'
import PrimaryButton from '@/components/design/primary-button'

interface ActionButtonsProps {
  onExportCSV: () => void
  onAddInvestor: () => void
}

export default function ActionButtons({ onExportCSV, onAddInvestor }: ActionButtonsProps) {
  return (
    <div className="flex flex-row gap-2">
      <PrimaryButton
        onClick={onExportCSV}
        icon={Save}
        iconPosition="left"
        buttonClassName="bg-primary text-white/90 whitespace-nowrap"
        size="default"
      >
        Export CSV
      </PrimaryButton>
      
      <PrimaryButton
        onClick={onAddInvestor}
        icon={Plus}
        iconPosition="left"
        buttonClassName="bg-primary text-white/90 whitespace-nowrap"
        size="default"
      >
        Add investor
      </PrimaryButton>
    </div>
  )
}
