/**
 * Icon trigger → date range dropdown (ReactDateFilterDropDown).
 * Panel placement lives in `use-anchored-panel-position`.
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Calendar } from 'lucide-react'
import ReactDateFilterDropDown from '@/platform/url-kit/filters/feature-filtering/components/single-date-filter/ReactDateFilterDropDown'
import { useUrlFilters } from '@/platform/url-kit/filters/feature-filtering/hooks/useUrlFilters'
import {
  detectDateFilterMode,
  type DateFilterMode,
} from '@/platform/url-kit/filters/feature-filtering/components/single-date-filter/date-display-utils'
import { IconTriggerButton } from '../shared/icon-trigger-button'
import { useAnchoredPanelPosition } from './use-anchored-panel-position'

export interface DateControlProps {
  filterKey: string
  /** Field label from filter config (e.g. "Rental Start Date"). */
  filterLabel?: string
  buttonText?: string
  showDateFilterHeader?: boolean
  /** Dropdown panel surface (e.g. `bg-background`). */
  panelClassName?: string
}

export function DateControl({
  filterKey,
  filterLabel,
  buttonText,
  showDateFilterHeader = true,
  panelClassName,
}: DateControlProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedMode, setSelectedMode] = useState<DateFilterMode>('day')

  const closeDropdown = useCallback(() => setIsDropdownOpen(false), [])
  const { triggerRef, panelRef, position, hasPositioned } =
    useAnchoredPanelPosition({
      isOpen: isDropdownOpen,
      repositionKey: selectedMode,
      onClose: closeDropdown,
    })

  const resolvedLabel = filterLabel?.trim() || undefined
  const resolvedButtonText =
    buttonText?.trim() ||
    (resolvedLabel ? `Filter by ${resolvedLabel}` : 'Filter by Date')

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

  const triggerTitle = hasActiveFilters
    ? resolvedLabel
      ? `${resolvedLabel} filter active`
      : 'Date filter active'
    : resolvedButtonText

  const dropdown =
    isDropdownOpen && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={panelRef}
            className="fixed z-50"
            style={{
              top: position.top,
              left: position.left,
              visibility: hasPositioned ? 'visible' : 'hidden',
            }}
          >
            <ReactDateFilterDropDown
              onDateRangeChange={handleDateRangeChange}
              selectedStartDate={currentStartDate}
              selectedEndDate={currentEndDate}
              buttonText={resolvedButtonText}
              filterLabel={resolvedLabel}
              width="fit-content"
              selectedDateMode={selectedMode}
              setSelectedDateMode={setSelectedMode}
              initialStartDate={currentStartDate}
              initialEndDate={currentEndDate}
              onReset={handleReset}
              setIsDropdownOpen={setIsDropdownOpen}
              showDateFilterHeader={showDateFilterHeader}
              panelClassName={panelClassName}
            />
          </div>,
          document.body,
        )
      : null

  return (
    <div className="relative">
      <IconTriggerButton
        ref={triggerRef}
        active={hasActiveFilters || isDropdownOpen}
        onClick={() => setIsDropdownOpen((v) => !v)}
        title={triggerTitle}
        aria-label={triggerTitle}
        aria-expanded={isDropdownOpen}
        aria-haspopup="dialog"
      >
        <Calendar aria-hidden className="w-4 h-4" />
      </IconTriggerButton>
      {dropdown}
    </div>
  )
}
