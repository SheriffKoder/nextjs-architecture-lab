import React from 'react'
import { MONTH_NAMES } from '../../../utils/month-names'

interface WeekRowProps {
  year: number
  weekDayWidth: number
}

/**
 * WeekRow Component for Week View
 * 
 * Renders Row 3 of the Week view showing days in each month.
 * Each month displays its days with labels (e.g., "Mon 3", "Tue 4", "Wed 5")
 * with each day cell being weekDayWidth pixels wide.
 * 
 * Weekend days (Saturday/Sunday) have a slightly darker background.
 * This component calculates its own width based on the content (days in each month).
 */
const WeekRow = ({ year, weekDayWidth }: WeekRowProps) => {
  // Day names for labels
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  // Calculate the actual width needed for each month based on its days
  const getMonthWidth = (monthIndex: number) => {
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
    return daysInMonth * weekDayWidth
  }

  // Get day name and number for a specific date
  const getDayLabel = (year: number, monthIndex: number, day: number) => {
    const date = new Date(year, monthIndex, day)
    const dayName = DAY_NAMES[date.getDay()]
    return `${dayName} ${day}`
  }

  // Check if a day is weekend (Saturday or Sunday)
  const isWeekend = (year: number, monthIndex: number, day: number) => {
    const date = new Date(year, monthIndex, day)
    const dayOfWeek = date.getDay()
    return dayOfWeek === 0 || dayOfWeek === 6 // Sunday or Saturday
  }

  // Check if a day is Sunday
  const isSunday = (year: number, monthIndex: number, day: number) => {
    const date = new Date(year, monthIndex, day)
    return date.getDay() === 0 // Sunday
  }

  // Check if a day is today
  const isToday = (year: number, monthIndex: number, day: number) => {
    const today = new Date()
    return (
      year === today.getFullYear() &&
      monthIndex === today.getMonth() &&
      day === today.getDate()
    )
  }

  return (
    <div className='h-6 flex flex-row border-r border-border/50'>
      {MONTH_NAMES.map((month, monthIndex) => {
        // Calculate days in this month
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
        const actualMonthWidth = getMonthWidth(monthIndex)
        
        return (
          <div
            key={month}
            className='flex flex-row border-r border-border/50'
            style={{ width: `${actualMonthWidth}px` }}
          >
            {days.map((day) => {
              const dayLabel = getDayLabel(year, monthIndex, day)
              const isWeekendDay = isWeekend(year, monthIndex, day)
              const isSundayDay = isSunday(year, monthIndex, day)
              const today = isToday(year, monthIndex, day)
              
              return (
                <div
                  key={`${month}-day-${day}`}
                  className={`relative flex items-center justify-center text-xs font-medium ${
                    today
                      ? 'bg-foreground text-background border-b border-r border-transparent'
                      : `${
                          isWeekendDay 
                            ? 'bg-gray-100 dark:bg-gray-800 text-foreground'
                            : 'bg-[#f1f1f1] dark:bg-[#131313] text-foreground'
                        } border-b border-border/50 ${
                          isSundayDay 
                            ? 'border-r-2 border-border/50' 
                            : 'border-r border-border/50'
                        }`
                  }`}
                  style={{ width: `${weekDayWidth}px` }}
                >
                  <span className='sticky top-0 left-2'>{dayLabel}</span>
                  {today && (
                    <div
                      className="absolute -bottom-0 left-1/2 -translate-x-1/2 translate-y-full"
                      style={{
                        width: 0,
                        height: 0,
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderTop: '6px solid hsl(var(--foreground))',
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export default WeekRow
