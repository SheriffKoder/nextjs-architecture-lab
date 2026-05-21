/**
 * Calendar Development Page
 * 
 * Purpose: Main page for calendar development features
 * Used in: app/development/calendar/page.tsx
 * Why: Entry point for calendar development functionality
 * 
 * Function Index:
 * CalendarPage: Main page component for calendar development
 * 
 * Steps:
 * 1. Create shared state for current date
 * 2. Pass date and setter to both components
 * 3. Keep page structure minimal and focused
 */

'use client'

import { useState, useMemo } from 'react'
import CurrentYear from './components/current-year'
import MonthNavigation from './components/month-navigation'
import CalendarGrid from './components/calendar-grid'
import { getProjectsForMonth } from './utils/mapping-calculations'

const CalendarContainer = ({
  projects, 
  startDateKey, 
  endDateKey, 
  nameKey = 'name', 
  onProjectClick,
  limitStartDate,
  limitEndDate
}: {
  projects: any[]
  startDateKey: string
  endDateKey: string
  nameKey?: string
  onProjectClick?: (project: any) => void
  limitStartDate?: Date
  limitEndDate?: Date
}) => {
  // Calculate initial date respecting limits
  const initialDate = useMemo(() => {
    const today = new Date()
    let date = new Date(today.getFullYear(), today.getMonth(), 1)
    
    // If limitStartDate is set and today is before it, use limitStartDate
    if (limitStartDate) {
      const limitStart = new Date(limitStartDate.getFullYear(), limitStartDate.getMonth(), 1)
      if (date < limitStart) {
        date = new Date(limitStart)
      }
    }
    
    // If limitEndDate is set and today is after it, use limitEndDate
    if (limitEndDate) {
      const limitEnd = new Date(limitEndDate.getFullYear(), limitEndDate.getMonth(), 1)
      if (date > limitEnd) {
        date = new Date(limitEnd)
      }
    }
    
    return date
  }, [limitStartDate, limitEndDate])
  
  // Shared state for current date that both components will use
  const [currentDate, setCurrentDate] = useState(initialDate)


  // Get projects for the current month
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()
  const filteredProjects = getProjectsForMonth(
    projects,
    startDateKey,
    endDateKey,
    currentYear,
    currentMonth
  )

  return (
    <div className='flex flex-col gap-4 w-full h-full'>


        {/* Date header and month navigation */}
        <div className='flex flex-row justify-between items-center flex-shrink-0'>
            <CurrentYear currentDate={currentDate} />
            <MonthNavigation 
              currentDate={currentDate} 
              setCurrentDate={setCurrentDate}
              limitStartDate={limitStartDate}
              limitEndDate={limitEndDate}
            />
        </div>

        <div className='w-full flex-1 relative overflow-x-auto'>
          <div className='min-w-[644px] h-full'>
          <CalendarGrid 
            currentDate={currentDate} // MM/YYYY
            projects={filteredProjects} // Projects for the current month
            startDateKey={startDateKey}
            endDateKey={endDateKey}
            nameKey={nameKey}
            onProjectClick={onProjectClick}
          />
          </div>
        </div>

    </div>
  )
}

export default CalendarContainer
