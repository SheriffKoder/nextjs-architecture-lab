/**
 * Encode / decode multi-select URL param values
 *
 * Purpose: Comma separates list entries; each entry is encodeURIComponent'd so values like
 *          "New York, NY" round-trip as one selection (naive split(',') would split on the comma).
 * Used in: useUrlFilters, dropdown-filter facet fetch params, demo RSC list query + filter helpers
 */

export function encodeUrlParamList(values: string[]): string {
  return values.map((v) => encodeURIComponent(v)).join(',')
}

export function decodeUrlParamList(raw: string | null | undefined): string[] {
  if (raw == null || raw === '') return []
  return raw
    .split(',')
    .map((segment) => {
      const t = segment.trim()
      if (t === '') return ''
      try {
        return decodeURIComponent(t)
      } catch {
        return t
      }
    })
    .filter((s) => s !== '')
}

/**
 * After per-segment decoding, if multiple tokens appeared but the full raw string is exactly
 * one known facet value (e.g. legacy `location=New+York%2C+NY` → decoded param contains a comma),
 * treat it as a single selection.
 */
export function decodeUrlParamListWithKnownMultiSelect(
  raw: string,
  knownValues?: ReadonlySet<string>,
): string[] {
  const decoded = decodeUrlParamList(raw)
  const trimmed = raw.trim()
  if (
    knownValues &&
    decoded.length > 1 &&
    knownValues.has(trimmed)
  ) {
    return [trimmed]
  }
  return decoded
}
