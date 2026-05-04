/**
 * Month Navigation Component
 * 
 * Purpose: Navigation buttons to go back/forward through months and years
 * Used in: app/development/calendar/components/month-navigation.tsx
 * Why: Reusable component for month/year navigation with console logging
 * 
 * Function Index:
 * MonthNavigation: Main component with back/forward buttons for month navigation
 * 
 * Steps:
 * 1. Accept current date and setter as props from parent
 * 2. Handle back button click to go to previous month
 * 3. Handle forward button click to go to next month
 * 4. Console log MM/YYYY format on each navigation
 * 5. Render navigation buttons with proper styling
 */

'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface MonthNavigationProps {
  currentDate: Date
  setCurrentDate: (date: Date) => void
  limitStartDate?: Date
  limitEndDate?: Date
}

const MonthNavigation = ({ 
  currentDate, 
  setCurrentDate,
  limitStartDate,
  limitEndDate
}: MonthNavigationProps) => {
  // Get current month and year from props
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  // Check if we can navigate to previous month
  const canGoPrevious = () => {
    if (!limitStartDate) return true
    const previousDate = new Date(currentYear, currentMonth - 1, 1)
    const limitStart = new Date(limitStartDate.getFullYear(), limitStartDate.getMonth(), 1)
    return previousDate >= limitStart
  }
  
  // Check if we can navigate to next month
  const canGoNext = () => {
    if (!limitEndDate) return true
    const nextDate = new Date(currentYear, currentMonth + 1, 1)
    const limitEnd = new Date(limitEndDate.getFullYear(), limitEndDate.getMonth(), 1)
    return nextDate <= limitEnd
  }
  
  // Handle back button click - go to previous month
  const handlePreviousMonth = () => {
    if (!canGoPrevious()) return
    const newDate = new Date(currentYear, currentMonth - 1, 1)
    setCurrentDate(newDate)
    
    // Console log MM/YYYY format
    const month = String(newDate.getMonth() + 1).padStart(2, '0')
    const year = newDate.getFullYear()
    console.log(`${month}/${year}`)
  }
  
  // Handle forward button click - go to next month
  const handleNextMonth = () => {
    if (!canGoNext()) return
    const newDate = new Date(currentYear, currentMonth + 1, 1)
    setCurrentDate(newDate)
    
    // Console log MM/YYYY format
    const month = String(newDate.getMonth() + 1).padStart(2, '0')
    const year = newDate.getFullYear()
    console.log(`${month}/${year}`)
  }
  
  const canPrevious = canGoPrevious()
  const canNext = canGoNext()
  
  return (
    <div className="flex items-center gap-2 relative overflow-visible pb-2">

      <h2 className='absolute md:relative w-fit whitespace-nowrap -bottom-3 right-1 text-xs text-muted-foreground'>
        Displaying from {limitStartDate?.toLocaleDateString()} to {limitEndDate?.toLocaleDateString()}
      </h2>

      {/* Back button */}
      <button
        onClick={handlePreviousMonth}
        disabled={!canPrevious}
        className={`p-2 rounded-lg border border-border bg-background transition-colors duration-200 ${
          canPrevious 
            ? 'hover:bg-muted hover:border-tertiary/50 cursor-pointer' 
            : 'opacity-50 cursor-not-allowed'
        }`}
        title="Previous month"
      >
        <ChevronLeft className="h-5 w-5 text-foreground" />
      </button>
      
      {/* Forward button */}
      <button
        onClick={handleNextMonth}
        disabled={!canNext}
        className={`p-2 rounded-lg border border-border bg-background transition-colors duration-200 ${
          canNext 
            ? 'hover:bg-muted hover:border-tertiary/50 cursor-pointer' 
            : 'opacity-50 cursor-not-allowed'
        }`}
        title="Next month"
      >
        <ChevronRight className="h-5 w-5 text-foreground" />
      </button>
    </div>
  )
}

export default MonthNavigation
