/**
 * @file entities/demo-hybrid-cars/queries/use-infinite-rental-cars.ts
 * TanStack infinite read hook for scroll / load-more views.
 *
 * Purpose: `useInfiniteQuery` over the same offset `GET /api/demo-hybrid-page/cars`
 * Used in: `views/demo-hybrid-page/ui/demo-hybrid-page-client.tsx` when `all=1` on table/list/cards
 * Used for: Progressive append instead of a single showAll dump on paginated views
 *
 * Function Index:
 * - toInfiniteListQuery — strip `page` / `showAll`; pin `limit` for page slices
 * - useInfiniteRentalCars — infinite pages + seed each page into `list` cache
 *
 * Steps (hook wiring):
 * 1. Key = `rentalCarKeys.infinite({ …filters, limit })` (no `page` / `showAll`).
 * 2. Bootstrap from `list({ page: 1, limit })` when present (entering All — no skeleton flash).
 * 3. `queryFn` fetches `page=pageParam` + same `limit` via `fetchRentalCars`.
 * 4. Seed matching `list({ …filters, page, limit })` — same shape as paginated URL parse.
 * 5. `getNextPageParam` from `page * limit < totalItems`.
 */

'use client'

import {
  keepPreviousData,
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query'
import { rentalCarKeys } from '@/entities/demo-hybrid-cars/cache/rental-car-keys'
import { readRentalCarListPage } from '@/entities/demo-hybrid-cars/cache/read-rental-car-list-page'
import { seedRentalCarListPageFromInfinite } from '@/entities/demo-hybrid-cars/cache/seed-rental-car-list-page-from-infinite'
import {
  fetchRentalCars,
  type RentalCarsPageResponse,
} from '@/entities/demo-hybrid-cars/client/fetch-rental-cars'
import type { RentalCarListQuery } from '@/entities/demo-hybrid-cars/model/rental-car-list-query'
import { rentalCarPaginationConfig } from '@/views/demo-hybrid-page/config/data/rental-car-pagination-config'

const DEFAULT_INFINITE_PAGE_SIZE =
  rentalCarPaginationConfig.defaultPageSize ?? 10

/** List query shape for infinite keys — page/showAll stripped; limit pinned. */
export function toInfiniteListQuery(
  query?: RentalCarListQuery,
): RentalCarListQuery | undefined {
  if (!query) return undefined
  const { page: _page, showAll: _showAll, ...rest } = query
  return {
    ...rest,
    // `all=1` URL parse omits limit — pin default so seed keys match paginated reads
    limit: rest.limit ?? DEFAULT_INFINITE_PAGE_SIZE,
  }
}

export type UseInfiniteRentalCarsOptions = {
  /** When false, the infinite query does not run (paginated / showAll views). */
  enabled?: boolean
}

/**
 * Subscribe to an append-only rental car list for the given URL-shaped filters.
 *
 * @param query - List/filter state; `page` / `showAll` are ignored for the key
 * @param options.enabled - Gate the query when the current view is not infinite
 */
export function useInfiniteRentalCars(
  query?: RentalCarListQuery,
  options?: UseInfiniteRentalCarsOptions,
) {
  const queryClient = useQueryClient()
  const infiniteQuery = toInfiniteListQuery(query)
  const enabled = options?.enabled ?? true
  const pageSize = infiniteQuery?.limit ?? DEFAULT_INFINITE_PAGE_SIZE

  const page1ListQuery: RentalCarListQuery = {
    ...infiniteQuery,
    page: 1,
    limit: pageSize,
  }

  return useInfiniteQuery({
    queryKey: rentalCarKeys.infinite(infiniteQuery),
    queryFn: async ({ pageParam }) => {
      // Same key shape as `buildRentalCarListQuery` when not in All mode
      const listQuery: RentalCarListQuery = {
        ...infiniteQuery,
        page: pageParam,
        limit: pageSize,
      }
      const pageResponse = await fetchRentalCars(listQuery)
      // Write-through so table pagination can reuse scrolled pages
      seedRentalCarListPageFromInfinite(queryClient, listQuery, pageResponse)
      return pageResponse
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, limit, totalItems } = lastPage.pagination
      return page * limit < totalItems ? page + 1 : undefined
    },
    // Entering All: reuse list page 1 if already cached (avoids table skeleton flash)
    initialData: ():
      | InfiniteData<RentalCarsPageResponse, number>
      | undefined => {
      const cached = readRentalCarListPage(queryClient, page1ListQuery)
      if (!cached) return undefined
      return {
        pages: [cached.data],
        pageParams: [1],
      }
    },
    initialDataUpdatedAt: () =>
      readRentalCarListPage(queryClient, page1ListQuery)?.dataUpdatedAt,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    enabled,
  })
}
