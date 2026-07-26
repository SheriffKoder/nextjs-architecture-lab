'use client'

import { DatesCluster } from './dates'
import { ModeDropdown, type TimelineViewMode } from './mode'
import { ZoomDropdown } from './zoom'
import { PillShell, PillDot } from './chrome'

export type { TimelineViewMode }

export interface HeaderWrapperProps {
  views: string[]
  selectedView: TimelineViewMode
  onViewChange: (view: TimelineViewMode) => void
  zoomFactor: number
  onZoomChange: (factor: number) => void
  selectedDate: string
  onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  isTodayInRange: boolean
  onGoToToday: () => void
  onScrollLeft: () => void
  onScrollRight: () => void
}

/** Timeline view-header orchestrator — single pill chrome. */
export function HeaderWrapper({
  views,
  selectedView,
  onViewChange,
  zoomFactor,
  onZoomChange,
  selectedDate,
  onDateChange,
  isTodayInRange,
  onGoToToday,
  onScrollLeft,
  onScrollRight,
}: HeaderWrapperProps) {
  return (
    <div className="flex w-full shrink-0 justify-center py-2">
      <PillShell>
        <DatesCluster
          onScrollLeft={onScrollLeft}
          onScrollRight={onScrollRight}
          onGoToToday={onGoToToday}
          isTodayInRange={isTodayInRange}
          selectedDate={selectedDate}
          onDateChange={onDateChange}
        />
        <ModeDropdown
          views={views}
          selectedView={selectedView}
          onViewChange={onViewChange}
        />
        <PillDot />
        <ZoomDropdown value={zoomFactor} onZoomChange={onZoomChange} />
      </PillShell>
    </div>
  )
}
