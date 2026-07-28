/**
 * Demo RSC Index Component
 *
 * Purpose: Page shell — header/toast immediate; each section (`FiltersSection`, `TableAndPaginationSection`)
 * fetches via `getFilters` / `getCars` inside `<Suspense>`; table island uses `TablePaginationErrorBoundary`.
 * Used in: `app/(root)/demo-rsc-page/page.tsx`
 */

import { Suspense } from 'react'
// Loading skeletons
import FiltersSkeleton from '@/shared/ui/loading-skeletons/filters/filters-skeleton'
import TableSkeleton from '@/shared/ui/loading-skeletons/table/table-skeleton'
import FilterToolbarSkeleton from '@/shared/ui/loading-skeletons/filters/filter-toolbar-skeleton'

// Layout components
import DemoRscPageHeader from './ui/demo-rsc-page-header'
import { DemoRscDrawerLayer } from './ui/drawer'
import FiltersSection from './ui/layout-sections/filters-section'
import TableAndPaginationSection from './ui/layout-sections/table-and-pagination-section'
import TablePaginationErrorBoundary from './ui/layout-sections-error-boundaries/table-pagination-error-boundary'

// Navigation transition context
import { NavigationTransitionRoot } from '@/platform/url-kit/filters/navigation-transition-context'

// Action button actions
import { exportForMailchimpAction } from './actions'

// Types
import type { DemoRscPageSearchParams } from '@/app/(root)/demo-rsc-page/page'


export default function DemoRscIndex({
  params,
}: {
  params: DemoRscPageSearchParams
}) {
  return (
    <NavigationTransitionRoot>
      <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
        <DemoRscPageHeader
          subTitle="Demo RSC page with server-side data fetching, filtering, and pagination"
          exportForMailchimp={exportForMailchimpAction}
          showAddCarDrawerButton
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pb-0 pt-0 md:pt-2 md:px-2">
          <div className="flex min-h-0 w-full flex-1 flex-col gap-4 overflow-hidden">
            <Suspense fallback={<FiltersSkeleton buttonCount={2} pillFilter={true} buttonWidthPx="md:w-[200px]" />}>
              <FiltersSection params={params} />
            </Suspense>
            {/* Table and pagination section is wrapped in an island error boundary and suspense for loading state*/}
            <TablePaginationErrorBoundary>
              <Suspense fallback={<TableSkeleton columnCount={10} rowCount={8} showHeader={true} />}>
                <TableAndPaginationSection params={params} />
              </Suspense>
            </TablePaginationErrorBoundary>
          </div>
        </div>

        <DemoRscDrawerLayer params={params} />
      </div>
    </NavigationTransitionRoot>
  )
}
