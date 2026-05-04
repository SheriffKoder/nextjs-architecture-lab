/**
 * Demo Client Page — list + create API
 *
 * Name: page-client/route.ts
 * Purpose: GET returns filtered, sorted, paginated mock rental cars; POST creates a row (validated, server `id`) without mutating mock seed data
 * Used in: `features/demo-client-page/tanstack/handler.ts` (`fetchRentalCars`; POST client helper when added)
 * Used for: Same URL query contract as the demo RSC page (`searchParams` shape) + TanStack create mutation
 *
 * Function Index:
 * - GET: Parse query string → `getRentalCarsData` → `{ cars, pagination }`
 * - POST: JSON body → `parseCreateRentalCarPayload` → `createRentalCarServer` → `{ car }` (201)
 *
 * Steps (GET):
 * 0. Optional demo latency (`../demo-api-delay`) so TanStack loading states are visible.
 * 1. Build a plain `params` object from `URLSearchParams` (merge duplicate keys into arrays).
 * 2. Delegate to `getRentalCarsData` in the feature `lib/server` package.
 * 3. Return JSON 200 or 500 on failure.
 *
 * Steps (POST):
 * 0. Optional demo latency.
 * 0b. Optional **forced error** (`DEMO_FORCE_POST_CAR_ERROR`) for testing client `onError` / optimistic rollback.
 * 1. Parse JSON body; validate with `parseCreateRentalCarPayload`.
 * 2. `createRentalCarServer` returns canonical row (DB-ready module).
 * 3. Return 201 `{ car }`, 400 on validation / JSON errors, 500 otherwise.
 */

import { connection } from 'next/server'
import { NextResponse, type NextRequest } from 'next/server'
import {
  CreateRentalCarValidationError,
  createRentalCarServer,
  getRentalCarsData,
  parseCreateRentalCarPayload,
} from '@/features/demo-client-page/lib/server'
// import { rentalCarFormSchema } from '@/features/demo-client-page/validation/rental-car-form-schema'
import { delayDemoClientApi } from '../demo-api-delay'

/** `true` → POST always returns 503 + JSON `error` (mutation fails, cache rolls back). Set to `false` for normal creates. */
const DEMO_FORCE_POST_CAR_ERROR = false

// Example: align POST with client Zod (strip `id` before parse if schema omits it).
// const parsed = rentalCarFormSchema.safeParse(body)
// if (!parsed.success) {
//   return NextResponse.json(
//     { error: parsed.error.flatten().fieldErrors },
//     { status: 400 }
//   )
// }
// const input = parsed.data

export async function GET(request: NextRequest) {
  await connection()
  try {
    await delayDemoClientApi()

    const { searchParams } = new URL(request.url)

    // Step 1: Mirror Next `searchParams` shape — duplicate keys become string[]
    const params: { [key: string]: string | string[] | undefined } = {}
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

    // Step 2: Run in-memory pipeline (filter → sort → paginate)
    const result = await getRentalCarsData(params)

    // Step 3: Response body matches what the client table expects (`cars` + pagination meta)
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('[api/demo-client-page/page-client] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to load rental cars' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  await connection()
  try {
    await delayDemoClientApi()

    if (DEMO_FORCE_POST_CAR_ERROR) {
      return NextResponse.json(
        {
          error:
            'Demo: intentional POST failure (set DEMO_FORCE_POST_CAR_ERROR to false in app/api/demo-client-page/page-client/route.ts).',
        },
        { status: 503 }
      )
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const input = parseCreateRentalCarPayload(body) // replace with Zod `parsed.data` when uncommenting block above
    const car = await createRentalCarServer(input)
    return NextResponse.json({ car }, { status: 201 })
  } catch (error) {
    if (error instanceof CreateRentalCarValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('[api/demo-client-page/page-client] POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create rental car' },
      { status: 500 }
    )
  }
}
