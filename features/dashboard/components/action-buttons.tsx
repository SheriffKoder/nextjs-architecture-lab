/**
 * Dashboard Action Buttons Component
 * 
 * Purpose: Container for action buttons (Two Mailchimp exports and one CSV export)
 * Used in: features/dashboard/index.tsx
 * Why: Provides consistent action button layout
 */

import React from 'react'
import { Info, ExternalLink, Download } from 'lucide-react'
import LogoIconPair from '@/components/side-nav/components/logo-icon-pair'
import { Button } from '@/components/ui/button'
import PrimaryButton from '@/components/design/primary-button'

interface ActionButtonsProps {
  appfolioUrl?: string
  quickbooksUrl?: string
  buildertrendUrl?: string
  onExportPDF: () => void
}

export default function ActionButtons({ 
  appfolioUrl, 
  quickbooksUrl, 
  buildertrendUrl,
  onExportPDF 
}: ActionButtonsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 w-full lg:w-auto relative">
      {appfolioUrl && (
        <a
          href={appfolioUrl}
          target="_blank"
          aria-label="Open Appfolio in new tab"
          rel="noopener noreferrer"
          className="cursor-pointer transition-all duration-200 mt-2 lg:mt-0"
          title="Open Quickbooks in new tab"
        >
          <LogoIconPair
            icon1={{
              imageUrl: '/icons/appfolio-logo.png',
              color: '#ffffff', // Blue color in hex
              width: 20, // w-10 = 40px
              height: 20, // h-10 = 40px
              borderRadius: 'rounded-md'
            }}
            icon2={{
              imageUrl: '/icons/appfolio-text.png',
              color: '#ffffff', // Green color in hex
              width: 60, // w-24 = 96px
              height: 25, // h-10 = 40px
              borderRadius: 'rounded-md'
            }}
            iconRight={{
              lucideIcon: ExternalLink,
              lucideIconSize: 16,
              lucideIconColor: 'text-background'
            }}
            backgroundColor="bg-foreground"
            borderColor="border-foreground"
            borderRadius="rounded-lg"
            padding="px-4 py-1.5"
            gap="gap-3"
          />
        </a>
      )}
      {quickbooksUrl && (
        <a
          href={quickbooksUrl}
          target="_blank"
          aria-label="Open Quickbooks in new tab"
          rel="noopener noreferrer"
          className="cursor-pointer transition-all duration-200 mt-2 lg:mt-0"
          title="Open Quickbooks in new tab"
        >
          <LogoIconPair
            icon1={{
              imageUrl: '/icons/quickbooks-logo.png',
              color: '#ffffff', // Blue color in hex
              width: 20, // w-10 = 40px
              height: 20, // h-10 = 40px
              borderRadius: 'rounded-md'
            }}
            icon2={{
              imageUrl: '/icons/quickbooks-text.png',
              color: '#ffffff', // Green color in hex
              width: 80, // w-24 = 96px
              height: 25, // h-10 = 40px
              borderRadius: 'rounded-md'
            }}
            iconRight={{
              lucideIcon: ExternalLink,
              lucideIconSize: 16,
              lucideIconColor: 'text-background'
            }}
            backgroundColor="bg-foreground"
            borderColor="border-foreground"
            borderRadius="rounded-lg"
            padding="px-4 py-1.5"
            gap="gap-3"
          />
        </a>
      )}
      {buildertrendUrl && (
        <a
          href={buildertrendUrl}
          target="_blank"
          aria-label="Open Buildertrend in new tab"
          rel="noopener noreferrer"
          className="cursor-pointer transition-all duration-200 mt-2 lg:mt-0"
          title="Open Buildertrend in new tab"
        >
          <LogoIconPair
            icon1={{
              imageUrl: '/icons/buildertrend-icon-light.png',
              color: '#ffffff', // Blue color in hex
              width: 20, // w-10 = 40px
              height: 20, // h-10 = 40px
              borderRadius: 'rounded-md'
            }}
            icon2={{
              imageUrl: '/icons/buildertrend-text.png',
              color: '#ffffff', // Green color in hex
              width: 80, // w-24 = 96px
              height: 25, // h-10 = 40px
              borderRadius: 'rounded-md'
            }}
            iconRight={{
              lucideIcon: ExternalLink,
              lucideIconSize: 16,
              lucideIconColor: 'text-background'
            }}
            backgroundColor="bg-foreground"
            borderColor="border-foreground"
            borderRadius="rounded-lg"
            padding="px-4 py-1.5"
            gap="gap-3"
          />
        </a>
      )}
      <PrimaryButton
        onClick={onExportPDF}
        className="cursor-pointer transition-all duration-200 mt-2 lg:mt-0"
        buttonClassName="bg-primary text-white/90 whitespace-nowrap"
        size="default"
        icon={Download}
        iconPosition="right"
        title="Export screenshot as PDF"
      >
        Export as PDF
      </PrimaryButton>
    </div>
  )
}
