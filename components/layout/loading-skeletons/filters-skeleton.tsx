/**
 * Filters skeleton
 *
 * Purpose: Loading placeholder for filter bars (multi-select rows, search strip)
 * Used in: Route `loading.tsx` and Suspense fallbacks for filter-heavy pages
 */

interface FiltersSkeletonProps {
  /** Number of filter control placeholders (default: 2) */
  controlCount?: number
  className?: string
}

export default function FiltersSkeleton({
  controlCount = 2,
  className,
}: FiltersSkeletonProps) {
  return (
    <div className={['flex shrink-0 flex-col gap-2 p-2', className].filter(Boolean).join(' ')}>
      <div className="flex flex-wrap items-start gap-3 md:gap-4">
        {Array.from({ length: controlCount }).map((_, i) => (
          <div
            key={i}
            className="h-9 min-w-[120px] flex-1 animate-pulse rounded-md border bg-muted md:max-w-md"
          />
        ))}
      </div>
    </div>
  )
}
