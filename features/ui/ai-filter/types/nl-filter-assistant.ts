/**
 * NL filter assistant — shared types
 *
 * Purpose: Serializable catalog + API response shapes for natural-language → URL filter patches.
 * Used in: `serialize-filter-catalog-for-nl.ts`, API route, `NlFilterAssistant`
 */

import type { FilterType } from '@/features/ui/filters/feature-filtering/components/filter-types'

/** Catalog entry sent to the model (options trimmed to value + label only). */
export type NlFilterCatalogEntry = {
  key: string
  label: string
  type: FilterType
  options?: { value: string; label: string }[]
}

export type NlFilterSortSpec = {
  key: string
  direction: 'asc' | 'desc'
}

/**
 * Pass from the host page (never import page-specific config inside `features/ui/ai-filter`).
 */
export type NlFilterAssistantRuntimeConfig = {
  /** URL param keys the assistant must not write (drawer, detail ids, etc.). */
  excludedUrlKeys: readonly string[]
  /** Sort field keys allowed in the `sort` URL param (`key:direction`). */
  allowedSortKeys: readonly string[]
  /** Optional domain line for the system prompt (e.g. "rental car inventory"). */
  domainDescription?: string
  /**
   * Removed from the URL when filters are fully cleared (clear-all phrase or model clears every catalog facet).
   * Typical: `q` (omit `page` here — it is reset on every apply via `paginationPageParamKey`).
   */
  keysToClearOnFullReset?: readonly string[]
  /** URL param for page index; deleted after every successful apply so the list uses page 1. Default `page`. */
  paginationPageParamKey?: string
}
