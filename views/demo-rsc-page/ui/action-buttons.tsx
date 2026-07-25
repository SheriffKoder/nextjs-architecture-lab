/**
 * Action Buttons Component
 *
 * Purpose: Shared header actions — Mailchimp export stub; optional URL-drawer Add Car; optional demo controls
 * Used in: `demo-rsc-index.tsx`, `demo-client-page/demo-client-index.tsx`
 * Why: Demo RSC passes `showAddCarDrawerButton`; client page composes its own TanStack Add Car beside this row
 */

'use client'

import React from 'react'
import PrimaryButton from '@/shared/ui/buttons/primary-button'
import { LogoIconPair } from '@/widgets/side-nav'
import AddCarButton from './add-car-button'

interface ActionButtonsProps {
  exportForMailchimp: () => void | Promise<void>
  /** When true, renders `AddCarButton` (url-drawer `openCreate`) after Mailchimp — demo RSC only */
  showAddCarDrawerButton?: boolean
  /** Classic header “Add car” for client demo (e.g. TanStack drawer). */
  openAddCarModal?: () => void
  /** When set, shows a secondary control (e.g. demo toast trigger) */
  onGenerateError?: () => void | Promise<void>
}

export default function ActionButtons({
  exportForMailchimp,
  showAddCarDrawerButton,
  openAddCarModal,
  onGenerateError,
}: ActionButtonsProps) {
  return (
    <div className="flex w-full flex-row flex-wrap items-start gap-2 lg:w-auto">

      {/* // Custom icon button for export for mailchimp */}
      {/* <button
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
      </button> */}

      {showAddCarDrawerButton ? <AddCarButton /> : null}

      {openAddCarModal ? (
        <PrimaryButton
          type="button"
          onClick={openAddCarModal}
          buttonClassName="border border-input bg-background text-foreground whitespace-nowrap"
          size="default"
        >
          Add car
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
