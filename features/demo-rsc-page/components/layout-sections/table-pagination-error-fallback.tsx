'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import TableSkeleton from '@/components/layout/loading-skeletons/table-skeleton'

export type TablePaginationErrorFallbackProps = {
  error: Error
  resetErrorBoundary: () => void
}

const TABLE_SKELETON_COLUMN_COUNT = 10
const TABLE_SKELETON_ROW_COUNT = 12

export default function TablePaginationErrorFallback({
  error,
  resetErrorBoundary,
}: TablePaginationErrorFallbackProps) {
  useEffect(() => {
    console.error('[demo-rsc table]', error)
  }, [error])

  const message =
    error.message || 'Something went wrong while loading the table.'

  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
      role="alert"
    >
      <div className="min-h-0 flex-1 overflow-hidden" aria-hidden>
        <TableSkeleton
          columnCount={TABLE_SKELETON_COLUMN_COUNT}
          rowCount={TABLE_SKELETON_ROW_COUNT}
          showHeader={true}
          animated={false}
        />
      </div>

      <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
        <div className="pointer-events-auto w-full max-w-md space-y-5 rounded-xl border border-border bg-card p-8 shadow-lg shadow-black/10 dark:border-zinc-800 dark:bg-zinc-900/95 dark:shadow-2xl dark:shadow-black/40">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 ring-1 ring-destructive/25 dark:bg-red-500/15 dark:ring-red-500/30">
              <AlertTriangle
                className="h-6 w-6 text-destructive dark:text-red-400"
                aria-hidden
              />
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground dark:text-zinc-50">
              Could not load the table
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground dark:text-zinc-400">
              {message}
            </p>
          </div>
          <Button
            type="button"
            className="w-full dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            variant="outline"
            onClick={resetErrorBoundary}
          >
            Try again
          </Button>
        </div>
      </div>
    </div>
  )
}
