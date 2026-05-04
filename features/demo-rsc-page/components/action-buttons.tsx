/**
 * Action Buttons Component
 *
 * Purpose: Shared header actions — Mailchimp export stub; optional Add Car (client drawer demo only)
 * Used in: `demo-rsc-index.tsx`
 * Why: Consistent action button layout for the demo RSC page
 */

'use client'

import React from 'react'
import { Plus } from 'lucide-react'
import PrimaryButton from '@/components/design/primary-button'
import LogoIconPair from '@/components/side-nav/components/logo-icon-pair'

interface ActionButtonsProps {
  exportForMailchimp: () => void | Promise<void>
  /** When set (e.g. TanStack demo client page), renders Add Car — omitted on pure RSC demo */
  openAddCarModal?: () => void | Promise<void>
  /** When set, shows a secondary control (e.g. demo toast trigger) */
  onGenerateError?: () => void | Promise<void>
}

export default function ActionButtons({
  exportForMailchimp,
  openAddCarModal,
  onGenerateError,
}: ActionButtonsProps) {
  return (
    <div className="flex w-full flex-row flex-wrap items-start gap-2 lg:w-auto">
      <button
        type="button"
        onClick={() => void exportForMailchimp()}
        className="mt-2 cursor-pointer transition-all duration-200 lg:mt-0"
      >
        <LogoIconPair
          icon1={{
            imageUrl: '/icons/mailchimp-logo-light.png',
            imageUrlDark: '/icons/mailchimp-logo-dark.png',
            color: '#FFFFFF',
            width: 24,
            height: 24,
            borderRadius: 'rounded-md',
          }}
          icon2={{
            text: 'Export for Mailchimp',
            textColor: 'text-background',
          }}
          backgroundColor="bg-foreground"
          borderColor="border-foreground"
          borderRadius="rounded-lg"
          padding="px-4 py-2"
          gap="gap-3"
        />
      </button>

      {openAddCarModal ? (
        <PrimaryButton
          type="button"
          onClick={() => void openAddCarModal()}
          icon={Plus}
          iconPosition="left"
          buttonClassName="border border-input bg-background text-foreground whitespace-nowrap"
          size="default"
        >
          Add Car
        </PrimaryButton>
      ) : null}

      {onGenerateError ? (
        <PrimaryButton
          type="button"
          onClick={() => void onGenerateError()}
          buttonClassName="border border-destructive/50 bg-background text-destructive hover:bg-destructive/10 whitespace-nowrap"
          size="default"
        >
          Generate Error
        </PrimaryButton>
      ) : null}
    </div>
  )
}
