/**
 * @file entities/demo-hybrid-cars/providers/query-provider.tsx
 * TanStack `QueryClientProvider` wrapper for the hybrid demo page.
 *
 * Purpose: Mount a stable per-route `QueryClient` for hooks under `/demo-hybrid-page`
 * Used in: `views/demo-hybrid-page/ui/demo-hybrid-page.tsx`
 * Used for: Client hydration and subsequent TanStack reads/mutations
 *
 * Function Index:
 * - QueryProvider — wraps children with a memoized `QueryClient`
 *
 * Steps:
 * 1. Create one `QueryClient` per provider mount (avoids sharing across requests on server).
 * 2. Apply default query options (staleTime, retry).
 * 3. Render `QueryClientProvider` above page content.
 */

'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

/**
 * Provides TanStack Query context for the hybrid rental cars view.
 *
 * @param props.children - Client page subtree that calls entity query hooks
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Step 1–2: stable client instance for this browser session / route tree
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
          },
        },
      })
  )

  // Step 3: expose context to hooks
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
