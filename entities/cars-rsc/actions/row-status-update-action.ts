'use server'

/**
 * Row status update — Server Action (demo RSC table "Set activity" column)
 *
 * Purpose: Toggle activity status (`available` ↔ `reserved` rule) with validation + path revalidation.
 * Used in: `demo-rsc-content.tsx` via `columnActions.setActivity`
 */

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getNextActivityStatus } from '@/entities/cars-rsc/lib/rental-car-activity-status'
import type { RentalCarStatusValue } from '@/entities/cars-rsc/types/rental-car-status'
import { rentalCars } from '@/entities/cars-rsc/server/data-source'
import {
  RentalCarRowNotFoundError,
  RentalCarRowStatusSimulatedError,
  updateRentalCarRowStatusInMockStore,
} from '@/entities/cars-rsc/server/update-rental-car-row-status'

const rowStatusUpdateSchema = z.object({
  id: z.string().trim().min(1, 'Car id is required'),
})

export type RowStatusUpdateActionSuccess = {
  success: true
  id: string
  status: RentalCarStatusValue
}

export type RowStatusUpdateActionFailure = {
  success: false
  error: string
}

export type RowStatusUpdateActionResult =
  | RowStatusUpdateActionSuccess
  | RowStatusUpdateActionFailure

export async function rowStatusUpdateAction(
  id: string
): Promise<RowStatusUpdateActionResult> {
  const parsed = rowStatusUpdateSchema.safeParse({ id })
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors.id?.join(', ') ?? 'Invalid id'
    return { success: false, error: msg }
  }

  try {
    const row = rentalCars.find((c) => c.id === parsed.data.id)
    if (!row) {
      return { success: false, error: `Car not found (${parsed.data.id})` }
    }

    const nextStatus = getNextActivityStatus(row.status)

    // When DB / repository exists:
    // await db.update(rentalCars).set({ status: nextStatus }).where(eq(rentalCars.id, parsed.data.id))

    const updated = await updateRentalCarRowStatusInMockStore(parsed.data.id, nextStatus)

    // We use `revalidatePath` (not `revalidateTag`) because list/facet loaders in
    // `demo-rsc-cached-loaders.ts` use `unstable_cache` with time-based `revalidate` only —
    // no shared cache tags yet. Path revalidation refreshes this route's RSC payload on the
    // next `router.refresh()`. When loaders tag their caches (e.g. `cars`), switch to
    // `revalidateTag('demo-rsc-cars')` to invalidate list + facets + detail together.
    revalidatePath('/demo-rsc-page')

    return { success: true, id: updated.id, status: updated.status as RentalCarStatusValue }
  } catch (e) {
    if (
      e instanceof RentalCarRowNotFoundError ||
      e instanceof RentalCarRowStatusSimulatedError
    ) {
      return { success: false, error: e.message }
    }
    const message = e instanceof Error ? e.message : 'Could not update status'
    return { success: false, error: message }
  }
}
