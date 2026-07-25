/**
 * Icon trigger → date range dropdown (ReactDateFilterDropDown).
 */

'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Calendar } from 'lucide-react'
import ReactDateFilterDropDown from '@/platform/url-kit/filters/feature-filtering/components/single-date-filter/ReactDateFilterDropDown'
import { useUrlFilters } from '@/platform/url-kit/filters/feature-filtering/hooks/useUrlFilters'
import {
  detectDateFilterMode,
  type DateFilterMode,
} from '@/platform/url-kit/filters/feature-filtering/components/single-date-filter/date-display-utils'
import { IconTriggerButton } from '../shared/icon-trigger-button'

export interface DateControlProps {
  filterKey: string
  buttonText?: string
  showDateFilterHeader?: boolean
}

export function DateControl({
  filterKey,
  buttonText = 'Filter by Date',
  showDateFilterHeader = true,
}: DateControlProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedMode, setSelectedMode] = useState<DateFilterMode>('day')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const { getRange, setRange, remove } = useUrlFilters()
  const dateRange = getRange(filterKey)
  const hasActiveFilters =
    dateRange !== null && Boolean(dateRange.start || dateRange.end)
  const currentStartDate = dateRange?.start || ''
  const currentEndDate = dateRange?.end || ''

  useEffect(() => {
    if (hasActiveFilters && currentStartDate && currentEndDate) {
      const detected = detectDateFilterMode(currentStartDate, currentEndDate)
      if (detected) setSelectedMode(detected)
    }
  }, [hasActiveFilters, currentStartDate, currentEndDate])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isDropdownOpen])

  const handleDateRangeChange = (
    startDate: string,
    endDate: string,
    mode: DateFilterMode
  ) => {
    setSelectedMode(mode)
    if (startDate && endDate) {
      setRange(filterKey, startDate, endDate)
    } else {
      remove(filterKey)
    }
  }

  const handleReset = () => {
    setSelectedMode('day')
    remove(filterKey)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <IconTriggerButton
        ref={buttonRef}
        active={hasActiveFilters || isDropdownOpen}
        onClick={() => setIsDropdownOpen((v) => !v)}
        title={hasActiveFilters ? 'Date filter active' : buttonText}
        aria-label={hasActiveFilters ? 'Date filter active' : buttonText}
        aria-expanded={isDropdownOpen}
        aria-haspopup="dialog"
      >
        <Calendar aria-hidden className="w-4 h-4" />
      </IconTriggerButton>

      <div
        className={`absolute top-full right-0 z-50 mt-1 transition-opacity duration-200 ${
          isDropdownOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none invisible'
        }`}
      >
        <ReactDateFilterDropDown
          onDateRangeChange={handleDateRangeChange}
          selectedStartDate={currentStartDate}
          selectedEndDate={currentEndDate}
          buttonText={buttonText}
          width="300px"
          selectedDateMode={selectedMode}
          setSelectedDateMode={setSelectedMode}
          initialStartDate={currentStartDate}
          initialEndDate={currentEndDate}
          onReset={handleReset}
          setIsDropdownOpen={setIsDropdownOpen}
          showDateFilterHeader={showDateFilterHeader}
        />
      </div>
    </div>
  )
}
