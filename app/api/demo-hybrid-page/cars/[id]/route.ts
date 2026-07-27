/**
 * @file app/api/demo-hybrid-page/cars/[id]/route.ts
 * Hybrid demo — GET single rental car by id.
 *
 * Purpose: Thin HTTP adapter over `getRentalCarById`
 * Used in: `entities/demo-hybrid-cars/client/fetch-rental-car-by-id.ts`
 * Used for: Detail drawer and hover prefetch (Phases 1 and 3)
 *
 * Function Index:
 * - GET — resolve `:id` → `{ car }` or 404
 *
 * Steps (GET):
 * 0. Opt into request context + optional demo latency.
 * 1. Decode `:id` from route params.
 * 2. Load row from mock repository via server use-case.
 * 3. Return 404 when missing, 200 `{ car }` on success.
 */

import { connection } from 'next/server'
import { NextResponse, type NextRequest } from 'next/server'
import { getRentalCarById } from '@/entities/demo-hybrid-cars/server/get-rental-car-by-id'
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
      { status: 500 }
    )
  }
}
