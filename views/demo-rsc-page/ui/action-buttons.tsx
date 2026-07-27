/**
 * Action Buttons Component
 *
 * Purpose: Shared header actions — Mailchimp export stub; optional URL-drawer Add Car; optional demo controls
 * Used in: `demo-rsc-index.tsx`, `demo-client-page/demo-client-index.tsx`
 * Why: Demo RSC passes `showAddCarDrawerButton`; client page composes its own TanStack Add Car beside this row
 */

'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
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
    <div className="flex shrink-0 flex-row flex-wrap items-center gap-2">

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
        <Button
          type="button"
          variant="action"
          size="default"
          onClick={openAddCarModal}
          className="h-auto whitespace-nowrap py-2.5"
        >
          Add car
        </Button>
      ) : null}

      {onGenerateError ? (
        <Button
          type="button"
          variant="action"
          size="sm"
          onClick={() => void onGenerateError()}
          className="whitespace-nowrap border-destructive/50 text-destructive hover:bg-destructive/10"
        >
          Generate Error
        </Button>
      ) : null}
    </div>
  )
}
