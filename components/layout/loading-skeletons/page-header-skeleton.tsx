/**
 * Page Header Skeleton Component
 * 
 * Purpose: Loading skeleton for PageHeader component
 * Used in: Loading states for pages with PageHeader
 * Why: Provides consistent loading UI that matches PageHeader layout
 * 
 * Steps:
 * 1. Render skeleton placeholders for parent route (if exists)
 * 2. Render skeleton placeholder for page title
 * 3. Render skeleton placeholder for subtitle (if exists)
 */

import LoadingValue from '@/components/loading-value'

interface PageHeaderSkeletonProps {
  /** Whether to show parent route skeleton */
  showParentRoute?: boolean
  /** Whether to show subtitle skeleton */
  showSubtitle?: boolean
}

/**
 * Page header skeleton component
 * 
 * Why: Matches PageHeader layout during loading
 * How: Uses LoadingValue components in same structure as PageHeader
 * 
 * Steps:
 * 1. Render parent route skeleton if showParentRoute is true
 * 2. Render page title skeleton (always shown)
 * 3. Render subtitle skeleton if showSubtitle is true
 */
export default function PageHeaderSkeleton({ 
  showParentRoute = false,
  showSubtitle = false 
}: PageHeaderSkeletonProps) {
  return (
    <div className="flex items-center gap-4 justify-between w-full md:w-fit">
      <div className="flex flex-col gap-1 flex-1">
        {/* Parent route skeleton - small text */}
        {/* Why: Match PageHeader parent route display */}
        {/* How: Small width LoadingValue */}
        {showParentRoute && (
          <LoadingValue className="h-4 w-24" />
        )}
        
        {/* Page title skeleton - bold text */}
        {/* Why: Match PageHeader title display */}
        {/* How: Large width LoadingValue for title */}
        <LoadingValue className="h-9 w-48" />

        {/* Subtitle skeleton */}
        {/* Why: Match PageHeader subtitle display */}
        {/* How: Medium width LoadingValue */}
        {showSubtitle && (
          <LoadingValue className="h-4 w-64 mt-1" />
        )}
      </div>
    </div>
  )
}
