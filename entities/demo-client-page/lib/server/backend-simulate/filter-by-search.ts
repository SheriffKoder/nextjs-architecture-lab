/**
 * Filter By Search (substring, case-insensitive)
 *
 * Name: filter-by-search
 * Purpose: Narrow an in-memory row array when the URL carries a free-text `q` parameter
 * Used in: filter-rental-cars.ts (this feature’s URL filter simulation)
 * Used for: Shared OR-semantics across configured string fields (model, make, etc.)
 *
 * Function Index:
 * - filterBySearch: Return rows where any `searchableFields` value contains the query
 *
 * Steps (algorithm):
 * 1. If query is empty, return the input unchanged (no-op search).
 * 2. Normalize query once for case-insensitive comparison.
 * 3. Keep rows where at least one field’s string form includes the normalized query.
 */

/**
 * Filter rows by a plain-text query across a fixed list of fields (OR logic).
 *
 * @param data - Rows to search (not mutated)
 * @param query - Raw search string from URL (typically `q`)
 * @param searchableFields - Keys on `T` to scan
 * @returns New array of matching rows
 */
export function filterBySearch<T extends Record<string, any>>(
  data: T[],
  query: string,
  searchableFields: (keyof T)[]
): T[] {
  // Step 1: Treat blank search as “no filter” so callers do not need a separate branch
  if (!query || query.trim().length === 0) {
    return data
  }

  // Step 2: Lowercase once — avoids repeated toLowerCase inside the inner loop
  const normalizedQuery = query.trim().toLowerCase()

  // Step 3: OR across fields — first match wins the row
  return data.filter((item) =>
    searchableFields.some((field) => {
      const fieldValue = item[field]
      if (fieldValue === null || fieldValue === undefined) {
        return false
      }
      const stringValue = String(fieldValue).toLowerCase()
      return stringValue.includes(normalizedQuery)
    })
  )
}
