/**
 * Demo RSC Index Component
 *
 * Purpose: Page shell — `params` normalized in route `page.tsx`; build `query` once; three Suspense regions (filters / table / pagination)
 * Used in: `app/(root)/demo-rsc-page/page.tsx`
 * Why: Table + pagination share `getRentalCarsPageData(query)` via `cache()`; list contract matches TanStack `RentalCarListQuery`
 */

import { Suspense } from 'react'
import FiltersSkeleton from '@/components/layout/loading-skeletons/filters-skeleton'
import PaginationSkeleton from '@/components/layout/loading-skeletons/pagination-skeleton'
import TableSkeleton from '@/components/layout/loading-skeletons/table-skeleton'
import PageHeader from '@/components/layout/page-header'
import ActionButtons from './components/action-buttons'
import FiltersSection from './components/filters-section'
import TableSection from './components/table-section'
import PaginationSection from './components/pagination-section'
import { exportForMailchimpAction } from './actions'
import type { DemoRscPageSearchParams } from '@/app/(root)/demo-rsc-page/page'
import { buildRentalCarListQuery } from './lib/build-rental-car-list-query'

function TableLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col p-2">
      <TableSkeleton columnCount={9} rowCount={10} showHeader={true} />
    </div>
  )
}

export default function DemoRscIndex({ params }: { params: DemoRscPageSearchParams }) {
  const query = buildRentalCarListQuery(params)

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      <header className="flex shrink-0 flex-col items-center justify-between gap-4 border-b border-tertiary/10 p-4 md:flex-row">
        <PageHeader subTitle="Demo RSC page with server-side data fetching, filtering, and pagination" />
        <ActionButtons exportForMailchimp={exportForMailchimpAction} />
      </header>

      <div className="flex min-h-0 min-w-0 flex-1 overflow-y-auto pb-0 pt-2">
        <div className="flex h-full min-h-0 w-full flex-col space-y-6 p-2 pr-2 pt-2">
          <div className="flex h-full min-h-0 w-full flex-1 flex-col gap-4">
            <Suspense fallback={<FiltersSkeleton controlCount={2} />}>
              <FiltersSection params={params} />
            </Suspense>

            <Suspense fallback={<TableLoading />}>
              <TableSection query={query} />
            </Suspense>

            <Suspense fallback={<PaginationSkeleton />}>
              <PaginationSection query={query} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
