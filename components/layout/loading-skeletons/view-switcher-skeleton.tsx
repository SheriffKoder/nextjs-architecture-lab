/**
 * View Switcher Skeleton Component
 * 
 * Purpose: Loading skeleton for view switcher component
 * Used in: Loading states for pages with view switchers
 * Why: Provides consistent loading UI that matches view switcher layout
 */

import LoadingValue from '@/features/ui-kit/layout/loading-value'

interface ViewSwitcherSkeletonProps {
  /** Number of options to display (default: 3) */
  optionCount?: number
  /** Optional className */
  className?: string
  /** Optional width (default: 280px) */
  width?: string
}

/**
 * View switcher skeleton component
 * 
 * Why: Matches view switcher layout during loading
 * How: Uses LoadingValue components in switcher structure
 */
export default function ViewSwitcherSkeleton({
  optionCount = 2,
  className = '',
  width = '280px'
}: ViewSwitcherSkeletonProps) {
  return (
    <div className={`relative ${className}`} style={{ width }}>
      {/* Container that matches view switcher structure */}
      <div className="w-full py-1 px-1 rounded-lg border bg-muted/50 backdrop-blur-sm relative overflow-hidden">
        <div className="flex gap-1 relative z-10 w-full">
          {Array.from({ length: optionCount }).map((_, index) => (
            <div
              key={`skeleton-option-${index}`}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md"
            >
              <LoadingValue className="w-4 h-4 rounded" />
              <LoadingValue className="h-4 w-12 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
