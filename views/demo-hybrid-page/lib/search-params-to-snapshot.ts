/**
 * @file views/demo-hybrid-page/lib/search-params-to-snapshot.ts
 * Flat Next searchParams → query string for ShallowUrlProvider seed.
 */

import type { DemoHybridPageSearchParams } from '@/app/(root)/demo-hybrid-page/page'

/** Build query string without leading `?` for shallow transport hydration. */
export function searchParamsToSnapshot(
  params: DemoHybridPageSearchParams
): string {
  const sp = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue
    if (Array.isArray(value)) {
      for (const v of value) {
        sp.append(key, v)
      }
    } else {
      sp.set(key, value)
    }
  }
  return sp.toString()
}
