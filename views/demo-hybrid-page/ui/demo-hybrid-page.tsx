/**
 * @file views/demo-hybrid-page/ui/demo-hybrid-page.tsx
 * Client shell for the hybrid rental cars demo page.
 *
 * Purpose: ShallowUrlProvider + QueryProvider + HydrationBoundary → page client
 * Used in: `app/(root)/demo-hybrid-page/page.tsx` (RSC passes dehydrated state)
 * Used for: Provider wiring only — content lives in `demo-hybrid-page-client.tsx`
 *
 * Function Index:
 * - DemoHybridPage — ShallowUrlProvider → QueryProvider → HydrationBoundary → client
 */

'use client'

import { HydrationBoundary, type DehydratedState } from '@tanstack/react-query'
import { ShallowUrlProvider } from '@/platform/url-kit/url-params'
import { QueryProvider } from '@/entities/demo-hybrid-cars/providers'
import { DemoHybridPageClient } from './demo-hybrid-page-client'

type DemoHybridPageClientProps = {
  initialSnapshot: string
  dehydratedState: DehydratedState
}

export default function DemoHybridPage({
  initialSnapshot,
  dehydratedState,
}: DemoHybridPageClientProps) {
  return (
    <ShallowUrlProvider initialSnapshot={initialSnapshot}>
      <QueryProvider>
        <HydrationBoundary state={dehydratedState}>
          <DemoHybridPageClient />
        </HydrationBoundary>
      </QueryProvider>
    </ShallowUrlProvider>
  )
}
