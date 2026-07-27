/**
 * @file app/api/demo-hybrid-page/cars/[id]/route.ts
 * Hybrid demo — GET / PATCH / DELETE single rental car by id.
 *
 * Purpose: Thin HTTP adapter over detail + mutation server use-cases
 * Used in: detail `queryFn`, update / status-toggle / delete `mutationFn`
 *
 * Function Index:
 * - GET — resolve `:id` → `{ car }` or 404
 * - PATCH — edit fields OR status-only activity toggle → `{ car }`
 * - DELETE — remove from mock store → 204
 */

import { connection } from 'next/server'
import { NextResponse, type NextRequest } from 'next/server'
import { getRentalCarById } from '@/entities/demo-hybrid-cars/server/get-rental-car-by-id'
import {
  parseRentalCarEditPatch,
  updateRentalCarServer,
  UpdateRentalCarValidationError,
  RentalCarNotFoundError,
} from '@/entities/demo-hybrid-cars/server/update-rental-car'
import {
  tryParseStatusOnlyPatch,
  patchRentalCarRowStatusServer,
  PatchRowStatusValidationError,
  RentalCarRowStatusSimulatedError,
} from '@/entities/demo-hybrid-cars/server/patch-rental-car-row-status'
import { deleteRentalCarServer } from '@/entities/demo-hybrid-cars/server/delete-rental-car'
import type { RentalCarStatusValue } from '@/entities/demo-hybrid-cars/model/rental-car-status'
import { delayDemoHybridApi } from '../../demo-api-delay'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, context: RouteContext) {
  await connection()
  try {
    await delayDemoHybridApi()

    // Step 1: stable id from dynamic segment
    const { id } = await context.params
    const decodedId = decodeURIComponent(id)

    // Step 2: mock store lookup
    const car = await getRentalCarById(decodedId)

    // Step 3: not found vs success
    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 })
    }

    return NextResponse.json({ car }, { status: 200 })
  } catch (error) {
    console.error('[api/demo-hybrid-page/cars/[id]] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to load rental car' },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  await connection()
  try {
    await delayDemoHybridApi()
    const { id } = await context.params
    const decodedId = decodeURIComponent(id)

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    // Status-only body → activity toggle (demo delay + ~50% failure inside repository)
    const statusOnly = tryParseStatusOnlyPatch(body)
    if (statusOnly !== null) {
      const car = await patchRentalCarRowStatusServer(
        decodedId,
        statusOnly as RentalCarStatusValue,
      )
      return NextResponse.json({ car }, { status: 200 })
    }

    const patch = parseRentalCarEditPatch(body)
    const car = await updateRentalCarServer(decodedId, patch)
    return NextResponse.json({ car }, { status: 200 })
  } catch (error) {
    if (
      error instanceof UpdateRentalCarValidationError ||
      error instanceof PatchRowStatusValidationError
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (error instanceof RentalCarNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    if (error instanceof RentalCarRowStatusSimulatedError) {
      return NextResponse.json({ error: error.message }, { status: 503 })
    }
    console.error('[api/demo-hybrid-page/cars/[id]] PATCH error:', error)
    return NextResponse.json(
      { error: 'Failed to update rental car' },
      { status: 500 },
    )
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  await connection()
  try {
    await delayDemoHybridApi()
    const { id } = await context.params
    const decodedId = decodeURIComponent(id)
    await deleteRentalCarServer(decodedId)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof RentalCarNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    console.error('[api/demo-hybrid-page/cars/[id]] DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete rental car' },
      { status: 500 },
    )
  }
}
