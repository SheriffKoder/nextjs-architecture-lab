/**
 * DateRangeInput Component
 * 
 * Purpose: Reusable date range input component (from MM DD YYYY to MM DD YYYY)
 * Used in: TableFilterList for date field filtering
 * Why: Provides theme-aware date range inputs that update pending selections
 */

'use client'

import React, { useState, useEffect } from 'react'

interface DateParts {
  month: string
  day: string
  year: string
}

interface DateRangeInputProps {
  startDate?: string // MM-DD-YYYY format
  endDate?: string // MM-DD-YYYY format
  onChange: (start: string, end: string) => void
}

export function DateRangeInput({ startDate = '', endDate = '', onChange }: DateRangeInputProps) {
  // Parse start date into parts
  const [startDateParts, setStartDateParts] = useState<DateParts>(() => {
    if (!startDate) return { month: '', day: '', year: '' }
    const parts = startDate.split('-')
    return {
      month: parts[0] || '',
      day: parts[1] || '',
      year: parts[2] || ''
    }
  })

  // Parse end date into parts
  const [endDateParts, setEndDateParts] = useState<DateParts>(() => {
    if (!endDate) return { month: '', day: '', year: '' }
    const parts = endDate.split('-')
    return {
      month: parts[0] || '',
      day: parts[1] || '',
      year: parts[2] || ''
    }
  })

  // Update when props change
  useEffect(() => {
    if (startDate) {
      const parts = startDate.split('-')
      setStartDateParts({
        month: parts[0] || '',
        day: parts[1] || '',
        year: parts[2] || ''
      })
    } else {
      setStartDateParts({ month: '', day: '', year: '' })
    }
  }, [startDate])

  useEffect(() => {
    if (endDate) {
      const parts = endDate.split('-')
      setEndDateParts({
        month: parts[0] || '',
        day: parts[1] || '',
        year: parts[2] || ''
      })
    } else {
      setEndDateParts({ month: '', day: '', year: '' })
    }
  }, [endDate])

  // Combine date parts into MM-DD-YYYY format
  const formatDateString = (parts: DateParts): string => {
    if (!parts.month && !parts.day && !parts.year) return ''
    const month = parts.month.padStart(2, '0')
    const day = parts.day.padStart(2, '0')
    return `${month}-${day}-${parts.year}`
  }

  // Handle input changes
  const handleInputChange = (
    part: 'month' | 'day' | 'year',
    value: string,
    dateType: 'start' | 'end'
  ) => {
    // Only allow numbers
    if (value !== '' && !/^\d+$/.test(value)) return

    // Apply specific validations
    if (part === 'month') {
      const monthNum = parseInt(value)
      if (value !== '' && (monthNum < 1 || monthNum > 12)) return
      if (value.length > 2) return
    } else if (part === 'day') {
      const dayNum = parseInt(value)
      if (value !== '' && (dayNum < 1 || dayNum > 31)) return
      if (value.length > 2) return
    } else if (part === 'year') {
      if (value.length > 4) return
    }

    // Update the appropriate date part
    if (dateType === 'start') {
      const newParts = { ...startDateParts, [part]: value }
      setStartDateParts(newParts)
      onChange(formatDateString(newParts), formatDateString(endDateParts))
    } else {
      const newParts = { ...endDateParts, [part]: value }
      setEndDateParts(newParts)
      onChange(formatDateString(startDateParts), formatDateString(newParts))
    }
  }

  return (
    <div className="w-full space-y-3">
      {/* From Date */}
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">From</label>
        <div className="flex gap-2">
          <div className="w-1/3">
            <input
              type="text"
              placeholder="MM"
              className="w-full p-2 text-xs border border-border rounded text-center bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-tertiary focus:border-tertiary"
              value={startDateParts.month}
              onChange={(e) => handleInputChange('month', e.target.value, 'start')}
              maxLength={2}
            />
            <div className="text-[10px] text-muted-foreground text-center mt-1">Month</div>
          </div>
          <div className="w-1/3">
            <input
              type="text"
              placeholder="DD"
              className="w-full p-2 text-xs border border-border rounded text-center bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-tertiary focus:border-tertiary"
              value={startDateParts.day}
              onChange={(e) => handleInputChange('day', e.target.value, 'start')}
              maxLength={2}
            />
            <div className="text-[10px] text-muted-foreground text-center mt-1">Day</div>
          </div>
          <div className="w-1/3">
            <input
              type="text"
              placeholder="YYYY"
              className="w-full p-2 text-xs border border-border rounded text-center bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-tertiary focus:border-tertiary"
              value={startDateParts.year}
              onChange={(e) => handleInputChange('year', e.target.value, 'start')}
              maxLength={4}
            />
            <div className="text-[10px] text-muted-foreground text-center mt-1">Year</div>
          </div>
        </div>
      </div>

      {/* To Date */}
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">To</label>
        <div className="flex gap-2">
          <div className="w-1/3">
            <input
              type="text"
              placeholder="MM"
              className="w-full p-2 text-xs border border-border rounded text-center bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-tertiary focus:border-tertiary"
              value={endDateParts.month}
              onChange={(e) => handleInputChange('month', e.target.value, 'end')}
              maxLength={2}
            />
            <div className="text-[10px] text-muted-foreground text-center mt-1">Month</div>
          </div>
          <div className="w-1/3">
            <input
              type="text"
              placeholder="DD"
              className="w-full p-2 text-xs border border-border rounded text-center bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-tertiary focus:border-tertiary"
              value={endDateParts.day}
              onChange={(e) => handleInputChange('day', e.target.value, 'end')}
              maxLength={2}
            />
            <div className="text-[10px] text-muted-foreground text-center mt-1">Day</div>
          </div>
          <div className="w-1/3">
            <input
              type="text"
              placeholder="YYYY"
              className="w-full p-2 text-xs border border-border rounded text-center bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-tertiary focus:border-tertiary"
              value={endDateParts.year}
              onChange={(e) => handleInputChange('year', e.target.value, 'end')}
              maxLength={4}
            />
            <div className="text-[10px] text-muted-foreground text-center mt-1">Year</div>
          </div>
        </div>
      </div>
    </div>
  )
}
