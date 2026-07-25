/**
 * Demo RSC — derive stable cache keys from list/filter URL state only (exclude UI chrome).
 *
 * Purpose: `extractDemoRscListDataParams` + `demoRscDataParamsToCacheKey` for `getFilters` / `getCars`.
 * Used in: `filters-section.tsx`, `table-and-pagination-section.tsx` → pass key into `demo-rsc-cached-loaders`.
 * Why: Drawer open/close must not fork `unstable_cache` entries for the same table + facet state.
 */

import type { DemoRscPageSearchParams } from '@/app/(root)/demo-rsc-page/page'
import { DEMO_RSC_LIST_DATA_SEARCH_PARAM_KEYS } from '../config/contract/url-param-keys'

/** Subset of `params` that drives list + filter facet loaders (see `DEMO_RSC_LIST_DATA_SEARCH_PARAM_KEYS`). */
export function extractDemoRscListDataParams(
  params: DemoRscPageSearchParams
): DemoRscPageSearchParams {
  const out: DemoRscPageSearchParams = {}
  for (const key of DEMO_RSC_LIST_DATA_SEARCH_PARAM_KEYS) {
    if (params[key] !== undefined) {
      out[key] = params[key]
    }
  }
  return out
}

/** Stable string for `unstable_cache` — data keys only, sorted for deterministic JSON. */
export function demoRscDataParamsToCacheKey(
  params: DemoRscPageSearchParams
): string {
  const data = extractDemoRscListDataParams(params)
  const sorted: DemoRscPageSearchParams = {}
  for (const k of Object.keys(data).sort()) {
    sorted[k] = data[k]
  }
  return JSON.stringify(sorted)
}
