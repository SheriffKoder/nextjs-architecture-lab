/**
 * Reset pagination to page 1 in a URLSearchParams batch before filter/sort/search updates.
 *
 * Used in: `useUrlFilters`, `useUrlSorting` (and sorting-builder-control copy)
 * Why: Changing filters or sort changes the result set; staying on page N often shows an empty table.
 *
 * Deletes the page param so `parsePagination` applies its default (page 1). Matches NL filter apply
 * (`resetNlApplyPaginationPage` in `features/ui/ai-filter`).
 */

/**
 * @param params - Mutable URLSearchParams about to be written to the router
 * @param pageParamKey - URL key for page index (default `page`)
 */
export function resetPageInSearchParams(
  params: URLSearchParams,
  pageParamKey = 'page',
): void {
  params.delete(pageParamKey)
}
