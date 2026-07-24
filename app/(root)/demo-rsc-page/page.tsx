/**
 * Demo RSC Page
 *
 * Purpose: React Server Component page that demonstrates fetching mock rental car data
 * Used in: app/(root)/demo-rsc-page route
 * Why: Await `searchParams` once here, normalize to a plain object, then pass into the feature (no `Promise` in children)
 */

import DemoRscIndex from '@/views/demo-rsc-page/demo-rsc-index'

/**
 * Canonical shape for this route’s query string after `await searchParams` (Next App Router).
 * Keep in sync with what `DemoRscIndex` / server helpers expect for URL-driven state.
 */
export type DemoRscPageSearchParams = Record<string, string | string[] | undefined>

/**
 * Shallow copy of resolved search params so downstream components do not mutate the object
 * tied to the request.
 */
function normalizeParams(raw: DemoRscPageSearchParams): DemoRscPageSearchParams {
  return { ...raw }
}

export default async function DemoRscPage({
  searchParams,
}: {
  searchParams: Promise<DemoRscPageSearchParams>
}) {
  const raw = await searchParams
  const params = normalizeParams(raw)

  return <DemoRscIndex params={params} />
}
