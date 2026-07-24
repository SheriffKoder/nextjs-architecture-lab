/**
 * Current Year Component
 * 
 * Purpose: Display current month and year as a header
 * Used in: app/development/calendar/components/current-year.tsx
 * Why: Reusable component for showing current date information
 * 
 * Function Index:
 * CurrentYear: Main component that renders current month and year
 * 
 * Steps:
 * 1. Accept current date as prop from parent
 * 2. Format month and year for display
 * 3. Render as a header element
 */

'use client'

interface CurrentYearProps {
  currentDate: Date
}

const CurrentYear = ({ currentDate }: CurrentYearProps) => {
  // Format month and year for display from the passed date
  const month = currentDate.toLocaleString('en-US', { month: 'long' })
  const year = currentDate.getFullYear()
  
  return (
    <div className="text-center pl-2">
      <h1 className="text-lg font-bold text-foreground">
        {month} {year}
      </h1>
    </div>
  )
}

export default CurrentYear
