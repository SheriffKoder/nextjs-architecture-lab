/**
 * Action Buttons Component
 * 
 * Purpose: Container for action buttons (Export CSV)
 * Used in: features/reports-newsletter-tracker/index.tsx
 * Why: Provides consistent action button layout
 * 
 * Function Index:
 * - ActionButtons: Component that renders export CSV button using LogoIconPair
 */

import React from 'react'
import { Info } from 'lucide-react'
import LogoIconPair from '@/components/side-nav/components/logo-icon-pair'

interface ActionButtonsProps {
  onExportCSV: () => void
}

export default function ActionButtons({ onExportCSV }: ActionButtonsProps) {
  return (
    <div className="flex flex-row gap-2 items-start w-full lg:w-auto relative">
      <button
        onClick={onExportCSV}
        className="cursor-pointer transition-all duration-200 mt-2 lg:mt-0"
      >
        <LogoIconPair
          icon1={{
            imageUrl: '/icons/mailchimp-logo-light.png',
            imageUrlDark: '/icons/mailchimp-logo-dark.png',
            color: '#FFFFFF',
            width: 24,
            height: 24,
            borderRadius: 'rounded-md'
          }}
          icon2={{
            text: 'Export for Mailchimp',
            textColor: 'text-background'
          }}
          backgroundColor="bg-foreground"
          borderColor="border-foreground"
          borderRadius="rounded-lg"
          padding="px-4 py-2"
          gap="gap-3"
        />
      </button>
      <div className="relative lg:absolute top-full lg:whitespace-nowrap left-0 right-0 mt-1.5 flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
        <span className="text-right">Exported list will for visible data and be in CSV format</span>
        <Info size={14} className="flex-shrink-0" />
      </div>
    </div>
  )
}
