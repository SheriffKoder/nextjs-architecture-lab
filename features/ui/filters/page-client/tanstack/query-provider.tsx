/**
 * Query Client Provider
 * 
 * Purpose: Provides TanStack Query context to child components
 * Used in: Pages that use TanStack Query hooks
 * Why: TanStack Query requires QueryClientProvider to work
 * 
 * Function Index:
 * - QueryProvider: Component that wraps children with QueryClientProvider
 *   Example input: <QueryProvider><App /></QueryProvider>
 *   Example output: App with TanStack Query context available
 * 
 * Steps:
 * 1. Create QueryClient instance
 * 2. Wrap children with QueryClientProvider
 * 3. Export for use in pages
 */

'use client'

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

/**
 * QueryProvider component
 * WHY: Provides TanStack Query context to child components
 * HOW: Creates QueryClient and wraps children with QueryClientProvider
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} QueryClientProvider wrapper
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create QueryClient instance
  // WHY: TanStack Query needs a QueryClient instance
  // HOW: Use useState to create client once and reuse it
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: 5 minutes
            // WHY: Prevent unnecessary refetches
            // HOW: Data considered fresh for 5 minutes
            staleTime: 5 * 60 * 1000,
            // Retry failed requests once
            // WHY: Handle temporary network issues
            // HOW: Retry once before showing error
            retry: 1,
          },
        },
      })
  )

  // Wrap children with QueryClientProvider
  // WHY: Provide QueryClient context to all child components
  // HOW: QueryClientProvider component from TanStack Query
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
