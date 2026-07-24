/**
 * Notification Cards Skeleton Component
 * 
 * Purpose: Loading skeleton for NotificationItemsContainer
 * Used in: DashboardSkeleton
 * Why: Provides consistent loading UI that matches notification cards layout
 * 
 * Single Responsibility: Only handles notification cards skeleton layout
 */

import LoadingValue from '@/shared/ui/loading-skeletons/loading-value/loading-value'

interface NotificationCardsSkeletonProps {
  /** Number of cards to display (default: 3) */
  cardCount?: number
}

/**
 * Notification cards skeleton component
 * 
 * Why: Matches NotificationItemsContainer layout during loading
 * How: Uses LoadingValue components in list structure matching notification cards
 */
export default function NotificationCardsSkeleton({ cardCount = 3 }: NotificationCardsSkeletonProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {Array.from({ length: cardCount }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 md:gap-4 px-1 py-2 md:p-2 
            border 
            bg-tertiary/10 border-[rgba(0,0,0,0.03)]
            dark:bg-tertiary/10 dark:border-[rgba(255,255,255,0.05)]
            rounded-lg"
        >
          {/* Icon skeleton */}
          <div className="flex-shrink-0 ml-1 hidden md:block">
            <LoadingValue className="w-5 h-5 md:w-6 md:h-6 rounded-full" />
          </div>

          {/* Content skeleton */}
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <LoadingValue className="w-24 md:w-32 h-4 md:h-5" />
            <LoadingValue className="w-32 md:w-40 h-3 md:h-4" />
          </div>

          {/* Chevron skeleton */}
          <div className="flex-shrink-0">
            <LoadingValue className="w-4 h-4 md:w-5 md:h-5 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
