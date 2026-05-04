/**
 * Demo RSC Page Loading Component
 *
 * Purpose: Loading skeleton for demo RSC page
 * Used in: app/(root)/demo-rsc-page/page.tsx Suspense fallback
 * Why: Mirrors shell layout — header, filters strip, table, pagination footer
 */

import FiltersSkeleton from '@/components/layout/loading-skeletons/filters-skeleton'
import PaginationSkeleton from '@/components/layout/loading-skeletons/pagination-skeleton'
import TableSkeleton from '@/components/layout/loading-skeletons/table-skeleton'
import PageHeaderSkeleton from '@/components/layout/loading-skeletons/page-header-skeleton'

export default function DemoRscLoading() {
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
      <header className="flex shrink-0 flex-col items-center justify-between gap-4 border-b border-tertiary/10 p-4 md:flex-row">
        <PageHeaderSkeleton showSubtitle={true} />
        <div className="flex w-full flex-row items-start gap-2 lg:w-auto">
          <div className="h-10 w-32 animate-pulse rounded-md bg-muted" />
          <div className="h-10 w-28 animate-pulse rounded-md bg-muted" />
        </div>
      </header>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto pb-0 pt-2">
        <div className="flex h-full min-h-0 w-full flex-col space-y-6 p-2 pr-2 pt-2">
          <FiltersSkeleton controlCount={2} />

          <div className="flex min-h-0 flex-1 flex-col">
            <TableSkeleton columnCount={9} rowCount={10} showHeader={true} />
          </div>

          <PaginationSkeleton />
        </div>
      </div>
    </div>
  )
}
