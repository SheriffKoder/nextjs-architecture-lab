/**
 * @file views/demo-rsc-page/ui/drawer/modes/create/create-content.tsx
 * Create mode (`mode=create`) — sticky header + RHF form via shared `formId`.
 *
 * Used in: `car-drawer-orchestrator` when `mode=create`
 * Keeps `useTransition` here so header `isPending` matches `createRentalCarAction`.
 */

'use client'

import { useCallback, useRef, useTransition } from 'react'
import { RscCarDrawerCreateHeader } from '../../chrome/sticky-header'
import { RscCarCreateFormClient } from '../../forms/create-form'

const RSC_CAR_CREATE_FORM_ID = 'rsc-car-create-form'

export default function CarDrawerCreateContent() {
  const [isPending, startTransition] = useTransition()
  const resetFormRef = useRef<(() => void) | null>(null)

  const handleRegisterFormActions = useCallback((actions: { resetForm: () => void }) => {
    resetFormRef.current = actions.resetForm
  }, [])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <RscCarDrawerCreateHeader
        formId={RSC_CAR_CREATE_FORM_ID}
        isSubmitting={isPending}
        onResetForm={() => resetFormRef.current?.()}
      />
      <RscCarCreateFormClient
        formId={RSC_CAR_CREATE_FORM_ID}
        startTransition={startTransition}
        onRegisterActions={handleRegisterFormActions}
      />
    </div>
  )
}
