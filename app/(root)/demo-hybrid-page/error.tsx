/**
 * @file app/(root)/demo-hybrid-page/error.tsx
 * Route error boundary for the hybrid demo page.
 *
 * Purpose: Recoverable error UI when the RSC page or prefetch throws
 * Used in: App Router error boundary for `/demo-hybrid-page`
 * Used for: Prefetch failures, unexpected server errors; `reset()` re-attempts the segment
 *
 * Function Index:
 * - DemoHybridPageError — client error boundary component
 *
 * Steps:
 * 1. Log error digest to console in development.
 * 2. Render human-readable message + optional Next digest.
 * 3. Offer `reset()` to retry server render.
 */

'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DemoHybridPageError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Step 1: surface server/prefetch failures for debugging
  useEffect(function logHybridPageError() {
    console.error('[demo-hybrid-page]', error)
  }, [error])

  const message =
    error.message || 'Something went wrong while loading this page.'

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-background text-foreground">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-6">
        {/* Step 2–3: error card + retry */}
        <div className="w-full max-w-md space-y-5 rounded-xl border border-border bg-card p-8 shadow-lg shadow-black/5 dark:border-zinc-800 dark:bg-zinc-900/90 dark:shadow-2xl dark:shadow-black/40">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 ring-1 ring-destructive/25 dark:bg-red-500/15 dark:ring-red-500/30">
              <AlertTriangle
                className="h-6 w-6 text-destructive dark:text-red-400"
                aria-hidden
              />
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground dark:text-zinc-50">
              Could not load the hybrid page
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground dark:text-zinc-400">
              {message}
            </p>
            {error.digest ? (
              <p className="font-mono text-xs text-muted-foreground/80 dark:text-zinc-600">
                Digest: {error.digest}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            className="w-full dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            variant="outline"
            onClick={() => reset()}
          >
            Try again
          </Button>
        </div>
      </div>
    </div>
  )
}
