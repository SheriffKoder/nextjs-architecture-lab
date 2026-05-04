/**
 * Demo RSC Index Component
 *
 * Purpose: Page shell (header + actions) and a single Suspense-wrapped data region for rental cars RSC demo
 * Used in: `app/(root)/demo-rsc-page/page.tsx`
 * Why: Header stays stable; async data loads once inside `DemoRscDataShell` via `getRentalCarsPageData`
 *
 * Steps:
 * 1. Render PageHeader + ActionButtons
 * 2. Suspense + `DemoRscDataShell` — one parallel fetch for filters + table + pagination
 */

import { Suspense } from 'react'
import PageHeader from '@/components/layout/page-header'
import ActionButtons from './components/action-buttons'
import DemoRscDataShell from './components/demo-rsc-data-shell'
import { exportForMailchimpAction } from './actions'
import type { DemoRscPageSearchParams } from './utils/ui/demo-rsc-page-url'

export default function DemoRscIndex({
  searchParams,
}: {
  searchParams: Promise<DemoRscPageSearchParams>
}) {
  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      <header className="flex shrink-0 flex-col items-center justify-between gap-4 border-b border-tertiary/10 p-4 md:flex-row">
        <PageHeader subTitle="Demo RSC page with server-side data fetching, filtering, and pagination" />
        <ActionButtons exportForMailchimp={exportForMailchimpAction} />
      </header>

      <div className="flex min-h-0 min-w-0 flex-1 overflow-y-auto pb-0 pt-2">
        <div className="flex h-full min-h-0 w-full flex-col space-y-6 p-2 pr-2 pt-2">
          <div className="flex min-h-0 flex-1 flex-col">
            <Suspense
              fallback={
                <div className="flex min-h-0 flex-1 flex-col space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="h-9 flex-1 animate-pulse rounded-md border bg-muted" />
                    <div className="h-9 flex-1 animate-pulse rounded-md border bg-muted" />
                  </div>
                  <div className="min-h-0 flex-1 animate-pulse rounded-md border bg-muted" />
                </div>
              }
            >
              <DemoRscDataShell searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
