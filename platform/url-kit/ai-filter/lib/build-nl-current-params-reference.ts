/**
 * Build human-readable summary of current URL params for NL prompts
 *
 * Purpose: Gives the model explicit baseline filter/sort state for merge-style edits.
 * Used in: `NlFilterAssistant` request body, optional API logging
 */

import type { NlFilterCatalogEntry } from '@/platform/url-kit/ai-filter/types/nl-filter-assistant'

type FlatParams = Record<string, string | undefined>

function flattenSearchParams(sp: URLSearchParams): FlatParams {
  const out: FlatParams = {}
  sp.forEach((value, key) => {
    out[key] = value
  })
  return out
}

/**
 * Produces a short multi-line summary: generic param list + labeled lines for known catalog keys.
 */
export function buildNlCurrentParamsReference(
  catalog: NlFilterCatalogEntry[],
  searchParams: URLSearchParams,
): string {
  const flat = flattenSearchParams(searchParams)
  const catalogKeys = new Set(catalog.map((c) => c.key))

  const lines: string[] = ['Current URL query parameters (merge baseline):']

  const generic = Object.entries(flat)
    .filter(([k]) => !catalogKeys.has(k) && k !== 'sort')
    .sort(([a], [b]) => a.localeCompare(b))
  if (generic.length) {
    lines.push('Other keys:', ...generic.map(([k, v]) => `  ${k}=${v}`))
  }

  const sort = flat.sort
  if (sort) {
    lines.push(`sort (comma-separated key:direction): ${sort}`)
  }

  for (const c of catalog) {
    const v = flat[c.key]
    if (v !== undefined && v !== '') {
      lines.push(`${c.label} (${c.key}, ${c.type}): ${v}`)
    }
  }

  if (lines.length === 1) {
    lines.push('(none beyond defaults)')
  }

  return lines.join('\n')
}
