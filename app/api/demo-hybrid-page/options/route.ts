/**
 * @file app/api/demo-hybrid-page/options/route.ts
 * Hybrid demo — GET filter facet options for the current URL.
 *
 * Purpose: Thin HTTP adapter over `getFilterOptionsServer`
 * Used in: `entities/demo-hybrid-cars/client/fetch-filter-options.ts`
 * Used for: Filter toolbar/header option lists with counts (Phase 2+)
 *
 * Function Index:
 * - GET — parse query string → facet configs with options
 * - searchParamsToRecord — merge duplicate keys into string arrays
 *
 * Steps (GET):
 * 0. Opt into request context + optional demo latency.
 * 1. Parse URL search params.
 * 2. Delegate to entity facet server fn (uses hybrid view base filter configs).
 * 3. Return JSON 200 or 500 on failure.
 */

import { connection } from 'next/server'
import { NextResponse, type NextRequest } from 'next/server'
import { getFilterOptionsServer } from '@/entities/demo-hybrid-cars/server/get-filter-options-server'
import { delayDemoHybridApi } from '../demo-api-delay'

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
  await connection()
  try {
    await delayDemoHybridApi()

    // Step 1: same param bag shape as the list route
    const { searchParams } = new URL(request.url)
    const params = searchParamsToRecord(searchParams)

    // Step 2: compute facet options + counts for current URL filters
    const filtersWithOptions = await getFilterOptionsServer(undefined, params)

    // Step 3: JSON array of FilterConfig
    return NextResponse.json(filtersWithOptions, { status: 200 })
  } catch (error) {
    console.error('[api/demo-hybrid-page/options] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to load filter options' },
      { status: 500 }
    )
  }
}
