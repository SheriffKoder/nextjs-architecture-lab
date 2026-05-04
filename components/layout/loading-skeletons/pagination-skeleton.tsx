/**
 * Pagination skeleton
 *
 * Purpose: Loading placeholder for footer pagination (controls + page strip)
 * Used in: Route `loading.tsx` and Suspense fallbacks for paginated lists
 */

interface PaginationSkeletonProps {
  className?: string
}

export default function PaginationSkeleton({ className }: PaginationSkeletonProps) {
  return (
    <div
      className={['shrink-0 border-t border-tertiary/10 p-4', className].filter(Boolean).join(' ')}
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 animate-pulse rounded-md border bg-muted" />
          <div className="h-9 w-9 animate-pulse rounded-md border bg-muted" />
        </div>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-9 animate-pulse rounded-md border bg-muted sm:h-8 sm:w-8"
            />
          ))}
        </div>
        <div className="h-9 w-28 animate-pulse rounded-md border bg-muted sm:ml-auto" />
      </div>
    </div>
  )
}
