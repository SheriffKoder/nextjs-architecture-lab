/**
 * Day Number Circle Component
 * 
 * Purpose: Renders the day number in a circle at the top-right of calendar cells
 * Used in: app/development/calendar/components/day-number-circle.tsx
 * Why: Encapsulates day number display logic with proper styling and positioning
 * 
 * Function Index:
 * DayNumberCircle: Main component that renders the day number circle
 * 
 * Steps:
 * 1. Accept day number and styling props
 * 2. Determine colors based on whether it's today
 * 3. Render circle with day number
 */

'use client'

interface DayNumberCircleProps {
  dayNumber: number | null
  isCurrentMonth: boolean
  isToday: boolean
}

const DayNumberCircle = ({ 
  dayNumber, 
  isCurrentMonth, 
  isToday
}: DayNumberCircleProps) => {
  // Don't render if no day number or not current month
  if (!dayNumber || !isCurrentMonth) {
    return null
  }

  return (
    <div className='w-full flex justify-end p-1'>
      <div 
        className={`w-3 h-3 p-2.5 rounded-full flex items-center justify-center text-[10px] font-medium ${
          isToday 
            ? 'bg-tertiary text-background' 
            : 'bg-background text-foreground'
        }`}
      >
        {dayNumber}
      </div>
    </div>
  )
}

export default DayNumberCircle
