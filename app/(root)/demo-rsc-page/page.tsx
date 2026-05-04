/**
 * Demo RSC Page
 * 
 * Purpose: React Server Component page that demonstrates fetching mock rental car data
 * Used in: app/(root)/demo-rsc-page route
 * Why: Shows RSC pattern with server-side data fetching and FilteringWrapper integration
 */

import { Suspense } from 'react'
import DemoRscIndex from '@/features/demo-rsc-page/demo-rsc-index'
import type { DemoRscPageSearchParams } from '@/features/demo-rsc-page/utils/ui/demo-rsc-page-url'
import DemoRscLoading from './loading'

export default async function DemoRscPage({
  searchParams,
}: {
  searchParams: Promise<DemoRscPageSearchParams>
}) {
  return (
    <Suspense fallback={<DemoRscLoading />}>
      <DemoRscIndex searchParams={searchParams} />
    </Suspense>
  )
}
