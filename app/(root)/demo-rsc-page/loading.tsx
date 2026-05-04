/**
 * Demo RSC Page Loading Component
 * 
 * Purpose: Loading skeleton for demo RSC page
 * Used in: app/(root)/demo-rsc-page/page.tsx Suspense fallback
 * Why: Provides consistent loading UI that matches page layout
 */

import TableSkeleton from '@/components/layout/loading-skeletons/table-skeleton'
import PageHeaderSkeleton from '@/components/layout/loading-skeletons/page-header-skeleton'

export default function DemoRscLoading() {
  return (
    <div className="flex-1 flex flex-col h-full w-full min-w-0 overflow-hidden">
      {/* Header skeleton */}
      <header className="flex flex-col md:flex-row gap-4 p-4 border-b border-tertiary/10 items-center justify-between flex-shrink-0">
        <PageHeaderSkeleton showSubtitle={true} />
        <div className="flex flex-row gap-2 items-start w-full lg:w-auto">
          <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
          <div className="h-10 w-28 bg-muted animate-pulse rounded-md" />
        </div>
      </header>
      
      {/* Table skeleton */}
      <div className="flex-1 overflow-y-auto flex pb-0 min-w-0 pt-2 w-full">
        <div className="h-full w-full pr-2 pt-2 min-w-0 p-2">
          <TableSkeleton 
            columnCount={9} 
            rowCount={10}
            showHeader={true}
          />
        </div>
      </div>
    </div>
  )
}
