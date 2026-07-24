/**
 * Demo RSC — which URL search param keys affect list + filter facets vs UI-only chrome.
 *
 * Purpose: Single source of truth for `extractDemoRscListDataParams` / `demoRscDataParamsToCacheKey`.
 * Why: Drawer / mode / id etc. must not change `unstable_cache` identity for `getFilters` / `getCars`.
 *
 * Keep list keys aligned with `lib/build-rental-car-list-query.ts` + `filter-rental-cars.ts` inputs.
 */

/** Keys that affect paginated list + facet counts (included in data cache key). */
export const DEMO_RSC_LIST_DATA_SEARCH_PARAM_KEYS = [
  'all',
  'page',
  'limit',
  'sort',
  'status',
  'make',
  'location',
  'model',
  'licensePlate',
  'year',
  'pricePerDay',
  'mileage',
  'rentalStartDate',
  'date',
  'q',
] as const

export type DemoRscListDataSearchParamKey =
  (typeof DEMO_RSC_LIST_DATA_SEARCH_PARAM_KEYS)[number]

/**
 * Keys that affect layout / drawers / view chrome only — excluded from list data cache key.
 * (Overlap with `nl-filter-assistant-config` drawer keys is intentional; `view` is table vs kanban, etc.)
 */
export const DEMO_RSC_UI_ONLY_SEARCH_PARAM_KEYS = [
  'drawer',
  'mode',
  'id',
  'action',
  'view',
] as const

export type DemoRscUiOnlySearchParamKey =
  (typeof DEMO_RSC_UI_ONLY_SEARCH_PARAM_KEYS)[number]
