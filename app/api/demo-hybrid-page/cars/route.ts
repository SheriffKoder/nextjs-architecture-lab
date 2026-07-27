/**
 * @file app/api/demo-hybrid-page/cars/route.ts
 * Hybrid demo — GET paginated rental car list.
 *
 * Purpose: Thin HTTP adapter over `getRentalCarsData`
 * Used in: `entities/demo-hybrid-cars/client/fetch-rental-cars.ts`
 * Used for: TanStack list `queryFn` transport (Phase 2+ client refetches)
 *
 * Function Index:
 * - GET — parse query string → list query → `{ cars, pagination }`
 * - searchParamsToRecord — merge duplicate keys into string arrays
 *
 * Steps (GET):
 * 0. Opt into request context + optional demo latency.
 * 1. Parse URL search params into Next `searchParams` shape.
 * 2. Build typed `RentalCarListQuery`.
 * 3. Delegate to entity server use-case.
 * 4. Return JSON 200 or 500 on failure.
 */

import { connection } from 'next/server'
import { NextResponse, type NextRequest } from 'next/server'
import { buildRentalCarListQuery } from '@/entities/demo-hybrid-cars/transform/build-rental-car-list-query'
import { getRentalCarsData } from '@/entities/demo-hybrid-cars/server/get-rental-cars-data'
import { delayDemoHybridApi } from '../demo-api-delay'

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
