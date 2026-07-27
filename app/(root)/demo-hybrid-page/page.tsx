/**
 * @file app/(root)/demo-hybrid-page/page.tsx
 * Hybrid demo route — RSC shell that prefetches TanStack cache then hydrates the client view.
 *
 * Purpose: Thin routing entry — normalize URL, prefetch list + facets, pass dehydrated state to view
 * Used in: `/demo-hybrid-page` App Router segment
 * Used for: Cold-load data without client waterfall; keeps business logic in entity + view layers
 *
 * Function Index:
 * - DemoHybridPageRoute — default async page component
 * - normalizeParams — shallow copy of resolved search params
 *
 * Steps (DemoHybridPageRoute):
 * 1. Await and normalize `searchParams` once (Next 15 Promise shape).
 * 2. Build typed `RentalCarListQuery` via shared entity parser (same as client shallow hook).
 * 3. Create ephemeral server `QueryClient` and prefetch list + options.
 * 4. Pass dehydrated state + initial query into the client view barrel.
 */

import { QueryClient } from '@tanstack/react-query'
import { DemoHybridPage } from '@/views/demo-hybrid-page'
import { parseListQueryFromSearchParams } from '@/entities/demo-hybrid-cars/transform/parse-list-query-from-search-params'
import { prefetchRentalCarPage } from '@/entities/demo-hybrid-cars/hydration/prefetch-rental-car-page'

/** Resolved query string shape after `await searchParams`. */
export type DemoHybridPageSearchParams = Record<
  string,
  string | string[] | undefined
>

/** Prevent downstream mutation of the request-bound params object. */
function normalizeParams(
  raw: DemoHybridPageSearchParams
): DemoHybridPageSearchParams {
  return { ...raw }
}

export default async function DemoHybridPageRoute({
  searchParams,
}: {
  searchParams: Promise<DemoHybridPageSearchParams>
}) {
  // Step 1: resolve URL state once at the route boundary
  const raw = await searchParams
  const params = normalizeParams(raw)
  // Step 2: typed list query shared by prefetch + client shallow hook
  const query = parseListQueryFromSearchParams(params)

  // Step 3: server-side TanStack prefetch (separate QueryClient from browser)
  const queryClient = new QueryClient()
  const dehydratedState = await prefetchRentalCarPage(queryClient, query)

  // Step 4: pass dehydrated state — `QueryProvider` wraps `HydrationBoundary` in the view
  return (
    <DemoHybridPage initialQuery={query} dehydratedState={dehydratedState} />
  )
}
