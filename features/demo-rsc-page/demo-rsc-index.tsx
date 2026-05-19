/**
 * Demo RSC Index Component
 *
 * Purpose: Page shell — header/toast immediate; each section (`FiltersSection`, `TableAndPaginationSection`)
 * fetches via `getFilters` / `getCars` inside `<Suspense>`; table island uses `TablePaginationErrorBoundary`.
 * Used in: `app/(root)/demo-rsc-page/page.tsx`
 */

import { Suspense } from 'react'
import FiltersSkeleton from '@/components/layout/loading-skeletons/filters-skeleton'
import TableSkeleton from '@/components/layout/loading-skeletons/table-skeleton'
import FilterToolbarSkeleton from '@/components/layout/loading-skeletons/filter-toolbar-skeleton'
import PageHeader from '@/components/layout/page-header'
import OfflineDetector from '@/components/design/offline/offline-detector'
import ToastContainer from '@/components/design/toast/toast-container'
import { ToastPosition, ToastStacking } from '@/components/design/toast/toast'
import { NavigationTransitionRoot } from '@/features/ui/filters/navigation-transition-context'
import ActionButtons from './components/action-buttons'
import DemoRscDrawerLayer from './components/drawer-content/demo-rsc-drawer-layer'
import FiltersSection from './components/layout-sections/filters-section'
import TableAndPaginationSection from './components/layout-sections/table-and-pagination-section'
import TablePaginationErrorBoundary from './components/layout-sections/table-pagination-error-boundary'
import { exportForMailchimpAction } from './actions'
import type { DemoRscPageSearchParams } from '@/app/(root)/demo-rsc-page/page'


export default function DemoRscIndex({
  params,
}: {
  params: DemoRscPageSearchParams
}) {
  return (
    <NavigationTransitionRoot>
      <ToastContainer
        position={ToastPosition.BOTTOM_RIGHT}
        stacking={ToastStacking.PUSH_DOWN}
      />
      <OfflineDetector />
      <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 flex-col items-center justify-between gap-4 border-b border-tertiary/10 p-4 md:flex-row">
          <PageHeader subTitle="Demo RSC page with server-side data fetching, filtering, and pagination" />
          <ActionButtons
            exportForMailchimp={exportForMailchimpAction}
            showAddCarDrawerButton
          />
        </header>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pb-0 pt-2">
          <div className="flex min-h-0 w-full flex-1 flex-col gap-4 overflow-hidden px-2">
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
