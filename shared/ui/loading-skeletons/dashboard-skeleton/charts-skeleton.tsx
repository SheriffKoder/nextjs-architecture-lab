/**
 * Charts Skeleton Component
 * 
 * Purpose: Loading skeleton for Charts component
 * Used in: DashboardSkeleton
 * Why: Provides consistent loading UI that matches charts layout
 * 
 * Single Responsibility: Only handles charts skeleton layout
 */

import LoadingValue from '@/shared/ui/loading-skeletons/loading-value/loading-value'

/**
 * Charts skeleton component
 * 
 * Why: Matches Charts component layout during loading
 * How: Uses LoadingValue components in structure matching line chart and pie chart
 */
export default function ChartsSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full">
      {/* Line Chart Skeleton */}
      <div className="lg:w-[calc(100%-500px)] p-2 flex-1">
        <LoadingValue className="h-5 w-32 mb-2" />
        <div className="rounded-lg h-[500px] border p-2">
          <div className="w-full h-full flex items-center justify-center">
            <LoadingValue className="w-full h-full rounded" />
          </div>
        </div>
      </div>

      {/* Pie Chart Skeleton */}
      <div className="w-full lg:w-[400px]">
        <LoadingValue className="h-5 w-32 mb-2" />
        {/* Pie chart container - matches PieChartContainer structure */}
        <div className="w-full h-full flex flex-col items-center justify-center">
          {/* Legend skeleton */}
          <div className="p-2 w-full mb-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center gap-2 py-1 px-2">
                  <LoadingValue className="w-2 h-2 md:w-3 md:h-3 rounded-full" />
                  <LoadingValue className="h-3 w-16" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Pie chart skeleton */}
          <div className="h-[50%] w-[90%] mb-auto flex items-center justify-center">
            <LoadingValue className="w-[150px] h-[150px] rounded-full" />
          </div>
          
          {/* Title skeleton */}
          <LoadingValue className="h-4 w-24 mb-2" />
        </div>
      </div>
    </div>
  )
}
