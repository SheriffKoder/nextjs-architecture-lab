/**
 * @file app/(root)/demo-hybrid-page/loading.tsx
 * Route-level loading UI for the hybrid demo page.
 *
 * Purpose: Skeleton shown while the RSC page segment prefetches and streams
 * Used in: App Router automatic loading boundary for `/demo-hybrid-page`
 * Used for: Perceived performance during server prefetch / slow network
 *
 * Steps (render):
 * 1. Page header skeleton.
 * 2. Filters strip skeleton.
 * 3. Table body skeleton.
 * 4. Pagination footer skeleton.
 */

import FiltersSkeleton from '@/shared/ui/loading-skeletons/filters/filters-skeleton'
import PaginationSkeleton from '@/shared/ui/loading-skeletons/pagination/pagination-skeleton'
import TableSkeleton from '@/shared/ui/loading-skeletons/table/table-skeleton'
import PageHeaderSkeleton from '@/shared/ui/loading-skeletons/page-header-skeleton'

export default function DemoHybridPageLoading() {
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
      {/* Step 1: chrome header placeholder */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-tertiary/10 p-4">
        <PageHeaderSkeleton showSubtitle={true} />
      </header>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto pb-0 pt-2">
        <div className="flex h-full min-h-0 w-full flex-col space-y-6 p-2 pr-2 pt-2">
          {/* Step 2: filter toolbar placeholder */}
          <FiltersSkeleton buttonCount={2} />
          <div className="flex min-h-0 flex-1 flex-col">
            {/* Step 3: main table placeholder */}
            <TableSkeleton columnCount={9} rowCount={10} showHeader={true} />
          </div>
          {/* Step 4: pagination placeholder */}
          <PaginationSkeleton />
        </div>
      </div>
    </div>
  )
}
