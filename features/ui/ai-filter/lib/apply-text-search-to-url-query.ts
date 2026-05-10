/**
 * Build query string after applying a plain text search param (same semantics as
 * `useUrlFilters` → `setSearch`: trim, omit empty `q`, preserve other params).
 * Also drops the page param so results start at page 1, matching NL apply behavior.
 */

export type ApplyTextSearchToUrlQueryOptions = {
  /** URL key for full-text search. Default `q` (see `useUrlFilters` / ExpandableSearchControl). */
  searchParamKey?: string
  /** Removed so list uses first page. Default `page`. */
  paginationPageParamKey?: string
}

export function applyTextSearchToUrlQuery(
  current: URLSearchParams,
  rawText: string,
  options?: ApplyTextSearchToUrlQueryOptions,
): string {
  const searchParamKey = options?.searchParamKey ?? 'q'
  const pageParamKey = options?.paginationPageParamKey ?? 'page'
  const sp = new URLSearchParams(current.toString())
  const trimmed = rawText.trim()
  if (trimmed) {
    sp.set(searchParamKey, trimmed)
  } else {
    sp.delete(searchParamKey)
  }
  sp.delete(pageParamKey)
  return sp.toString()
}

/** Remove text search param and page (same keys as {@link applyTextSearchToUrlQuery}). */
export function clearTextSearchFromUrlQuery(
  current: URLSearchParams,
  options?: ApplyTextSearchToUrlQueryOptions,
): string {
  const searchParamKey = options?.searchParamKey ?? 'q'
  const pageParamKey = options?.paginationPageParamKey ?? 'page'
  const sp = new URLSearchParams(current.toString())
  sp.delete(searchParamKey)
  sp.delete(pageParamKey)
  return sp.toString()
}
