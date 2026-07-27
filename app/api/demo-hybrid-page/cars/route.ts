/**
 * @file app/api/demo-hybrid-page/cars/route.ts
 * Hybrid demo — GET paginated list + POST create.
 *
 * Purpose: Thin HTTP adapter over list + create server use-cases
 * Used in: `entities/demo-hybrid-cars/client/fetch-rental-cars.ts`, `client/mutate-rental-cars.ts`
 * Used for: TanStack list `queryFn` + create `mutationFn`
 *
 * Function Index:
 * - GET — parse query string → list query → `{ cars, pagination }`
 * - POST — JSON body → validate → mock store insert → `{ car }` 201
 * - searchParamsToRecord — merge duplicate keys into string arrays
 *
 * Style: Route Handlers (not server actions) — documented in entity README.
 */

import { connection } from 'next/server'
import { NextResponse, type NextRequest } from 'next/server'
import { buildRentalCarListQuery } from '@/entities/demo-hybrid-cars/transform/build-rental-car-list-query'
import { getRentalCarsData } from '@/entities/demo-hybrid-cars/server/get-rental-cars-data'
import {
  CreateRentalCarValidationError,
  createRentalCarServer,
  parseCreateRentalCarPayload,
} from '@/entities/demo-hybrid-cars/server/create-rental-car'
import { delayDemoHybridApi } from '../demo-api-delay'

/** `true` → POST always returns 503 (mutation fails, optimistic rollback). */
const DEMO_FORCE_POST_CAR_ERROR = false

/** Mirror Next `searchParams` — duplicate keys become `string[]`. */
function searchParamsToRecord(
  searchParams: URLSearchParams
): Record<string, string | string[] | undefined> {
  const params: Record<string, string | string[] | undefined> = {}
  searchParams.forEach((value, key) => {
    if (params[key]) {
      const existing = params[key]
      params[key] = Array.isArray(existing)
        ? [...existing, value]
        : [existing as string, value]
    } else {
      params[key] = value
    }
  })
  return params
}

export async function GET(request: NextRequest) {
  // Step 0: dynamic route — run per request
  await connection()
  try {
    await delayDemoHybridApi()

    // Step 1: extract query string from request URL
    const { searchParams } = new URL(request.url)
    const params = searchParamsToRecord(searchParams)
    // Step 2: shared URL → typed query mapping
    const query = buildRentalCarListQuery(params)
    // Step 3: in-memory filter → sort → paginate pipeline
    const result = await getRentalCarsData(query)

    // Step 4: JSON payload matches TanStack client expectations
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('[api/demo-hybrid-page/cars] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to load rental cars' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  await connection()
  try {
    await delayDemoHybridApi()

    if (DEMO_FORCE_POST_CAR_ERROR) {
      return NextResponse.json(
        {
          error:
            'Demo: intentional POST failure (set DEMO_FORCE_POST_CAR_ERROR to false in app/api/demo-hybrid-page/cars/route.ts).',
        },
        { status: 503 },
      )
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const input = parseCreateRentalCarPayload(body)
    const car = await createRentalCarServer(input)
    return NextResponse.json({ car }, { status: 201 })
  } catch (error) {
    if (error instanceof CreateRentalCarValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('[api/demo-hybrid-page/cars] POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create rental car' },
      { status: 500 },
    )
  }
}
