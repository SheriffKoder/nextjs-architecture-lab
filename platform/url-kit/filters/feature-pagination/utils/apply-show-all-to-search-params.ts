/**
 * Show-all URL mutations — shared by pagination footer and view switcher.
 *
 * Paginated: ?page=1&limit=20
 * Show all:  ?all=1 (no page / limit)
 */

import { isShowAllUrlParam, SHOW_ALL_URL_PARAM } from './reset-page-in-params'

export function viewRequiresAllItems(
  view: string,
  useAllItems?: readonly string[],
): boolean {
  return useAllItems?.includes(view) ?? false
}

/** Enter show-all mode on mutable URLSearchParams. */
export function applyShowAllToSearchParams(
  params: URLSearchParams,
  allParamKey = SHOW_ALL_URL_PARAM,
  pageParamKey = 'page',
  limitParamKey = 'limit',
): void {
  params.delete(pageParamKey)
  params.delete(limitParamKey)
  params.set(allParamKey, '1')
}

/** Leave show-all and restore default paginated params. */
export function restorePaginatedSearchParams(
  params: URLSearchParams,
  defaultLimit = 10,
  pageParamKey = 'page',
  limitParamKey = 'limit',
  allParamKey = SHOW_ALL_URL_PARAM,
): void {
  params.delete(allParamKey)
  params.set(limitParamKey, String(Math.max(1, defaultLimit)))
  params.set(pageParamKey, '1')
}

/**
 * Apply or clear show-all when switching views.
 * Mutates `params` in place; caller performs a single router navigation.
 */
export function syncShowAllForViewChange(
  params: URLSearchParams,
  previousView: string,
  nextView: string,
  options?: {
    useAllItems?: readonly string[]
    defaultPageSize?: number
  },
): void {
  const useAllItems = options?.useAllItems
  const defaultPageSize = options?.defaultPageSize ?? 10
  const enteringAll = viewRequiresAllItems(nextView, useAllItems)
  const leavingAll =
    viewRequiresAllItems(previousView, useAllItems) && !enteringAll

  if (enteringAll) {
    applyShowAllToSearchParams(params)
  } else if (leavingAll) {
    restorePaginatedSearchParams(params, defaultPageSize)
  }
}

/**
 * Hide footer pagination when show-all was applied for a view that owns the full dataset
 * (e.g. kanban/calendar with `useAllItems`). Table + manual "All" still shows controls.
 */
export function shouldHidePaginationForUseAllView(
  searchParams: URLSearchParams | { get: (key: string) => string | null },
  options?: {
    useAllItems?: readonly string[]
    defaultView?: string
    viewParamKey?: string
  },
): boolean {
  const { useAllItems, defaultView = 'table', viewParamKey = 'view' } =
    options ?? {}
  if (!useAllItems?.length || !isShowAllUrlParam(searchParams)) {
    return false
  }
  const view = searchParams.get(viewParamKey) ?? defaultView
  return viewRequiresAllItems(view, useAllItems)
}
