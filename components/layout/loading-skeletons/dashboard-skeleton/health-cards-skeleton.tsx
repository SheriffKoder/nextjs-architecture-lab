/**
 * Health Cards Skeleton Component
 * 
 * Purpose: Loading skeleton for ScoreCardsContainer
 * Used in: DashboardSkeleton
 * Why: Provides consistent loading UI that matches health cards layout
 * 
 * Single Responsibility: Only handles health cards skeleton layout
 */

import LoadingValue from '@/features/ui-kit/layout/loading-value'

interface HealthCardsSkeletonProps {
  /** Number of cards to display (default: 6) */
  cardCount?: number
}

/**
 * Health cards skeleton component
 * 
 * Why: Matches ScoreCardsContainer layout during loading
 * How: Uses LoadingValue components in grid structure matching health cards
 */
export default function HealthCardsSkeleton({ cardCount = 6 }: HealthCardsSkeletonProps) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-3 h-full w-full">
      {Array.from({ length: cardCount }).map((_, index) => (
        <div key={index} className="col-span-1 p-1 md:p-2 w-full">
          <div className="flex flex-col items-start justify-start p-2 border h-full w-full
            bg-muted/50 border-[rgba(0,0,0,0.03)] rounded-lg
            dark:bg-tertiary/10 dark:border-[rgba(255,255,255,0.05)] gap-2">
            {/* Title skeleton */}
            <LoadingValue className="h-3 md:h-4 w-20 md:w-24" />
            
            {/* Subtitle skeleton (hidden on mobile) */}
            <div className="hidden md:block">
              <LoadingValue className="h-2 md:h-3 w-32 md:w-40 mb-2 md:mb-3 min-h-[2.5rem]" />
            </div>

            {/* Value skeleton */}
            <div className="w-full h-[7vw] flex items-center justify-start mt-auto">
              <LoadingValue className="w-16 md:w-24 lg:w-32 h-6 md:h-8 lg:h-10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
