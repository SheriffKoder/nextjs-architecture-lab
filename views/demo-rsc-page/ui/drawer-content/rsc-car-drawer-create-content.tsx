/**
 * RscCarDrawerCreateContent
 *
 * Purpose: Client shell for the URL-driven create drawer — wires sticky header (submit/reset) to the RHF form via shared `formId` + transition state.
 * Used in: `features/demo-rsc-page/components/drawer-content/rsc-car-drawer-content.tsx` when `mode=create`
 * Used for: Keeps `useTransition` at this level so header `isPending` reflects the same transition as `createRentalCarAction` (see project-guidelines: state placement / startTransition).
 *
 * Function Index:
 * - RscCarDrawerCreateContent (default): Registers reset ref, renders header + `RscCarCreateFormClient`.
 *
 * Steps (default export):
 * 1. `useTransition` supplies `startTransition` passed into the form for server action submission.
 * 2. `resetFormRef` stores RHF reset from the child so header Reset avoids native reset (controlled fields).
 * 3. Stable `useCallback` registers the reset function whenever the form exposes it.
 */

'use client'

import { useCallback, useRef, useTransition } from 'react'
import { RscCarDrawerCreateHeader } from './rsc-car-drawer-sticky-header'
import { RscCarCreateFormClient } from '../drawer-forms/rsc-car-create-form-client'

/////////////////////////////////////////////////////////////
// Constants — shared id ties `<form>` to header `type="submit" form={formId}`
/////////////////////////////////////////////////////////////

const RSC_CAR_CREATE_FORM_ID = 'rsc-car-create-form'

//////////////////////////////////
// Create drawer body: header outside `<form>` but associated via HTML form attribute.
// Used in: `rsc-car-drawer-content.tsx`
// Used for: Composition-only shell per `docs/5. server-forms.md` (no field logic here).
//////////////////////////////////
export default function RscCarDrawerCreateContent() {
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
//////////////////////////////////
