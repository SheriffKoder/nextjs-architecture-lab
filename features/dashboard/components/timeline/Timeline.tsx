/**
 * Timeline Component
 * 
 * Purpose: Displays a 14-day timeline grid starting from today
 * Used in: Dashboard content
 * Why: Shows upcoming dates in a visual grid format
 */

'use client'

import React from 'react'

export interface ExpirationNote {
  date: string // MM/DD/YYYY format
  note: string
  amount?: number // Optional capital due amount
}

interface TimelineProps {
  className?: string
  expirations?: ExpirationNote[]
}

export default function Timeline({ className = '', expirations = [] }: TimelineProps) {
  // Generate array of 14 dates starting from today
  const generateDates = () => {
    const dates: Date[] = []
    const today = new Date()
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date)
    }
    
    return dates
  }

  // Format date as "2 Jan" (day number and month abbreviation)
  const formatDate = (date: Date): string => {
    const day = date.getDate()
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = monthNames[date.getMonth()]
    return `${day} ${month}`
  }

  // Format date as MM/DD/YYYY for comparison with expirations
  const formatDateForComparison = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${month}/${day}/${year}`
  }

  const dates = generateDates()

  // Find expiration note for a given date
  const getExpirationForDate = (date: Date): ExpirationNote | undefined => {
    const dateString = formatDateForComparison(date)
    return expirations.find(exp => exp.date === dateString)
  }

  return (
    <div 
      className={`grid gap-2 h-fit min-w-fit ${className}`}
      style={{ gridTemplateColumns: 'repeat(14, minmax(120px, 1fr))' }}
    >
      {dates.map((date, index) => {
        const expiration = getExpirationForDate(date)
        const expirationIndex = expiration ? expirations.findIndex(exp => exp.date === formatDateForComparison(date)) : -1
        const isAbove = expirationIndex >= 0 && expirationIndex % 2 === 0 // Even index = above, odd = below
        
        return (
          <div
            key={index}
            className="relative flex items-center justify-center p-2 border border-border rounded text-background bg-tertiary min-w-[120px]"
          >
            {formatDate(date)}
            {expiration && (
              <>
                {/* Connecting line */}
                <div
                  className={`absolute left-1/2 transform -translate-x-1/2 w-px bg-border ${
                    isAbove ? 'bottom-full mb-0' : 'top-full mt-0'
                  }`}
                  style={{
                    height: '30px'
                  }}
                />
                {/* Expiration note */}
                <div
                  className={`absolute left-0 right-0 w-full text-xs text-foreground/80 bg-background/90 backdrop-blur-sm px-2 py-1 border border-border rounded ${
                    isAbove ? 'bottom-full mb-[30px]' : 'top-full mt-[30px]'
                  }`}
                >
                  {expiration.note}
                  {expiration.amount && (
                    <span className="block text-xs font-semibold mt-0.5">
                      ${expiration.amount.toLocaleString()}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
