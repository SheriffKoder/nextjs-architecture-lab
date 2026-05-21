import React from 'react'
import { MONTH_NAMES } from '../../../utils/month-names'

interface MonthRowProps {
  year: number
  monthDayWidth: number
}

/**
 * MonthRow Component
 * 
 * Renders Row 3 of the Month view showing all days in each month.
 * Each month displays all its days (e.g., "1", "2", "3", ..., "30", "31")
 * with each day cell being monthDayWidth pixels wide.
 * 
 * This component calculates its own width based on the content (days in each month)
 * and returns the calculated widths for parent components to use.
 */
const MonthRow = ({ year, monthDayWidth }: MonthRowProps) => {
  // Calculate the actual width needed for each month based on its days
  const getMonthWidth = (monthIndex: number) => {
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
    return daysInMonth * monthDayWidth
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
              const today = isToday(year, monthIndex, day)
              
              return (
                <div
                  key={`${month}-day-${day}`}
                  className={`relative flex items-center justify-center text-xs font-medium ${
                    today
                      ? 'bg-foreground text-background border-r border-b border-transparent'
                      : 'text-foreground bg-[#f1f1f1] dark:bg-[#131313] border-r border-b border-border/50'
                  }`}
                  style={{ width: `${monthDayWidth}px` }}
                >
                  <span className='sticky top-0 left-2'>{day}</span>
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

export default MonthRow

