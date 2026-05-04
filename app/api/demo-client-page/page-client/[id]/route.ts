/**
 * Demo Client Page — single rental car by id (mock data-source)
 *
 * Purpose: GET one row; PATCH partial update; DELETE remove row — all against mock `rentalCars`
 * Used in: TanStack `fetchRentalCarById` / `updateRentalCarPartial` / `deleteRentalCar`
 */

import { connection } from 'next/server'
import { NextResponse, type NextRequest } from 'next/server'
import { rentalCars } from '@/features/demo-client-page/config/lib/data-source'
import {
  deleteRentalCarFromMockStore,
  parseRentalCarEditPatch,
  RentalCarNotFoundError,
  updateRentalCarInMockStoreById,
  UpdateRentalCarValidationError,
} from '@/features/demo-client-page/lib/server'
import { delayDemoClientApi } from '../../demo-api-delay'

type RouteContext = { params: Promise<{ id: string }> }

/////////////////////////////////////////////////////////////
// Route handlers: GET / PATCH / DELETE by `:id`
/////////////////////////////////////////////////////////////

//////////////////////////////////
// Returns one rental car row from the in-memory mock list.
// Used in: TanStack `fetchRentalCarById` (`useRentalCarDetail`).
// Used for: Hydrate edit drawer without loading the full filtered list.
//
// Steps:
// 1. Opt into Next request context + optional demo latency.
// 2. Resolve `:id` from route params and decode URL encoding.
// 3. Find row in `rentalCars`; 404 JSON when missing.
// 4. Return `{ car }` JSON 200; 500 on unexpected errors.
//////////////////////////////////
export async function GET(_request: NextRequest, context: RouteContext) {
  await connection()
  try {
    await delayDemoClientApi()
    const { id } = await context.params
    const decodedId = decodeURIComponent(id)
    const car = rentalCars.find((c) => c.id === decodedId)
    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 })
    }
    return NextResponse.json({ car }, { status: 200 })
  } catch (error) {
    console.error('[api/demo-client-page/page-client/[id]] GET error:', error)
    return NextResponse.json({ error: 'Failed to load rental car' }, { status: 500 })
  }
}
//////////////////////////////////

//////////////////////////////////
// Merges validated partial JSON into the mock row for the given id.
// Used in: TanStack `updateRentalCarPartial` (`useUpdateRentalCar`).
// Used for: Persist editable fields (status, location, price, mileage, dates) on the server mock store.
//
// Steps:
// 1. Opt into Next request context + optional demo latency.
// 2. Parse JSON body; 400 when body is not valid JSON.
// 3. Validate with `parseRentalCarEditPatch`; merge via `updateRentalCarInMockStoreById`.
// 4. Return `{ car }` 200; map validation / not-found to 400 / 404; 500 otherwise.
//////////////////////////////////
export async function PATCH(request: NextRequest, context: RouteContext) {
  await connection()
  try {
    await delayDemoClientApi()
    const { id } = await context.params
    const decodedId = decodeURIComponent(id)

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const patch = parseRentalCarEditPatch(body)
    const car = await updateRentalCarInMockStoreById(decodedId, patch)
    return NextResponse.json({ car }, { status: 200 })
  } catch (error) {
    if (error instanceof UpdateRentalCarValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (error instanceof RentalCarNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    console.error('[api/demo-client-page/page-client/[id]] PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update rental car' }, { status: 500 })
  }
}
//////////////////////////////////

//////////////////////////////////
// Removes one rental car row from the in-memory mock list.
// Used in: TanStack `deleteRentalCar` (`useDeleteRentalCar`).
// Used for: DELETE-by-id demo; client applies optimistic list removal then reconciles with 204.
//
// Steps:
// 1. Opt into Next request context + optional demo latency.
// 2. Resolve and decode `:id`.
// 3. Call `deleteRentalCarFromMockStore` (throws `RentalCarNotFoundError` when id absent).
// 4. Return 204 empty body on success; 404 / 500 JSON `error` on failure paths.
//////////////////////////////////
export async function DELETE(_request: NextRequest, context: RouteContext) {
  await connection()
  try {
    await delayDemoClientApi()
    const { id } = await context.params
    const decodedId = decodeURIComponent(id)
    await deleteRentalCarFromMockStore(decodedId)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof RentalCarNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    console.error('[api/demo-client-page/page-client/[id]] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete rental car' }, { status: 500 })
  }
}
//////////////////////////////////
