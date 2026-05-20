/**
 * Dashboard Skeleton Component
 * 
 * Purpose: Complete loading skeleton for dashboard page
 * Used in: app/(root)/dashboard/loading.tsx and demo pages
 * Why: Provides consistent loading UI that matches dashboard layout
 * 
 * Single Responsibility: Orchestrates all dashboard skeleton components
 * 
 * Layout Structure:
 * - Row 1: Health Cards (left) | Notifications (right)
 * - Charts Row: Line Chart (left) | Pie Chart (right)
 */

import LoadingValue from '@/components/design/inputs/loading-value'
import HealthCardsSkeleton from './health-cards-skeleton'
import NotificationCardsSkeleton from './notification-cards-skeleton'
import ChartsSkeleton from './charts-skeleton'

/**
 * Dashboard skeleton component
 * 
 * Why: Matches dashboard-content.tsx layout during loading
 * How: Uses skeleton components in same structure as dashboard content
 * 
 * Steps:
 * 1. Render health cards skeleton (left side of row 1)
 * 2. Render notifications skeleton (right side of row 1)
 * 3. Render charts skeleton (charts row)
 */
export default function DashboardSkeleton() {
  return (
    <div className="w-full border border-transparent flex flex-col gap-8">
      {/* Row 1 */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Health Cards Section */}
        <div className="flex-1">
          <HealthCardsSkeleton cardCount={6} />
        </div>

        {/* Notifications Section */}
        <div className="flex flex-col gap-4 w-full lg:w-[400px]">
          {/* Overdue Returns Section */}
          <div className="h-full w-full overflow-y-auto flex flex-col items-start justify-start relative">
            <LoadingValue className="h-5 w-32 mb-2 mt-2" />
            <NotificationCardsSkeleton cardCount={3} />
          </div>

          {/* Late Invoices Section */}
          <div className="h-full w-full overflow-y-auto flex flex-col items-start justify-start relative">
            <LoadingValue className="h-5 w-28 mb-2" />
            <NotificationCardsSkeleton cardCount={3} />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <ChartsSkeleton />
    </div>
  )
}
