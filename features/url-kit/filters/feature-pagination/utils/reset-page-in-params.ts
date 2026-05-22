/**
 * Pagination URL normalization before filter/sort/search updates.
 *
 * Used in: `useUrlFilters`, `useUrlSorting`, NL filter apply
 * - `all=1` (show all): strip `page` and `limit`; keep `all`
 * - paginated: strip `page` (defaults to 1 via `parsePagination`); strip `all`
 */

export const SHOW_ALL_URL_PARAM = 'all'

export function isShowAllUrlParam(
  searchParams: URLSearchParams | { get: (key: string) => string | null },
  allParamKey = SHOW_ALL_URL_PARAM,
): boolean {
  return searchParams.get(allParamKey) === '1'
}

/**
 * @param params - Mutable URLSearchParams about to be written to the router
 * @param pageParamKey - URL key for page index (default `page`)
 * @param allParamKey - URL key for show-all mode (default `all`)
 * @param limitParamKey - URL key for page size (default `limit`)
 */
export function normalizePaginationParams(
  params: URLSearchParams,
  pageParamKey = 'page',
  allParamKey = SHOW_ALL_URL_PARAM,
  limitParamKey = 'limit',
): void {
  if (params.get(allParamKey) === '1') {
    params.delete(pageParamKey)
    params.delete(limitParamKey)
    return
  }
  params.delete(allParamKey)
  params.delete(pageParamKey)
}

/**
 * @param params - Mutable URLSearchParams about to be written to the router
 * @param pageParamKey - URL key for page index (default `page`)
 */
export function resetPageInSearchParams(
  params: URLSearchParams,
  pageParamKey = 'page',
): void {
  normalizePaginationParams(params, pageParamKey)
}
