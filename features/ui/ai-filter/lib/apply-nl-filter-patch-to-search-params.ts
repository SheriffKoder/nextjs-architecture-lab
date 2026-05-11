/**
 * Apply sanitized NL filter patches onto URLSearchParams (merge baseline)
 *
 * Purpose: Single `router.replace` target; preserves keys not touched (drawer, mode, id, etc.).
 * Used in: `NlFilterAssistant` after successful API response
 */

import type {
  NlFilterCatalogEntry,
  NlFilterSortSpec,
} from '@/features/ui/ai-filter/types/nl-filter-assistant'
import { encodeUrlParamList } from '@/features/ui/filters/feature-filtering/utils/url-param-list-codec'

/**
 * Encodes `sort` param as comma-separated `key:direction` (same as `useUrlSorting` / RSC list query).
 */
export function buildSortQueryString(sorts: NlFilterSortSpec[]): string {
  return sorts.map((s) => `${s.key}:${s.direction}`).join(',')
}

export type ApplyNlFilterPatchResult = {
  /** Full next query string (no leading `?`) */
  queryString: string
}

/**
 * Merges sanitized patches into a copy of current search params.
 *
 * @param current - Typically `new URLSearchParams(searchParams.toString())`
 * @param catalog - Same catalog used for sanitization (defines encoding per `type`)
 * @param filterPatches - Sanitized `filterPatches` record
 * @param sorts - Sanitized sorts; `undefined` = leave sort unchanged; `[]` = delete `sort` (and legacy `order`)
 */
export function applyNlFilterPatchToSearchParams(options: {
  current: URLSearchParams
  catalog: NlFilterCatalogEntry[]
  filterPatches: Record<string, unknown>
  sorts?: NlFilterSortSpec[]
}): ApplyNlFilterPatchResult {
  const { current, catalog, filterPatches, sorts } = options
  const next = new URLSearchParams(current.toString())
  const catalogByKey = new Map(catalog.map((c) => [c.key, c]))

  for (const [key, raw] of Object.entries(filterPatches)) {
    const entry = catalogByKey.get(key)
    if (!entry) continue

    if (entry.type === 'multi-select' || entry.type === 'single-select') {
      const arr = raw as string[]
      if (!Array.isArray(arr)) continue
      if (arr.length === 0) {
        next.delete(key)
      } else {
        next.set(key, encodeUrlParamList(arr))
      }
      continue
    }

    if (entry.type === 'number-range') {
      if (raw === null) {
        next.delete(key)
        continue
      }
      const r = raw as { min?: number; max?: number }
      const min = r.min !== undefined ? String(r.min) : ''
      const max = r.max !== undefined ? String(r.max) : ''
      if (!min && !max) {
        next.delete(key)
      } else {
        next.set(key, `${min}_${max}`)
      }
      continue
    }

    if (entry.type === 'date-range') {
      if (raw === null) {
        next.delete(key)
        continue
      }
      const r = raw as { start?: string; end?: string }
      const start = r.start ?? ''
      const end = r.end ?? ''
      if (!start && !end) {
        next.delete(key)
      } else {
        next.set(key, `${start}_${end}`)
      }
      continue
    }
  }

  if (sorts !== undefined) {
    // Align with RSC `parseSorts` / `useUrlSorting` — single `sort` param
    next.delete('order')
    if (sorts.length === 0) {
      next.delete('sort')
    } else {
      next.set('sort', buildSortQueryString(sorts))
    }
  }

  return { queryString: next.toString() }
}
