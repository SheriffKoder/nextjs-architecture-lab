/**
 * Demo Client Page — TanStack `QueryClientProvider` wrapper
 *
 * Purpose: Mount a stable `QueryClient` for hooks under `/demo-client-page` (Step 8)
 * Used in: Route layout or page wrapper when the app root does not already provide React Query
 * Why: `@tanstack/react-query` hooks require a provider above consumers
 */

'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
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

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
