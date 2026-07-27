/**
 * @file views/demo-hybrid-page/ui/layout-sections/pagination-footer.tsx
 * Pagination footer wired to shallow list setters (not `useUrlPagination`).
 *
 * Purpose: Page / limit / show-all controls without App Router navigation
 * Used in: `demo-hybrid-page.tsx`
 * Used for: Offset pagination UX while URL stays shareable via `replaceState`
 *
 * Function Index:
 * - DemoHybridPaginationFooter — presentational pagination + shallow setters
 *
 * Steps:
 * 1. Derive page/limit/showAll from `listQuery`.
 * 2. Calculate range metadata with platform `calculatePagination`.
 * 3. Render `PaginationInfo` + page-size buttons + `PaginationButtons`.
 * 4. Forward clicks to `setPage` / `setLimit` / `setShowAll` from the shallow hook.
 */

'use client'

import { calculatePagination } from '@/platform/url-kit/filters/feature-pagination/utils'
import {
  PaginationButtons,
  PaginationInfo,
} from '@/platform/url-kit/filters/feature-pagination/components'
import { PaginationPageSizeButtons } from '@/platform/url-kit/filters/feature-pagination/components/pagination-page-size-buttons'
import type { RentalCarListQuery } from '@/entities/demo-hybrid-cars/model/rental-car-list-query'
import type { UseShallowListParamsResult } from '@/views/demo-hybrid-page/hooks/use-shallow-list-params'
import { rentalCarPaginationConfig } from '@/views/demo-hybrid-page/config/data/rental-car-pagination-config'

type DemoHybridPaginationFooterProps = {
  totalItems: number
  listQuery: RentalCarListQuery
  setPage: UseShallowListParamsResult['setPage']
  setLimit: UseShallowListParamsResult['setLimit']
  setShowAll: UseShallowListParamsResult['setShowAll']
}

/**
 * Hybrid pagination — same chrome as platform footer, shallow URL write path.
 */
export function DemoHybridPaginationFooter({
  totalItems,
  listQuery,
  setPage,
  setLimit,
  setShowAll,
}: DemoHybridPaginationFooterProps) {
  // Step 1: read pagination slice from shallow list state
  const isShowAll = listQuery.showAll === true
  const page = listQuery.page ?? 1
  const limit =
    listQuery.limit ?? rentalCarPaginationConfig.defaultPageSize ?? 10

  // Step 2: derived UI metadata
  const paginationInfo = calculatePagination(
    page,
    isShowAll ? Math.max(totalItems, 1) : limit,
    totalItems
  )

  const pageSizeOptions = rentalCarPaginationConfig.pageSizeOptions ?? []
  const showPageSizeSelector =
    (pageSizeOptions.length > 0 ||
      rentalCarPaginationConfig.allowShowAll === true) &&
    rentalCarPaginationConfig.allowPageSizeChange !== false

  // Step 3–4: presentational components + shallow setters
  return (
    <div className="shrink-0 mr-2">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="my-2 flex min-w-0 flex-wrap items-center gap-3">
          <PaginationInfo
            startItem={isShowAll ? (totalItems === 0 ? 0 : 1) : paginationInfo.startItem}
            endItem={isShowAll ? totalItems : paginationInfo.endItem}
            totalItems={totalItems}
            showAll={isShowAll}
          />
          {showPageSizeSelector ? (
            <PaginationPageSizeButtons
              options={pageSizeOptions}
              limit={limit}
              onLimitChange={setLimit}
              allowShowAll={rentalCarPaginationConfig.allowShowAll}
              isShowAll={isShowAll}
              onShowAll={
                rentalCarPaginationConfig.allowShowAll
                  ? () => setShowAll(true)
                  : undefined
              }
              showAllLabel={rentalCarPaginationConfig.showAllLabel}
            />
          ) : null}
        </div>
        {!isShowAll ? (
          <PaginationButtons
            currentPage={page}
            totalPages={paginationInfo.totalPages}
            onPageChange={setPage}
          />
        ) : null}
      </div>
    </div>
  )
}
