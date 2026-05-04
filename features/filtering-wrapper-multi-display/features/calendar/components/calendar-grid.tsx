/**
 * Calendar Grid Component
 * 
 * Purpose: Calendar grid display with dynamic month data
 * Used in: app/development/calendar/components/calendar-grid.tsx
 * Why: Calendar grid structure that displays actual month days
 * 
 * Function Index:
 * CalendarGrid: Main component that renders calendar grid with month data
 * 
 * Steps:
 * 1. Accept currentDate prop from parent
 * 2. Calculate days in month using utility function
 * 3. Create day headers (Mon, Tue, Wed, etc.)
 * 4. Create 5 rows of 7 cells with actual month days
 * 5. Style with proper borders and spacing
 */

'use client'

import { useMemo } from 'react'
import { getDaysInMonth, getFirstDayOfMonth, isToday } from '../utils/calendar-calculations'
import { getProjectsForDay } from '../utils/mapping-calculations'
import { ProjectSlotManager } from '../utils/project-slot-manager'
import CellContentWrapper from './cell-content-wrapper'
import ProjectBar from './project-bar'
import DayNumberCircle from './day-number-circle'
import ProjectOverflowList from './project-overflow-list'

interface CalendarGridProps {
  currentDate: Date
  projects?: any[]
  startDateKey?: string
  endDateKey?: string
  nameKey?: string
  onProjectClick?: (project: any) => void
}

const CalendarGrid = ({ 
  currentDate, 
  projects = [], 
  startDateKey = 'startDate', 
  endDateKey = 'endDate',
  nameKey = 'name',
  onProjectClick
}: CalendarGridProps) => {
  // Task colors array for background colors (not dependent on status)
  const taskColors = [
    '#3b82f6', // Blue
    '#f59e0b', // Amber
    '#8b5cf6', // Purple
    '#10b981', // Green
    '#ef4444', // Red
    '#06b6d4', // Cyan
    '#84cc16', // Lime
    '#f97316', // Orange
    '#ec4899', // Pink
    '#6366f1', // Indigo
    '#14b8a6', // Teal
    '#a3a3a3', // Gray
  ]

  // Get current month and year from the date
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()
  
  // Create slot manager instance (resets when month changes)
  const slotManager = useMemo(() => new ProjectSlotManager(), [currentYear, currentMonth])
  
  // Calculate month data using utility functions
  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth)
  
  // Day headers for the calendar (starting with Monday)
  const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  
  // Generate 35 cells (5 weeks × 7 days) with actual month data
  const totalCells = 35
  const cells = Array.from({ length: totalCells }, (_, index) => {
    const cellIndex = index + 1
    const dayNumber = cellIndex - firstDayOfMonth + 1
    
    // Return day number if it's within the current month, otherwise return null
    if (dayNumber >= 1 && dayNumber <= daysInMonth) {
      return dayNumber
    }
    return null
  })

  return (
    <div 
      className="w-full h-full border border-border rounded-lg overflow-hidden bg-background/20 backdrop-blur-sm"
    >
      {/* Combined Grid with Headers and Calendar Cells */}
      <div 
        className="h-full grid"
        style={{ 
          gridTemplateColumns: 'repeat(7, 1fr)',
          gridTemplateRows: 'auto repeat(5, 1fr)'
        }}
      >
        {/* Day Headers (Mon, Tue, Wed, etc.) */}
        {dayHeaders.map((day) => (
          <div 
            key={day}
            className="p-2 text-center text-sm font-medium border-r border-b border-border last:border-r-0 bg-muted/30 text-foreground"
          >
            {day}
          </div>
        ))}
        
        {/* Calendar Grid Cells */}
        {cells.map((dayNumber, index) => {
          const isCurrentMonth = dayNumber !== null

          // Get projects falls within this day/cell
          const dayProjects = dayNumber && isCurrentMonth 
            ? getProjectsForDay(projects, startDateKey, endDateKey, dayNumber, currentYear, currentMonth)
            : []

          // Process projects for this day to mark them as active
          if (dayProjects.length > 0) {
            dayProjects.forEach(project => {
              slotManager.getProjectSlot(project.id || project[nameKey])
            })
          }

          // Release slots for projects that are no longer active
          slotManager.releaseInactiveSlots()

          return (
            <div 
              key={index}
              className={`overflow-hidden border-r border-b border-border last:border-r-0 transition-colors duration-150 ${
                isCurrentMonth 
                  ? 'bg-background hover:bg-muted/50 backdrop-blur-sm' 
                  : 'bg-muted/20 backdrop-blur-sm'
              }`}
            >
              <CellContentWrapper 
                dayNumber={dayNumber} 
                isCurrentMonth={isCurrentMonth}
                isToday={isToday(dayNumber, currentYear, currentMonth)}
              >

                {/* Day Number Circle - Top Right */}
                <DayNumberCircle 
                  dayNumber={dayNumber}
                  isCurrentMonth={isCurrentMonth}
                  isToday={isToday(dayNumber, currentYear, currentMonth)}
                />

                {/* Project bars in fixed grid */}
                <div className="w-full h-full">
                  <div className="grid grid-rows-2 gap-0.5 h-full">
                    {Array.from({ length: 2 }).map((_, slotIndex) => {
                      const projectInSlot = dayProjects.find(project => 
                        slotManager.getProjectSlot(project.id || project[nameKey]) === slotIndex
                      )

                      if (!projectInSlot) {
                        return <div key={slotIndex} className="h-5" />
                      }

                      const position = slotManager.getProjectPosition(
                        dayNumber!,
                        projectInSlot,
                        startDateKey,
                        endDateKey
                      )

                      return (
                        <ProjectBar
                          key={`${projectInSlot.id || projectInSlot[nameKey]}-${slotIndex}`}
                          project={projectInSlot}
                          position={position}
                          color={projectInSlot.tagColor || '#000000cc'}
                          nameKey={nameKey}
                          onProjectClick={onProjectClick}
                        />
                      )
                    })}
                  </div>
                </div>

                  {/* Project Overflow List */}
                  <ProjectOverflowList 
                    projects={dayProjects.filter(project => {
                      const slot = slotManager.getProjectSlot(project.id || project[nameKey])
                      return slot >= 2 // Only show projects that are in slots 2+ (overflow)
                    })}
                    visibleCount={0}
                    className="mt-1"
                    nameKey={nameKey}
                    onProjectClick={onProjectClick}
                  />

              </CellContentWrapper>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CalendarGrid
