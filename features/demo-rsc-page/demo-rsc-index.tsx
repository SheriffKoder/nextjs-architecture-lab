/**
 * Demo RSC Index Component
 *
 * Purpose: Page shell — `params` normalized in route `page.tsx`; Suspense for filters + combined table/pagination
 * Used in: `app/(root)/demo-rsc-page/page.tsx`
 * Why: `NavigationTransitionRoot` ties URL updates to one transition + optional dimmer on the list island
 */

import { Suspense } from 'react'
import FiltersSkeleton from '@/components/layout/loading-skeletons/filters-skeleton'
import TableSkeleton from '@/components/layout/loading-skeletons/table-skeleton'
import PageHeader from '@/components/layout/page-header'
import { NavigationTransitionRoot } from '@/features/ui/filters/navigation-transition-context'
import ActionButtons from './components/action-buttons'
import DemoRscDrawerLayer from './components/drawer-content/demo-rsc-drawer-layer'
import FiltersSection from './components/layout-sections/filters-section'
import TableAndPaginationSection from './components/layout-sections/table-and-pagination-section'
import { exportForMailchimpAction } from './actions'
import type { DemoRscPageSearchParams } from '@/app/(root)/demo-rsc-page/page'

function TableLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col p-2">
      <TableSkeleton columnCount={10} rowCount={10} showHeader={true} />
    </div>
  )
}

export default function DemoRscIndex({ params }: { params: DemoRscPageSearchParams }) {
  return (
    <NavigationTransitionRoot>
      <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 flex-col items-center justify-between gap-4 border-b border-tertiary/10 p-4 md:flex-row">
          <PageHeader subTitle="Demo RSC page with server-side data fetching, filtering, and pagination" />
          <ActionButtons
            exportForMailchimp={exportForMailchimpAction}
            showAddCarDrawerButton
          />
        </header>

        <div className="flex min-h-0 min-w-0 flex-1 overflow-y-auto pb-0 pt-2">
          <div className="flex h-full min-h-0 w-full flex-col space-y-6 p-2 pr-2 pt-2">
            <div className="flex h-full min-h-0 w-full flex-1 flex-col gap-4">
              <Suspense fallback={<FiltersSkeleton controlCount={2} />}>
                <FiltersSection params={params} />
              </Suspense>

              <Suspense fallback={<TableLoading />}>
                <TableAndPaginationSection params={params} />
              </Suspense>
            </div>
          </div>
        </div>

        <DemoRscDrawerLayer />
      </div>
    </NavigationTransitionRoot>
  )
}
