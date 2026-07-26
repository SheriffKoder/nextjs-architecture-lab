/**
 * Demo RSC Page Loading Component
 *
 * Purpose: Loading skeleton for demo RSC page
 * Used in: app/(root)/demo-rsc-page/page.tsx Suspense fallback
 * Why: Mirrors shell layout — header, filters strip, table, pagination footer
 */

import FiltersSkeleton from '@/shared/ui/loading-skeletons/filters/filters-skeleton'
import PaginationSkeleton from '@/shared/ui/loading-skeletons/pagination/pagination-skeleton'
import TableSkeleton from '@/shared/ui/loading-skeletons/table/table-skeleton'
import PageHeaderSkeleton from '@/shared/ui/loading-skeletons/page-header-skeleton'

export default function DemoRscLoading() {
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-tertiary/10 p-4">
        <PageHeaderSkeleton showSubtitle={true} />
        <div className="flex shrink-0 items-center gap-1 md:gap-2">
          <div className="size-10 animate-pulse rounded-md bg-muted md:h-10 md:w-28" />
          <div className="size-10 animate-pulse rounded-md bg-muted md:hidden" />
        </div>
      </header>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto pb-0 pt-2">
        <div className="flex h-full min-h-0 w-full flex-col space-y-6 p-2 pr-2 pt-2">
          <FiltersSkeleton buttonCount={2} />

          <div className="flex min-h-0 flex-1 flex-col">
            <TableSkeleton columnCount={9} rowCount={10} showHeader={true} />
          </div>

          <PaginationSkeleton />
        </div>
      </div>
    </div>
  )
}
