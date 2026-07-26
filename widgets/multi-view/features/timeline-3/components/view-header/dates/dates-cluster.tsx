'use client'

import { cn } from '@/shared/lib/utils'
import { PrevButton } from './prev-button'
import { TodayButton } from './today-button'
import { NextButton } from './next-button'
import { CalendarInput } from './calendar-input'
import { PillSeparator } from '../chrome'

export interface DatesClusterProps {
  onScrollLeft: () => void
  onScrollRight: () => void
  onGoToToday: () => void
  isTodayInRange: boolean
  selectedDate: string
  onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
}

/**
 * Left half of the pill: prev · today · next | calendar.
 * Layout only — handlers come from HeaderWrapper.
 */
export function DatesCluster({
  onScrollLeft,
  onScrollRight,
  onGoToToday,
  isTodayInRange,
  selectedDate,
  onDateChange,
  className,
}: DatesClusterProps) {
  return (
    <div className={cn('inline-flex items-center gap-0.5', className)}>
      <PrevButton onClick={onScrollLeft} />
      <TodayButton onClick={onGoToToday} isTodayInRange={isTodayInRange} />
      <NextButton onClick={onScrollRight} />
      <PillSeparator />
      <CalendarInput value={selectedDate} onChange={onDateChange} />
    </div>
  )
}
