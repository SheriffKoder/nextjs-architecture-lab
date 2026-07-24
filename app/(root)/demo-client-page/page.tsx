/**
 * Demo Client Page — app route entry
 *
 * Purpose: `QueryProvider` + `Suspense` only; layout and chrome live in `demo-client-index.tsx`
 * Used in: `/demo-client-page`
 */

'use client'

import { Suspense } from 'react'
import { QueryProvider } from '@/entities/demo-client-page/tanstack'
import DemoClientIndex from '@/entities/demo-client-page/demo-client-index'
import DemoClientPageLoading from './loading'

export default function DemoClientPage() {
  return (
    <QueryProvider>
      <Suspense fallback={<DemoClientPageLoading />}>
        <DemoClientIndex />
      </Suspense>
    </QueryProvider>
  )
}
