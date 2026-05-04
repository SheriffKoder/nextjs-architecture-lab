import React from 'react'
import { getWeekStartDays } from '../../../utils/year/week-calculator'
import { MONTH_NAMES } from '../../../utils/month-names'

interface WeekRowProps {
  year: number
  yearWeekWidth: number
  isFirstYear?: boolean
}

/**
 * WeekRow Component
 * 
 * Renders Row 3 of the Year view showing week start days for each month.
 * Each month displays its week start days (e.g., "5", "12", "19", "26")
 * with each week cell being yearWeekWidth pixels wide.
 * 
 * This component calculates its own width based on the content (weeks in each month)
 * and returns the calculated widths for parent components to use.
 */
const WeekRow = ({ year, yearWeekWidth, isFirstYear }: WeekRowProps) => {
  // Calculate widths; add leading partial for January of first year only
  const dayWidth = yearWeekWidth / 7
  const getMonthWidth = (monthIndex: number) => {
    const weekStartDays = getWeekStartDays(year, monthIndex)
    let base = weekStartDays.length * yearWeekWidth
    if (isFirstYear && monthIndex === 0) {
      const firstDay = new Date(year, 0, 1)
      const dow = firstDay.getDay() // 0=Sun..6=Sat
      const iso = dow === 0 ? 6 : dow - 1 // 0=Mon..6=Sun
      const daysToNextMonday = iso === 0 ? 0 : 7 - iso
      base += daysToNextMonday * dayWidth
    }
    return base
  }

  return (
    <div className='h-6 flex flex-row border-r border-b border-border/60'>
      {MONTH_NAMES.map((month, monthIndex) => {
        const weekStartDays = getWeekStartDays(year, monthIndex)
        const actualMonthWidth = getMonthWidth(monthIndex)
        
        return (
          <div
            key={month}
            className='flex flex-row border-r border-border/60'
            style={{ width: `${actualMonthWidth}px` }}
          >
            {/* Leading partial cell for Jan of first year (days before first Monday) */}
            {isFirstYear && monthIndex === 0 && (() => {
              const firstDay = new Date(year, 0, 1)
              const dow = firstDay.getDay()
              const iso = dow === 0 ? 6 : dow - 1
              const daysToNextMonday = iso === 0 ? 0 : 7 - iso
              if (daysToNextMonday > 0) {
                return (
                  <div
                    key={`jan-leading-partial`}
                    className='relative flex items-center justify-start bg-[#f1f1f1] dark:bg-[#131313] border-r border-border/60'
                    style={{ width: `${daysToNextMonday * dayWidth}px` }}
                    aria-label={`Leading partial week: ${daysToNextMonday} days`}
                  />
                )
              }
              return null
            })()}
            {weekStartDays.map((startDay, weekIndex) => (
              <div
                key={`${month}-week-${weekIndex}`}
                className='relative flex items-center justify-start text-xs font-medium text-foreground bg-[#f1f1f1] dark:bg-[#131313] border-r border-border/60'
                style={{ width: `${yearWeekWidth}px` }}
              >
                <span className='sticky top-0 left-2 ml-2'>{startDay}</span>
                {/* <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-500 text-white rounded-full p-0.5 text-[8px] w-[16px] h-[16px] flex items-center justify-center'>
                  {weekIndex + 1}
                </span> */}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

export default WeekRow

