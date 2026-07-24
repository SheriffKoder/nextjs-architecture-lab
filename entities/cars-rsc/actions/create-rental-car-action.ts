'use server'

/**
 * Create rental car — Server Action (demo RSC drawer)
 *
 * Purpose: Authoritative Zod validation for create payload; returns discriminated result for client toasts + RHF error mapping; persistence stub until DB exists.
 * Used in: `features/demo-rsc-page/components/drawer-forms/rsc-car-create-form-client.tsx`
 * Used for: Server-first mutation contract aligned with `docs/5. server-forms.md` (no trusted client validation).
 *
 * Function Index:
 * - randomDemoOutcome: Demo-only random branch (hard error / field errors / proceed).
 * - createRentalCarAction: Parse → optional demo outcome → build row → success payload or failures.
 *
 * Steps (createRentalCarAction):
 * 1. safeParse incoming unknown with shared `rentalCarFormSchema`.
 * 2. On Zod failure, return flattened field + form errors for the client.
 * 3. On success, optionally return simulated server failures (demo).
 * 4. Assign UUID id, map to table row shape; return trimmed success fields for toast (no full row over the wire).
 * 5. Catch unexpected errors → single `formError` string.
 */

import { randomUUID } from 'crypto'
import {
  rentalCarFormSchema,
  rentalCarFormValuesToTableItem,
} from '@/entities/cars-rsc/validation/rental-car-create-form-schema'

/////////////////////////////////////////////////////////////
// Result types — discriminated union consumed by the client form
/////////////////////////////////////////////////////////////

export type CreateRentalCarActionSuccess = {
  success: true
  id: string
  model: string
  make: string
  color: string
  year: number
}

export type CreateRentalCarActionValidationFailure = {
  success: false
  error: {
    formErrors: string[]
    fieldErrors: Partial<Record<string, string[] | undefined>>
  }
}

export type CreateRentalCarActionHardFailure = {
  success: false
  formError: string
}

export type CreateRentalCarActionResult =
  | CreateRentalCarActionSuccess
  | CreateRentalCarActionValidationFailure
  | CreateRentalCarActionHardFailure

/////////////////////////////////////////////////////////////
// Demo-only messages — remove `randomDemoOutcome` usage when persistence is real
/////////////////////////////////////////////////////////////

const DEMO_FORM_ERRORS = [
  'Demo: inventory service unavailable (random simulation).',
  'Demo: duplicate listing detected (random simulation).',
  'Demo: simulated server fault — try again.',
] as const

//////////////////////////////////
// Picks a random non-success outcome ~2/3 of the time so the UI can exercise toasts + `setError`.
// Used in: `createRentalCarAction` after Zod passes
// Used for: Local demo of server failures without a flaky dependency
//
// Steps:
// 1. Draw r ∈ [0,1).
// 2. First third → hard `formError` from DEMO_FORM_ERRORS.
// 3. Second third → validation-shaped payload with root `formErrors` + `model` fieldErrors.
// 4. Else return null so the handler continues to real success.
//////////////////////////////////
function randomDemoOutcome():
  | CreateRentalCarActionHardFailure
  | CreateRentalCarActionValidationFailure
  | null {
  const r = Math.random()
  // Branch A: non-field server message (toast path on client).
  if (r < 1 / 3) {
    const msg = DEMO_FORM_ERRORS[Math.floor(Math.random() * DEMO_FORM_ERRORS.length)]
    return { success: false, formError: msg }
  }
  // Branch B: structured errors like Zod flatten (field + root messages).
  if (r < 2 / 3) {
    return {
      success: false,
      error: {
        formErrors: ['Demo: request rejected at gateway (random simulation).'],
        fieldErrors: {
          model: ['Demo: this model failed server-side checks (random).'],
        },
      },
    }
  }
  // Branch C: allow happy path this attempt.
  return null
}
//////////////////////////////////

//////////////////////////////////
// Entry point: validates payload and returns a result the client maps to UX without throwing.
// Used in: `RscCarCreateFormClient` inside `startTransition`
// Used for: Replace demo randomness + commented DB block when product persistence exists.
//
// Steps:
// 1. Parse — reject malformed requests with same flatten shape as Zod uses elsewhere.
// 2. Run demo random outcome gate (delete when stable).
// 3. Build domain row with generated id (client-submitted id is overwritten).
// 4. Return partial row for success toast; persistence commented until DB.
// 5. Map thrown errors to `formError` for a single toast.
//////////////////////////////////
export async function createRentalCarAction(
  data: unknown
): Promise<CreateRentalCarActionResult> {
  const parsed = rentalCarFormSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() }
  }

  try {
    const simulated = randomDemoOutcome()
    if (simulated) {
      return simulated
    }

    const id = randomUUID()
    const row = rentalCarFormValuesToTableItem({ ...parsed.data, id })

    // When DB / repository exists:
    // await db.insert(rentalCars).values(row)
    // revalidatePath('/demo-rsc-page')

    return {
      success: true,
      id: row.id,
      model: row.model,
      make: row.make,
      color: row.color,
      year: row.year,
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Something went wrong while creating the car.'
    return { success: false, formError: message }
  }
}
//////////////////////////////////
