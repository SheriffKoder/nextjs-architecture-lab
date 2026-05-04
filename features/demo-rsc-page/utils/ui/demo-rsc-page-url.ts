/**
 * Demo RSC Page — route helpers
 *
 * Purpose: Canonical pathname (and optional shared searchParams typing) for the demo RSC route
 * Used in: Future redirects / links under `features/demo-rsc-page` when needed
 * Used for: Single source for `/demo-rsc-page` string (avoid scattered literals)
 */

/** Canonical pathname for this demo route */
export const DEMO_RSC_PAGE_PATH = '/demo-rsc-page'

/** Shape of `searchParams` passed to the demo RSC page */
export type DemoRscPageSearchParams = Record<string, string | string[] | undefined>
