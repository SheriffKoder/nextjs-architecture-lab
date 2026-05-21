/**
 * Clear-all intent + full-reset URL helpers for NL filter assistant
 */

import type { NlFilterCatalogEntry } from '@/features/url-kit/ai-filter/types/nl-filter-assistant'

/** Phrases that should clear every catalog facet (and sorts handled separately). */
export function isClearAllFiltersIntent(text: string): boolean {
  const t = text.trim().toLowerCase()
  if (!t) return false
  return (
    /\bclear\s+all(\s+filters?)?\b/.test(t) ||
    /\bclear\s+filters?\b/.test(t) ||
    /\breset\s+filters?\b/.test(t) ||
    /\breset\s+all(\s+filters?)?\b/.test(t) ||
    /\bremove\s+all\s+filters?\b/.test(t) ||
    /\bremove\s+filters?\b/.test(t) ||
    /\bno\s+filters?\b/.test(t) ||
    /\bdrop\s+all\s+filters?\b/.test(t)
  )
}

export function buildClearAllFilterPatches(
  catalog: NlFilterCatalogEntry[],
): Record<string, unknown> {
  const patches: Record<string, unknown> = {}
  for (const c of catalog) {
    if (c.type === 'multi-select' || c.type === 'single-select') {
      patches[c.key] = []
    } else if (c.type === 'number-range' || c.type === 'date-range') {
      patches[c.key] = null
    }
  }
  return patches
}

/** True when every catalog facet is explicitly cleared in patches. */
export function isFullCatalogClear(
  patches: Record<string, unknown>,
  catalog: NlFilterCatalogEntry[],
): boolean {
  if (catalog.length === 0) return false
  for (const c of catalog) {
    const v = patches[c.key]
    if (c.type === 'multi-select' || c.type === 'single-select') {
      if (!Array.isArray(v) || v.length !== 0) return false
    } else if (c.type === 'number-range' || c.type === 'date-range') {
      if (v !== null) return false
    }
  }
  return true
}

export function stripNlResetKeys(
  queryString: string,
  keys: readonly string[] | undefined,
): string {
  if (!keys?.length) return queryString
  const sp = new URLSearchParams(queryString)
  for (const k of keys) sp.delete(k)
  return sp.toString()
}

/**
 * After any NL-driven filter apply: drop page param so pagination defaults to page 1 (`parsePagination` convention).
 */
export function resetNlApplyPaginationPage(
  queryString: string,
  pageParamKey = 'page',
): string {
  const sp = new URLSearchParams(queryString)
  sp.delete(pageParamKey)
  return sp.toString()
}
