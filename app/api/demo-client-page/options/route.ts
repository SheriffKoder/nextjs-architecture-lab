/**
 * Demo Client Page — filter options API
 *
 * Name: options/route.ts
 * Purpose: Return `FilterConfig[]` with populated `options` and facet counts for the current URL
 * Used in: `features/demo-client-page/tanstack/handler.ts` (`fetchRentalCarFilterOptions`)
 * Used for: `FiltersHeader` / dropdown filters that need `totalCount` / `initialCount` per option
 *
 * Function Index:
 * - GET: Parse query string → `getFilterOptionsServer` → `FilterConfig[]`
 *
 * Steps:
 * 0. Optional demo latency (`../demo-api-delay`) so TanStack loading states are visible.
 * 1. Build `params` from the request URL (same shape as the list route).
 * 2. Call `getFilterOptionsServer` with default base configs from the feature config.
 * 3. Return JSON 200 or 500 on failure.
 */

import { connection } from 'next/server'
import { NextResponse, type NextRequest } from 'next/server'
import { getFilterOptionsServer } from '@/features/demo-client-page/lib/server'
import { delayDemoClientApi } from '../demo-api-delay'

export async function GET(request: NextRequest) {
  await connection()
  try {
    await delayDemoClientApi()

    const { searchParams } = new URL(request.url)

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

    const filtersWithOptions = await getFilterOptionsServer(undefined, params)

    return NextResponse.json(filtersWithOptions, { status: 200 })
  } catch (error) {
    console.error('[api/demo-client-page/options] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to load filter options' },
      { status: 500 }
    )
  }
}
