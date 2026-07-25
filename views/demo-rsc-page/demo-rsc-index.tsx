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
import PageHeader from '@/shared/ui/page-header/page-header'
import ActionButtons from './ui/action-buttons'
import DemoRscDrawerLayer from './ui/drawer-content/demo-rsc-drawer-layer'
import FiltersSection from './ui/layout-sections/filters-section'
import TableAndPaginationSection from './ui/layout-sections/table-and-pagination-section'
import TablePaginationErrorBoundary from './ui/layout-sections-error-boundaries/table-pagination-error-boundary'

// Notifications
import OfflineDetector from '@/shared/ui/offline/offline-detector'
import ToastContainer from '@/shared/ui/toast/toast-container'
import { ToastPosition, ToastStacking } from '@/shared/ui/toast/toast'

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

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pb-0 pt-4">
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
