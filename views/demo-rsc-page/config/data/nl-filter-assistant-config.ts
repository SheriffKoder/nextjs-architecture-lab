/**
 * NL filter assistant — demo RSC configuration
 *
 * Purpose: Keys the NL assistant must never write to URL; allowed sort field keys for validation.
 * Used in: `filters-section.tsx` → props for `NlFilterAssistant` + API contract parity (exclusions / sorts).
 */

/** URL param keys preserved when applying NL patches (drawer, detail chrome, etc.). */
export const NL_FILTER_EXCLUDED_URL_KEYS = [
  'drawer',
  'mode',
  'id',
] as const

/** Sort `key` values allowed in `sort` URL param (`key:direction` comma-separated). */
export const NL_FILTER_ALLOWED_SORT_KEYS = [
  'model',
  'make',
  'year',
  'status',
  'location',
  'pricePerDay',
  'mileage',
  'rentalStartDate',
  'rentalEndDate',
] as const

export type NlFilterExcludedUrlKey = (typeof NL_FILTER_EXCLUDED_URL_KEYS)[number]
export type NlFilterAllowedSortKey = (typeof NL_FILTER_ALLOWED_SORT_KEYS)[number]
